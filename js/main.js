/**
 * DataDash - Main JavaScript File
 * Tableau de Bord Dynamique basé sur des APIs Publiques
 */

// ========================================
// Configuration des APIs
// ========================================
const API_CONFIG = {
    // RandomUser API
    randomUser: {
        baseUrl: 'https://randomuser.me/api/',
        defaultResults: 10
    },
    // REST Countries API
    countries: {
        baseUrl: 'https://restcountries.com/v3.1'
    },
    // Weather API (wttr.in - no key required)
    weather: {
        baseUrl: 'https://wttr.in'
    },
    // Zippopotam API
    zipcode: {
        baseUrl: 'https://api.zippopotam.us'
    },
    // Open Food Facts API
    food: {
        baseUrl: 'https://world.openfoodfacts.org/api/v0'
    }
};

// ========================================
// Utility Functions
// ========================================
const Utils = {
    // Show loading spinner
    showLoading: function(container) {
        $(container).html(`
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="text-muted mt-2">Chargement des données...</p>
            </div>
        `);
    },

    // Show error message
    showError: function(container, message = "Erreur lors du chargement des données") {
        $(container).html(`
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="btn btn-outline-danger btn-sm" onclick="location.reload()">
                    <i class="fas fa-redo me-1"></i>Réessayer
                </button>
            </div>
        `);
    },

    // Format number with thousands separator
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    // Format date
    formatDate: function(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    },

    // Generate random color
    getRandomColor: function() {
        const colors = [
            '#4361ee', '#3f37c9', '#f72585', '#4cc9f0', 
            '#7209b7', '#3a0ca3', '#4895ef', '#560bad'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // Get chart colors array
    getChartColors: function(count) {
        const baseColors = [
            'rgba(67, 97, 238, 0.8)',
            'rgba(247, 37, 133, 0.8)',
            'rgba(76, 201, 240, 0.8)',
            'rgba(114, 9, 183, 0.8)',
            'rgba(58, 12, 163, 0.8)',
            'rgba(72, 149, 239, 0.8)',
            'rgba(86, 11, 173, 0.8)',
            'rgba(63, 55, 201, 0.8)'
        ];
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(baseColors[i % baseColors.length]);
        }
        return colors;
    },

    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Show toast notification
    showToast: function(message, type = 'success') {
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        if (!$('.toast-container').length) {
            $('body').append('<div class="toast-container"></div>');
        }
        
        const $toast = $(toastHtml);
        $('.toast-container').append($toast);
        
        const toast = new bootstrap.Toast($toast[0], { delay: 3000 });
        toast.show();
        
        $toast.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    }
};

// ========================================
// API Service Functions
// ========================================
const ApiService = {
    // Fetch random users
    getRandomUsers: function(count = 10, nationality = '') {
        let url = `${API_CONFIG.randomUser.baseUrl}?results=${count}`;
        if (nationality) {
            url += `&nat=${nationality}`;
        }
        return $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json'
        });
    },

    // Fetch all countries
    getAllCountries: function() {
        return $.ajax({
            url: `${API_CONFIG.countries.baseUrl}/all?fields=name,flags,population,capital,region,currencies`,
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    },

    // Fetch country by name
    getCountryByName: function(name) {
        return $.ajax({
            url: `${API_CONFIG.countries.baseUrl}/name/${encodeURIComponent(name)}?fields=name,flags,population,capital,region,currencies`,
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    },

    // Fetch countries by region
    getCountriesByRegion: function(region) {
        return $.ajax({
            url: `${API_CONFIG.countries.baseUrl}/region/${encodeURIComponent(region)}?fields=name,flags,population,capital,region,currencies`,
            method: 'GET',
            dataType: 'json',
            timeout: 10000
        });
    },

    // Fetch weather data
    getWeather: function(city) {
        return $.ajax({
            url: `${API_CONFIG.weather.baseUrl}/${city}?format=j1`,
            method: 'GET'
        });
    },

    // Fetch postal code info
    getPostalInfo: function(country, code) {
        return $.ajax({
            url: `${API_CONFIG.zipcode.baseUrl}/${country}/${code}`,
            method: 'GET',
            dataType: 'json'
        });
    },

    // Fetch food product
    getFoodProduct: function(barcode) {
        return $.ajax({
            url: `${API_CONFIG.food.baseUrl}/product/${barcode}.json`,
            method: 'GET',
            dataType: 'json'
        });
    },

    // Search food products
    searchFoodProducts: function(query) {
        return $.ajax({
            url: `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`,
            method: 'GET',
            dataType: 'json'
        });
    }
};

// ========================================
// Chart Functions
// ========================================
const ChartManager = {
    charts: {},

    // Create or update bar chart
    createBarChart: function(canvasId, labels, data, label, colors = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: colors || Utils.getChartColors(data.length),
                    borderRadius: 8,
                    borderSkipped: false
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
    },

    // Create or update pie chart
    createPieChart: function(canvasId, labels, data, colors = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors || Utils.getChartColors(data.length),
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    },

    // Create or update line chart
    createLineChart: function(canvasId, labels, datasets) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    line: {
                        tension: 0.4
                    }
                }
            }
        });
    },

    // Create polar area chart
    createPolarChart: function(canvasId, labels, data, colors = null) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors || Utils.getChartColors(data.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
};

// ========================================
// Form Validation
// ========================================
const FormValidator = {
    // Validate email
    isValidEmail: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validate phone
    isValidPhone: function(phone) {
        const regex = /^[\d\s\-\+\(\)]{8,}$/;
        return regex.test(phone);
    },

    // Validate required field
    isRequired: function(value) {
        return value !== null && value !== undefined && value.trim() !== '';
    },

    // Validate min length
    minLength: function(value, min) {
        return value.length >= min;
    },

    // Validate max length
    maxLength: function(value, max) {
        return value.length <= max;
    },

    // Validate contact form
    validateContactForm: function(form) {
        let isValid = true;
        const errors = {};

        // Name validation
        const name = $(form).find('#name').val();
        if (!this.isRequired(name)) {
            errors.name = 'Le nom est obligatoire';
            isValid = false;
        } else if (!this.minLength(name, 2)) {
            errors.name = 'Le nom doit contenir au moins 2 caractères';
            isValid = false;
        }

        // Email validation
        const email = $(form).find('#email').val();
        if (!this.isRequired(email)) {
            errors.email = 'L\'email est obligatoire';
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            errors.email = 'Veuillez entrer un email valide';
            isValid = false;
        }

        // Subject validation
        const subject = $(form).find('#subject').val();
        if (!this.isRequired(subject)) {
            errors.subject = 'Le sujet est obligatoire';
            isValid = false;
        }

        // Message validation
        const message = $(form).find('#message').val();
        if (!this.isRequired(message)) {
            errors.message = 'Le message est obligatoire';
            isValid = false;
        } else if (!this.minLength(message, 10)) {
            errors.message = 'Le message doit contenir au moins 10 caractères';
            isValid = false;
        }

        return { isValid, errors };
    },

    // Show form errors
    showFormErrors: function(form, errors) {
        // Clear previous errors
        $(form).find('.is-invalid').removeClass('is-invalid');
        $(form).find('.invalid-feedback').remove();

        // Show new errors
        Object.keys(errors).forEach(field => {
            const $field = $(form).find(`#${field}`);
            $field.addClass('is-invalid');
            $field.after(`<div class="invalid-feedback">${errors[field]}</div>`);
        });
    },

    // Clear form errors
    clearFormErrors: function(form) {
        $(form).find('.is-invalid').removeClass('is-invalid');
        $(form).find('.invalid-feedback').remove();
    }
};

// ========================================
// DataTables Initialization
// ========================================
const DataTableManager = {
    tables: {},

    // Initialize DataTable with default options
    initTable: function(tableId, data, columns, options = {}) {
        if (this.tables[tableId]) {
            this.tables[tableId].destroy();
            $(`#${tableId}`).empty();
        }

        const defaultOptions = {
            data: data,
            columns: columns,
            responsive: true,
            language: {
                search: "Rechercher:",
                lengthMenu: "Afficher _MENU_ entrées",
                info: "Affichage de _START_ à _END_ sur _TOTAL_ entrées",
                infoEmpty: "Aucune entrée",
                infoFiltered: "(filtré de _MAX_ entrées au total)",
                paginate: {
                    first: "Premier",
                    last: "Dernier",
                    next: "Suivant",
                    previous: "Précédent"
                },
                zeroRecords: "Aucun résultat trouvé",
                emptyTable: "Aucune donnée disponible"
            },
            pageLength: 10,
            lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "Tous"]],
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
        };

        this.tables[tableId] = $(`#${tableId}`).DataTable({
            ...defaultOptions,
            ...options
        });

        return this.tables[tableId];
    },

    // Destroy table
    destroyTable: function(tableId) {
        if (this.tables[tableId]) {
            this.tables[tableId].destroy();
            delete this.tables[tableId];
        }
    }
};

// ========================================
// Document Ready
// ========================================
$(document).ready(function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Navbar scroll effect
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $('.navbar').addClass('shadow-lg');
        } else {
            $('.navbar').removeClass('shadow-lg');
        }
    });

    // Smooth scroll for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 70
            }, 800);
        }
    });

    // Add fade-in animation to elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .api-card, .stat-card, .chart-card').forEach(el => {
        observer.observe(el);
    });

    console.log('DataDash initialized successfully!');
});
