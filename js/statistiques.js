/**
 * DataDash - Statistics Page Script
 * Scripts pour la page statistiques
 */

// Global data storage
let allCountries = [];
let allUsers = [];
let populationChartInstance = null;

// Initialize on page load
$(document).ready(function() {
    loadAllData();
});

// Refresh all statistics
function refreshAllStats() {
    loadAllData();
    Utils.showToast('Statistiques actualisées', 'success');
}

// Load all data
function loadAllData() {
    // Load countries data
    $.ajax({
        url: 'https://restcountries.com/v3.1/all',
        method: 'GET',
        success: function(data) {
            allCountries = data;
            processCountriesData(data);
        },
        error: function() {
            console.error('Error loading countries');
        }
    });

    // Load users data
    $.ajax({
        url: 'https://randomuser.me/api/?results=50',
        method: 'GET',
        success: function(data) {
            allUsers = data.results;
            processUsersData(data.results);
        },
        error: function() {
            console.error('Error loading users');
        }
    });
}

// Process countries data
function processCountriesData(countries) {
    // Update stats
    $('#stat-countries').text(countries.length);
    
    const totalPopulation = countries.reduce((sum, c) => sum + (c.population || 0), 0);
    $('#stat-population').text((totalPopulation / 1000000000).toFixed(2));

    // Population by region
    const regionData = {};
    countries.forEach(c => {
        const region = c.region || 'Other';
        if (!regionData[region]) {
            regionData[region] = 0;
        }
        regionData[region] += c.population || 0;
    });

    createPopulationChart(regionData, 'bar');

    // Countries by continent
    const continentCounts = {};
    countries.forEach(c => {
        const region = c.region || 'Other';
        continentCounts[region] = (continentCounts[region] || 0) + 1;
    });

    ChartManager.createPieChart('continents-chart',
        Object.keys(continentCounts),
        Object.values(continentCounts)
    );

    // Top languages
    const languageCounts = {};
    countries.forEach(c => {
        if (c.languages) {
            Object.values(c.languages).forEach(lang => {
                languageCounts[lang] = (languageCounts[lang] || 0) + 1;
            });
        }
    });
    const topLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    ChartManager.createBarChart('languages-chart',
        topLanguages.map(l => l[0].substring(0, 10)),
        topLanguages.map(l => l[1]),
        'Nombre de pays'
    );

    // Top currencies
    const currencyCounts = {};
    countries.forEach(c => {
        if (c.currencies) {
            Object.keys(c.currencies).forEach(curr => {
                currencyCounts[curr] = (currencyCounts[curr] || 0) + 1;
            });
        }
    });
    const topCurrencies = Object.entries(currencyCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    ChartManager.createPieChart('currencies-chart',
        topCurrencies.map(c => c[0]),
        topCurrencies.map(c => c[1])
    );

    // Top countries by population
    const topByPopulation = [...countries]
        .filter(c => c.population)
        .sort((a, b) => b.population - a.population)
        .slice(0, 10);

    let popHtml = '';
    topByPopulation.forEach((c, i) => {
        popHtml += `
            <tr>
                <td><span class="badge bg-primary">${i + 1}</span></td>
                <td>
                    <img src="${c.flags.png}" width="24" class="me-2 rounded">
                    ${c.name.common}
                </td>
                <td>${Utils.formatNumber(c.population)}</td>
                <td><span class="badge bg-secondary">${c.region}</span></td>
            </tr>
        `;
    });
    $('#top-countries-body').html(popHtml);

    // Top countries by area
    const topByArea = [...countries]
        .filter(c => c.area)
        .sort((a, b) => b.area - a.area)
        .slice(0, 10);

    let areaHtml = '';
    topByArea.forEach((c, i) => {
        const density = c.population && c.area ? Math.round(c.population / c.area) : 0;
        areaHtml += `
            <tr>
                <td><span class="badge bg-info">${i + 1}</span></td>
                <td>
                    <img src="${c.flags.png}" width="24" class="me-2 rounded">
                    ${c.name.common}
                </td>
                <td>${Utils.formatNumber(Math.round(c.area))} km²</td>
                <td>${density} hab/km²</td>
            </tr>
        `;
    });
    $('#top-area-body').html(areaHtml);
}

// Create population chart
function createPopulationChart(data, type) {
    const ctx = document.getElementById('population-chart');
    
    if (populationChartInstance) {
        populationChartInstance.destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data).map(v => v / 1000000000); // Convert to billions

    populationChartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: 'Population (milliards)',
                data: values,
                backgroundColor: Utils.getChartColors(labels.length),
                borderColor: type === 'line' ? 'rgba(67, 97, 238, 1)' : undefined,
                borderWidth: type === 'line' ? 3 : 0,
                borderRadius: type === 'bar' ? 8 : 0,
                fill: type === 'line',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + ' Mrd';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Show population chart in different format
function showPopulationChart(type) {
    const regionData = {};
    allCountries.forEach(c => {
        const region = c.region || 'Other';
        if (!regionData[region]) {
            regionData[region] = 0;
        }
        regionData[region] += c.population || 0;
    });
    
    createPopulationChart(regionData, type);
    
    // Update active button
    $('.btn-group .btn').removeClass('active');
    $(`.btn-group .btn:contains('${type === 'bar' ? 'Barres' : 'Lignes'}')`).addClass('active');
}

// Process users data
function processUsersData(users) {
    $('#stat-users').text(users.length);

    // Average age
    const avgAge = Math.round(users.reduce((sum, u) => sum + u.dob.age, 0) / users.length);
    $('#stat-age').text(avgAge);

    // Gender distribution
    const males = users.filter(u => u.gender === 'male').length;
    const females = users.filter(u => u.gender === 'female').length;

    ChartManager.createPieChart('gender-pie-chart',
        ['Hommes', 'Femmes'],
        [males, females],
        ['rgba(67, 97, 238, 0.8)', 'rgba(247, 37, 133, 0.8)']
    );

    // Age distribution
    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56-65': 0,
        '65+': 0
    };
    users.forEach(u => {
        const age = u.dob.age;
        if (age <= 25) ageGroups['18-25']++;
        else if (age <= 35) ageGroups['26-35']++;
        else if (age <= 45) ageGroups['36-45']++;
        else if (age <= 55) ageGroups['46-55']++;
        else if (age <= 65) ageGroups['56-65']++;
        else ageGroups['65+']++;
    });

    ChartManager.createBarChart('age-distribution-chart',
        Object.keys(ageGroups),
        Object.values(ageGroups),
        'Nombre d\'utilisateurs'
    );

    // Users by country
    const countryCounts = {};
    users.forEach(u => {
        const country = u.location.country;
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    ChartManager.createBarChart('users-country-chart',
        topCountries.map(c => c[0]),
        topCountries.map(c => c[1]),
        'Nombre d\'utilisateurs'
    );

    // Users table
    displayUsersTable(users);
}

// Display users in DataTable
function displayUsersTable(users) {
    const tableData = users.map(user => [
        `<img src="${user.picture.thumbnail}" class="rounded-circle" width="40">`,
        `${user.name.first} ${user.name.last}`,
        user.email,
        user.location.country,
        user.dob.age,
        `<span class="badge ${user.gender === 'male' ? 'bg-primary' : 'bg-danger'}">${user.gender === 'male' ? 'H' : 'F'}</span>`,
        new Date(user.registered.date).toLocaleDateString('fr-FR')
    ]);

    if ($.fn.DataTable.isDataTable('#users-stats-table')) {
        $('#users-stats-table').DataTable().destroy();
    }

    $('#users-stats-table').DataTable({
        data: tableData,
        columns: [
            { title: 'Photo' },
            { title: 'Nom' },
            { title: 'Email' },
            { title: 'Pays' },
            { title: 'Âge' },
            { title: 'Genre' },
            { title: 'Inscrit le' }
        ],
        responsive: true,
        language: {
            search: "Rechercher:",
            lengthMenu: "Afficher _MENU_ entrées",
            info: "Affichage de _START_ à _END_ sur _TOTAL_ entrées",
            paginate: {
                first: "Premier",
                last: "Dernier",
                next: "Suivant",
                previous: "Précédent"
            }
        },
        pageLength: 10
    });
}

// Load more users
function loadMoreUsers() {
    $.ajax({
        url: 'https://randomuser.me/api/?results=25',
        method: 'GET',
        success: function(data) {
            allUsers = [...allUsers, ...data.results];
            processUsersData(allUsers);
            Utils.showToast(`${data.results.length} nouveaux utilisateurs ajoutés`, 'success');
        },
        error: function() {
            Utils.showToast('Erreur lors du chargement', 'danger');
        }
    });
}
