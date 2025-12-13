/**
 * DataDash - Contact Page Script
 * Scripts pour la page contact
 */

$(document).ready(function() {
    // Form submission handler
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        FormValidator.clearFormErrors(this);
        
        // Validate form
        const validation = FormValidator.validateContactForm(this);
        
        if (!validation.isValid) {
            FormValidator.showFormErrors(this, validation.errors);
            return;
        }
        
        // Validate terms checkbox
        if (!$('#terms').is(':checked')) {
            $('#terms').addClass('is-invalid');
            Utils.showToast('Veuillez accepter les conditions d\'utilisation', 'danger');
            return;
        }
        
        // Show loading state
        const $btn = $('#submit-btn');
        const originalText = $btn.html();
        $btn.html('<span class="spinner-border spinner-border-sm me-2"></span>Envoi en cours...');
        $btn.prop('disabled', true);
        
        // Simulate API call
        setTimeout(function() {
            // Hide form and show success message
            $('#contact-form').fadeOut(300, function() {
                $('#success-message').fadeIn(300);
            });
            
            // Reset button
            $btn.html(originalText);
            $btn.prop('disabled', false);
            
            // Show toast
            Utils.showToast('Message envoyé avec succès !', 'success');
            
            // Reset form after delay
            setTimeout(function() {
                $('#success-message').fadeOut(300, function() {
                    $('#contact-form')[0].reset();
                    $('#contact-form').fadeIn(300);
                });
            }, 5000);
        }, 2000);
    });
    
    // Real-time validation
    $('#name, #email, #message').on('blur', function() {
        const $field = $(this);
        const value = $field.val();
        
        $field.removeClass('is-invalid is-valid');
        $field.next('.invalid-feedback').remove();
        
        if ($field.attr('id') === 'name') {
            if (!value || value.trim().length < 2) {
                $field.addClass('is-invalid');
                $field.after('<div class="invalid-feedback">Le nom doit contenir au moins 2 caractères</div>');
            } else {
                $field.addClass('is-valid');
            }
        }
        
        if ($field.attr('id') === 'email') {
            if (!FormValidator.isValidEmail(value)) {
                $field.addClass('is-invalid');
                $field.after('<div class="invalid-feedback">Veuillez entrer un email valide</div>');
            } else {
                $field.addClass('is-valid');
            }
        }
        
        if ($field.attr('id') === 'message') {
            if (!value || value.trim().length < 10) {
                $field.addClass('is-invalid');
                $field.after('<div class="invalid-feedback">Le message doit contenir au moins 10 caractères</div>');
            } else {
                $field.addClass('is-valid');
            }
        }
    });
    
    // Phone validation (optional but must be valid if provided)
    $('#phone').on('blur', function() {
        const value = $(this).val();
        $(this).removeClass('is-invalid is-valid');
        $(this).next('.invalid-feedback').remove();
        
        if (value && !FormValidator.isValidPhone(value)) {
            $(this).addClass('is-invalid');
            $(this).after('<div class="invalid-feedback">Numéro de téléphone invalide</div>');
        } else if (value) {
            $(this).addClass('is-valid');
        }
    });
});
