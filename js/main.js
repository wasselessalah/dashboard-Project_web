$(document).ready(function() {
    console.log('Flight & Passengers Tracker - Initialized');
    
    // Animate statistics on home page
    animateStatistics();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Initialize tooltips
    initTooltips();
});

function animateStatistics() {
    // Check if we're on the home page
    if ($('#stat-flights').length === 0) return;
    
    // Animate counters
    animateCounter('#stat-flights', 0, 1500, 2000);
    animateCounter('#stat-passengers', 0, 50000, 2000);
    animateCounter('#stat-countries', 0, 195, 2000);
}

function animateCounter(selector, start, end, duration) {
    const element = $(selector);
    if (element.length === 0) return;
    
    const range = end - start;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(start + (range * easeOutQuart));
        
        element.text(formatNumber(currentValue));
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function addSmoothScrolling() {
    $('a[href^="#"]').on('click', function(event) {
        const target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').animate({
                scrollTop: target.offset().top - 70
            }, 500);
        }
    });
}

function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function showLoading() {
    if ($('.loading-overlay').length === 0) {
        $('body').append(`
            <div class="loading-overlay">
                <div class="text-center">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                    <p class="mt-3">Chargement en cours...</p>
                </div>
            </div>
        `);
    }
}

function hideLoading() {
    $('.loading-overlay').fadeOut(300, function() {
        $(this).remove();
    });
}

function showToast(message, type = 'info') {
    const bgColor = {
        success: 'bg-success',
        error: 'bg-danger',
        warning: 'bg-warning',
        info: 'bg-info'
    };
    
    const toastHtml = `
        <div class="toast-container position-fixed bottom-0 end-0 p-3">
            <div class="toast ${bgColor[type]} text-white" role="alert">
                <div class="toast-body d-flex align-items-center">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(toastHtml);
    const toast = new bootstrap.Toast($('.toast').last()[0]);
    toast.show();
    
    // Remove toast after it's hidden
    $('.toast').last().on('hidden.bs.toast', function() {
        $(this).parent().remove();
    });
}

function storeData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Error storing data:', e);
    }
}

function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error retrieving data:', e);
        return null;
    }
}

function clearData(key) {
    if (key) {
        localStorage.removeItem(key);
    } else {
        localStorage.clear();
    }
}
