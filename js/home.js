/**
 * DataDash - Home Page Script
 * Scripts pour la page d'accueil
 */

$(document).ready(function() {
    // Load weather widget
    loadWeatherWidget();
    // Load random user widget
    loadRandomUserWidget();
    // Load country widget
    loadCountryWidget();
});

function loadWeatherWidget() {
    // Using wttr.in API (no key required)
    $.ajax({
        url: 'https://wttr.in/Paris?format=j1',
        method: 'GET',
        success: function(data) {
            const current = data.current_condition[0];
            const html = `
                <div class="text-center">
                    <h3 class="mb-1">Paris, France</h3>
                    <div class="display-4 fw-bold text-info">${current.temp_C}°C</div>
                    <p class="text-muted mb-2">${current.weatherDesc[0].value}</p>
                    <div class="row text-center mt-3">
                        <div class="col-4">
                            <i class="fas fa-tint text-info"></i>
                            <small class="d-block text-muted">${current.humidity}%</small>
                            <small class="text-muted">Humidité</small>
                        </div>
                        <div class="col-4">
                            <i class="fas fa-wind text-info"></i>
                            <small class="d-block text-muted">${current.windspeedKmph} km/h</small>
                            <small class="text-muted">Vent</small>
                        </div>
                        <div class="col-4">
                            <i class="fas fa-eye text-info"></i>
                            <small class="d-block text-muted">${current.visibility} km</small>
                            <small class="text-muted">Visibilité</small>
                        </div>
                    </div>
                </div>
            `;
            $('#weather-widget').html(html);
        },
        error: function() {
            $('#weather-widget').html('<div class="text-center text-danger"><i class="fas fa-exclamation-circle fa-2x mb-2"></i><p>Erreur de chargement</p></div>');
        }
    });
}

function loadRandomUserWidget() {
    $.ajax({
        url: 'https://randomuser.me/api/',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            const user = data.results[0];
            const html = `
                <div class="text-center">
                    <img src="${user.picture.large}" class="rounded-circle mb-3" width="80" alt="User">
                    <h5 class="mb-1">${user.name.first} ${user.name.last}</h5>
                    <p class="text-muted small mb-2"><i class="fas fa-envelope me-1"></i>${user.email}</p>
                    <p class="text-muted small mb-2"><i class="fas fa-map-marker-alt me-1"></i>${user.location.city}, ${user.location.country}</p>
                    <span class="badge bg-success">${user.gender === 'male' ? 'Homme' : 'Femme'}</span>
                    <span class="badge bg-info">${user.dob.age} ans</span>
                </div>
            `;
            $('#user-widget').html(html);
        },
        error: function() {
            $('#user-widget').html('<div class="text-center text-danger"><i class="fas fa-exclamation-circle fa-2x mb-2"></i><p>Erreur de chargement</p></div>');
        }
    });
}

function loadCountryWidget() {
    const countries = ['france', 'germany', 'spain', 'italy', 'japan', 'brazil', 'canada', 'australia'];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    
    $.ajax({
        url: `https://restcountries.com/v3.1/name/${randomCountry}`,
        method: 'GET',
        success: function(data) {
            const country = data[0];
            const html = `
                <div class="text-center">
                    <img src="${country.flags.png}" class="mb-3 shadow-sm" width="100" alt="Flag">
                    <h5 class="mb-1">${country.name.common}</h5>
                    <p class="text-muted small mb-2">${country.name.official}</p>
                    <div class="row text-center mt-3">
                        <div class="col-6">
                            <i class="fas fa-users text-primary"></i>
                            <small class="d-block">${(country.population / 1000000).toFixed(1)}M</small>
                            <small class="text-muted">Population</small>
                        </div>
                        <div class="col-6">
                            <i class="fas fa-city text-primary"></i>
                            <small class="d-block">${country.capital ? country.capital[0] : 'N/A'}</small>
                            <small class="text-muted">Capitale</small>
                        </div>
                    </div>
                </div>
            `;
            $('#country-widget').html(html);
        },
        error: function() {
            $('#country-widget').html('<div class="text-center text-danger"><i class="fas fa-exclamation-circle fa-2x mb-2"></i><p>Erreur de chargement</p></div>');
        }
    });
}
