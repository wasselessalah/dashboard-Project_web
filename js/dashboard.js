/**
 * DataDash - Dashboard Page Script
 * Scripts pour la page tableau de bord
 */

// Global variables
let usersData = [];
let countriesData = [];
let recentSearches = [];

// Initialize on page load
$(document).ready(function() {
    // Load all data at startup
    loadUsers();
    loadWeather();
    loadCountries();
    searchFood(); // Load food products automatically
    
    // Tab change handlers - reload data when switching tabs if needed
    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
        const targetId = $(e.target).attr('data-bs-target');
        if (targetId === '#countries' && countriesData.length === 0) {
            loadCountries();
        }
        if (targetId === '#food' && $('#food-container').children().length === 0) {
            searchFood();
        }
    });
});

// Refresh all data
function refreshAllData() {
    loadUsers();
    loadWeather();
    loadCountries();
    Utils.showToast('Données actualisées avec succès', 'success');
}

// ========================================
// Users Functions
// ========================================
function loadUsers() {
    const nationality = $('#user-nationality').val();
    Utils.showLoading('#users-table-container');
    
    ApiService.getRandomUsers(25, nationality)
        .done(function(data) {
            usersData = data.results;
            displayUsersTable(usersData);
            updateUserStats(usersData);
            createUserCharts(usersData);
            $('#total-users').text(usersData.length);
        })
        .fail(function() {
            Utils.showError('#users-table-container', 'Erreur lors du chargement des utilisateurs');
        });
}

function displayUsersTable(users) {
    const tableData = users.map(user => [
        `<img src="${user.picture.thumbnail}" class="rounded-circle" width="40">`,
        `${user.name.first} ${user.name.last}`,
        user.email,
        user.location.country,
        user.dob.age
    ]);

    $('#users-table-container').html(`
        <table id="users-table" class="table table-striped table-hover" style="width:100%">
            <thead>
                <tr>
                    <th>Photo</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Pays</th>
                    <th>Âge</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `);

    DataTableManager.initTable('users-table', tableData, [
        { title: 'Photo' },
        { title: 'Nom' },
        { title: 'Email' },
        { title: 'Pays' },
        { title: 'Âge' }
    ]);
}

function updateUserStats(users) {
    const males = users.filter(u => u.gender === 'male').length;
    const females = users.filter(u => u.gender === 'female').length;
    const avgAge = Math.round(users.reduce((sum, u) => sum + u.dob.age, 0) / users.length);
}

function createUserCharts(users) {
    // Gender chart
    const males = users.filter(u => u.gender === 'male').length;
    const females = users.filter(u => u.gender === 'female').length;
    ChartManager.createPieChart('gender-chart', 
        ['Hommes', 'Femmes'], 
        [males, females],
        ['rgba(67, 97, 238, 0.8)', 'rgba(247, 37, 133, 0.8)']
    );

    // Age chart
    const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46-55': 0,
        '56+': 0
    };
    users.forEach(u => {
        const age = u.dob.age;
        if (age <= 25) ageGroups['18-25']++;
        else if (age <= 35) ageGroups['26-35']++;
        else if (age <= 45) ageGroups['36-45']++;
        else if (age <= 55) ageGroups['46-55']++;
        else ageGroups['56+']++;
    });
    ChartManager.createBarChart('age-chart',
        Object.keys(ageGroups),
        Object.values(ageGroups),
        'Nombre d\'utilisateurs'
    );
}

// ========================================
// Countries Functions
// ========================================
function loadCountries() {
    const region = $('#region-filter').val();
    const search = $('#country-search').val().trim().toLowerCase();
    
    Utils.showLoading('#countries-container');
    
    let request;
    if (search) {
        request = ApiService.getCountryByName(search);
    } else if (region) {
        request = ApiService.getCountriesByRegion(region);
    } else {
        request = ApiService.getAllCountries();
    }
    
    request
        .done(function(data) {
            if (data && data.length > 0) {
                countriesData = Array.isArray(data) ? data.slice(0, 24) : [data];
                displayCountries(countriesData);
                $('#total-countries').text(countriesData.length);
            } else {
                showCountriesError('Aucun pays trouvé');
            }
        })
        .fail(function(xhr, status, error) {
            console.error('Countries API error:', error);
            showCountriesError('Aucun pays trouvé');
        });
}

function showCountriesError(message) {
    $('#countries-container').html(`
        <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <p class="text-danger">${message}</p>
            <button class="btn btn-danger" onclick="loadCountries()">
                <i class="fas fa-redo me-2"></i>Réessayer
            </button>
        </div>
    `);
    $('#total-countries').text('0');
}

function displayCountries(countries) {
    let html = '';
    countries.forEach(country => {
        const population = (country.population / 1000000).toFixed(1);
        const capital = country.capital ? country.capital[0] : 'N/A';
        const currencies = country.currencies ? Object.keys(country.currencies)[0] : 'N/A';
        
        html += `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="country-card hover-lift">
                    <img src="${country.flags.png}" alt="${country.name.common}">
                    <h5 class="mb-1">${country.name.common}</h5>
                    <p class="text-muted small mb-2">${country.region}</p>
                    <div class="row text-center small">
                        <div class="col-6">
                            <i class="fas fa-users text-primary"></i>
                            <span class="d-block">${population}M</span>
                        </div>
                        <div class="col-6">
                            <i class="fas fa-city text-success"></i>
                            <span class="d-block">${capital}</span>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="badge bg-secondary">${currencies}</span>
                    </div>
                </div>
            </div>
        `;
    });
    $('#countries-container').html(html);
}

// ========================================
// Weather Functions
// ========================================
function loadWeather() {
    const city = $('#city-search').val() || 'Paris';
    
    $('#weather-main').html(`
        <div class="text-center py-5">
            <div class="spinner-border text-light" role="status"></div>
            <p class="mt-2 mb-0">Chargement des données météo...</p>
        </div>
    `);
    
    ApiService.getWeather(city)
        .done(function(data) {
            displayWeather(data, city);
            createWeatherChart(data);
            $('#current-temp').text(data.current_condition[0].temp_C + '°C');
        })
        .fail(function() {
            $('#weather-main').html(`
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                    <p class="mb-0">Impossible de charger les données météo</p>
                </div>
            `);
        });
}

function displayWeather(data, city) {
    const current = data.current_condition[0];
    const weatherDesc = current.weatherDesc[0].value;
    
    let weatherIcon = 'fas fa-sun';
    if (weatherDesc.toLowerCase().includes('cloud')) weatherIcon = 'fas fa-cloud';
    else if (weatherDesc.toLowerCase().includes('rain')) weatherIcon = 'fas fa-cloud-rain';
    else if (weatherDesc.toLowerCase().includes('snow')) weatherIcon = 'fas fa-snowflake';
    else if (weatherDesc.toLowerCase().includes('thunder')) weatherIcon = 'fas fa-bolt';
    
    const html = `
        <div class="text-center">
            <h3 class="mb-0">${city}</h3>
            <p class="opacity-75 mb-3">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <i class="${weatherIcon} fa-4x mb-3"></i>
            <div class="display-2 fw-bold">${current.temp_C}°C</div>
            <p class="lead mb-4">${weatherDesc}</p>
            <div class="row text-center">
                <div class="col-4">
                    <i class="fas fa-tint mb-2"></i>
                    <p class="mb-0">${current.humidity}%</p>
                    <small class="opacity-75">Humidité</small>
                </div>
                <div class="col-4">
                    <i class="fas fa-wind mb-2"></i>
                    <p class="mb-0">${current.windspeedKmph} km/h</p>
                    <small class="opacity-75">Vent</small>
                </div>
                <div class="col-4">
                    <i class="fas fa-compress-arrows-alt mb-2"></i>
                    <p class="mb-0">${current.pressure} hPa</p>
                    <small class="opacity-75">Pression</small>
                </div>
            </div>
        </div>
    `;
    $('#weather-main').html(html);

    // Weather details
    const detailsHtml = `
        <div class="col-md-4">
            <div class="data-card text-center p-4">
                <i class="fas fa-eye fa-2x text-info mb-2"></i>
                <h4>${current.visibility} km</h4>
                <p class="text-muted mb-0">Visibilité</p>
            </div>
        </div>
        <div class="col-md-4">
            <div class="data-card text-center p-4">
                <i class="fas fa-thermometer-half fa-2x text-danger mb-2"></i>
                <h4>${current.FeelsLikeC}°C</h4>
                <p class="text-muted mb-0">Ressenti</p>
            </div>
        </div>
        <div class="col-md-4">
            <div class="data-card text-center p-4">
                <i class="fas fa-cloud fa-2x text-secondary mb-2"></i>
                <h4>${current.cloudcover}%</h4>
                <p class="text-muted mb-0">Couverture nuageuse</p>
            </div>
        </div>
    `;
    $('#weather-details').html(detailsHtml);
}

function createWeatherChart(data) {
    const forecast = data.weather;
    const labels = forecast.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
    });
    const maxTemps = forecast.map(d => d.maxtempC);
    const minTemps = forecast.map(d => d.mintempC);

    ChartManager.createLineChart('weather-chart', labels, [
        {
            label: 'Temp. Max',
            data: maxTemps,
            borderColor: 'rgba(247, 37, 133, 1)',
            backgroundColor: 'rgba(247, 37, 133, 0.1)',
            fill: true
        },
        {
            label: 'Temp. Min',
            data: minTemps,
            borderColor: 'rgba(67, 97, 238, 1)',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            fill: true
        }
    ]);
}

// ========================================
// Food Functions
// ========================================
function searchFood() {
    const query = $('#food-search').val() || 'chocolate';
    Utils.showLoading('#food-container');
    
    ApiService.searchFoodProducts(query)
        .done(function(data) {
            if (data && data.products && data.products.length > 0) {
                displayFoodProducts(data.products.slice(0, 12));
                $('#total-products').text(data.count || data.products.length);
            } else {
                showFoodError('Aucun produit trouvé');
            }
        })
        .fail(function(xhr, status, error) {
            console.error('Food API error:', error);
            showFoodError('Erreur lors de la recherche');
        });
}

function showFoodError(message) {
    $('#food-container').html(`
        <div class="col-12 text-center py-5">
            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <p class="text-muted">${message}</p>
            <button class="btn btn-primary" onclick="searchFood()">
                <i class="fas fa-redo me-2"></i>Réessayer
            </button>
        </div>
    `);
    $('#total-products').text('0');
}

function displayFoodProducts(products) {
    let html = '';
    products.forEach(product => {
        const name = product.product_name || 'Produit inconnu';
        const brand = product.brands || 'Marque inconnue';
        const image = product.image_small_url || 'https://via.placeholder.com/150?text=No+Image';
        const nutriscore = product.nutriscore_grade || 'n';
        const energy = product.nutriments && product.nutriments.energy_100g 
            ? Math.round(product.nutriments.energy_100g / 4.184) + ' kcal' 
            : 'N/A';
        
        html += `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="food-card hover-lift">
                    <img src="${image}" alt="${name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="mb-0" style="max-width: 70%;">${name.substring(0, 30)}${name.length > 30 ? '...' : ''}</h6>
                            <div class="nutriscore nutriscore-${nutriscore}">${nutriscore.toUpperCase()}</div>
                        </div>
                        <p class="text-muted small mb-2">${brand}</p>
                        <span class="badge bg-light text-dark">
                            <i class="fas fa-fire text-danger me-1"></i>${energy}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    if (products.length === 0) {
        html = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucun produit trouvé</p>
            </div>
        `;
    }
    
    $('#food-container').html(html);
}

// ========================================
// Postal Code Functions
// ========================================
function searchPostalCode() {
    const country = $('#postal-country').val();
    const code = $('#postal-code').val();
    
    if (!code) {
        Utils.showToast('Veuillez entrer un code postal', 'warning');
        return;
    }
    
    $('#postal-result').html(`
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">Recherche en cours...</p>
        </div>
    `);
    
    ApiService.getPostalInfo(country, code)
        .done(function(data) {
            displayPostalResult(data);
            addToRecentSearches(country, code, data);
        })
        .fail(function() {
            $('#postal-result').html(`
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <p class="text-muted">Code postal non trouvé</p>
                </div>
            `);
        });
}

function displayPostalResult(data) {
    const place = data.places[0];
    const html = `
        <div class="postal-result">
            <div class="text-center mb-4">
                <i class="fas fa-map-marker-alt fa-3x mb-2"></i>
                <h3 class="mb-0">${place['place name']}</h3>
                <p class="opacity-75">${data['post code']}</p>
            </div>
            <div class="row text-center">
                <div class="col-6">
                    <h5>${place.state}</h5>
                    <small class="opacity-75">Région/État</small>
                </div>
                <div class="col-6">
                    <h5>${data.country}</h5>
                    <small class="opacity-75">Pays</small>
                </div>
            </div>
            <hr class="my-3 opacity-25">
            <div class="row text-center small">
                <div class="col-6">
                    <i class="fas fa-compass me-1"></i>
                    <span>Lat: ${place.latitude}</span>
                </div>
                <div class="col-6">
                    <i class="fas fa-compass me-1"></i>
                    <span>Lng: ${place.longitude}</span>
                </div>
            </div>
        </div>
    `;
    $('#postal-result').html(html);
}

function addToRecentSearches(country, code, data) {
    const place = data.places[0];
    recentSearches.unshift({
        country: data.country,
        code: code,
        place: place['place name']
    });
    
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }
    
    let html = '<ul class="list-group list-group-flush">';
    recentSearches.forEach((search, index) => {
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>
                    <i class="fas fa-map-pin text-primary me-2"></i>
                    ${search.place}
                </span>
                <span class="badge bg-primary">${search.code}</span>
            </li>
        `;
    });
    html += '</ul>';
    
    $('#recent-searches').html(html);
}
