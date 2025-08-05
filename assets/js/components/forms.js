/* ========================================
   Stratosphere Consulting - Form Validation
   File: assets/js/components/forms.js
   
   Form validation, enhancement, and submission handling
   ======================================== */

const FormValidator = {
    // Configuration
    config: {
        errorClass: 'form-group--error',
        successClass: 'form-group--success',
        errorMessageClass: 'form-error',
        successMessageClass: 'form-success',
        debounceDelay: 500,
        passwordMinLength: 8,
        phoneRegex: /^[\d\s\-\+\(\)]+$/,
        emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    
    // Validation rules
    rules: {
        required: {
            validate: (value) => value.trim().length > 0,
            message: 'This field is required'
        },
        email: {
            validate: (value) => FormValidator.config.emailRegex.test(value),
            message: 'Please enter a valid email address'
        },
        phone: {
            validate: (value) => FormValidator.config.phoneRegex.test(value),
            message: 'Please enter a valid phone number'
        },
        minLength: {
            validate: (value, length) => value.length >= length,
            message: (length) => `Must be at least ${length} characters`
        },
        maxLength: {
            validate: (value, length) => value.length <= length,
            message: (length) => `Must be no more than ${length} characters`
        },
        password: {
            validate: (value) => {
                const hasUpper = /[A-Z]/.test(value);
                const hasLower = /[a-z]/.test(value);
                const hasNumber = /\d/.test(value);
                const hasSpecial = /[!@#$%^&*]/.test(value);
                const hasLength = value.length >= FormValidator.config.passwordMinLength;
                
                return hasUpper && hasLower && hasNumber && hasSpecial && hasLength;
            },
            message: 'Password must contain uppercase, lowercase, number, special character, and be at least 8 characters'
        },
        matches: {
            validate: (value, matchFieldId) => {
                const matchField = document.getElementById(matchFieldId);
                return matchField && value === matchField.value;
            },
            message: 'Values do not match'
        },
        url: {
            validate: (value) => {
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Please enter a valid URL'
        },
        number: {
            validate: (value) => !isNaN(value) && value !== '',
            message: 'Please enter a valid number'
        },
        date: {
            validate: (value) => !isNaN(Date.parse(value)),
            message: 'Please enter a valid date'
        }
    },
    
    // Active forms being validated
    activeForms: new Map(),
    
    /**
     * Initialize form validation
     * @param {string|HTMLFormElement} formSelector - Form selector or element
     * @param {Object} options - Validation options
     */
    init(formSelector, options = {}) {
        const forms = typeof formSelector === 'string' 
            ? document.querySelectorAll(formSelector)
            : [formSelector];
        
        forms.forEach(form => {
            if (!(form instanceof HTMLFormElement)) return;
            
            // Store form configuration
            this.activeForms.set(form, {
                options: options,
                fields: new Map()
            });
            
            // Set up form fields
            this.setupFormFields(form);
            
            // Handle form submission
            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
            
            // Real-time validation
            if (options.realTime !== false) {
                this.setupRealTimeValidation(form);
            }
            
            // Auto-save functionality
            if (options.autoSave) {
                this.setupAutoSave(form, options.autoSave);
            }
        });
    },
    
    /**
     * Setup form fields for validation
     */
    setupFormFields(form) {
        const formData = this.activeForms.get(form);
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const rules = this.getFieldRules(input);
            if (rules.length > 0) {
                formData.fields.set(input, {
                    rules: rules,
                    pristine: true
                });
            }
        });
    },
    
    /**
     * Get validation rules for a field
     */
    getFieldRules(field) {
        const rules = [];
        
        // Required
        if (field.hasAttribute('required')) {
            rules.push({ type: 'required' });
        }
        
        // Type-based rules
        switch (field.type) {
            case 'email':
                rules.push({ type: 'email' });
                break;
            case 'tel':
                rules.push({ type: 'phone' });
                break;
            case 'url':
                rules.push({ type: 'url' });
                break;
            case 'number':
                rules.push({ type: 'number' });
                break;
            case 'date':
                rules.push({ type: 'date' });
                break;
            case 'password':
                if (field.dataset.validatePassword !== 'false') {
                    rules.push({ type: 'password' });
                }
                break;
        }
        
        // Length rules
        if (field.hasAttribute('minlength')) {
            rules.push({ 
                type: 'minLength', 
                value: parseInt(field.getAttribute('minlength')) 
            });
        }
        
        if (field.hasAttribute('maxlength')) {
            rules.push({ 
                type: 'maxLength', 
                value: parseInt(field.getAttribute('maxlength')) 
            });
        }
        
        // Custom rules from data attributes
        if (field.dataset.match) {
            rules.push({ 
                type: 'matches', 
                value: field.dataset.match 
            });
        }
        
        // Custom validation function
        if (field.dataset.validate) {
            rules.push({ 
                type: 'custom', 
                value: field.dataset.validate 
            });
        }
        
        return rules;
    },
    
    /**
     * Setup real-time validation
     */
    setupRealTimeValidation(form) {
        const formData = this.activeForms.get(form);
        let debounceTimer;
        
        formData.fields.forEach((fieldData, field) => {
            // Validate on blur
            field.addEventListener('blur', () => {
                fieldData.pristine = false;
                this.validateField(field, form);
            });
            
            // Validate on input (debounced)
            field.addEventListener('input', () => {
                if (!fieldData.pristine) {
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(() => {
                        this.validateField(field, form);
                    }, this.config.debounceDelay);
                }
            });
            
            // Clear error on focus
            field.addEventListener('focus', () => {
                if (!fieldData.pristine) {
                    this.clearFieldError(field);
                }
            });
        });
    },
    
    /**
     * Validate a single field
     */
    validateField(field, form) {
        const formData = this.activeForms.get(form);
        const fieldData = formData.fields.get(field);
        
        if (!fieldData) return true;
        
        const value = field.value;
        let isValid = true;
        let errorMessage = '';
        
        // Check each rule
        for (const rule of fieldData.rules) {
            const ruleDefinition = this.rules[rule.type];
            
            if (!ruleDefinition) {
                if (rule.type === 'custom' && typeof window[rule.value] === 'function') {
                    const customResult = window[rule.value](value, field);
                    if (customResult !== true) {
                        isValid = false;
                        errorMessage = customResult || 'Invalid value';
                        break;
                    }
                }
                continue;
            }
            
            const isRuleValid = ruleDefinition.validate(value, rule.value);
            
            if (!isRuleValid) {
                isValid = false;
                errorMessage = typeof ruleDefinition.message === 'function' 
                    ? ruleDefinition.message(rule.value)
                    : ruleDefinition.message;
                break;
            }
        }
        
        // Update field state
        if (isValid) {
            this.setFieldSuccess(field);
        } else {
            this.setFieldError(field, errorMessage);
        }
        
        return isValid;
    },
    
    /**
     * Set field error state
     */
    setFieldError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Remove success state
        formGroup.classList.remove(this.config.successClass);
        
        // Add error state
        formGroup.classList.add(this.config.errorClass);
        
        // Remove existing messages
        this.clearFieldMessages(formGroup);
        
        // Add error message
        if (message) {
            const errorElement = document.createElement('span');
            errorElement.className = this.config.errorMessageClass;
            errorElement.textContent = message;
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            formGroup.appendChild(errorElement);
        }
        
        // Set aria-invalid
        field.setAttribute('aria-invalid', 'true');
        
        // Add error icon if container exists
        this.updateValidationIcon(formGroup, 'error');
    },
    
    /**
     * Set field success state
     */
    setFieldSuccess(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        // Remove error state
        formGroup.classList.remove(this.config.errorClass);
        
        // Add success state
        formGroup.classList.add(this.config.successClass);
        
        // Remove existing messages
        this.clearFieldMessages(formGroup);
        
        // Set aria-invalid
        field.setAttribute('aria-invalid', 'false');
        
        // Add success icon if container exists
        this.updateValidationIcon(formGroup, 'success');
    },
    
    /**
     * Clear field error
     */
    clearFieldError(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        
        formGroup.classList.remove(this.config.errorClass);
        formGroup.classList.remove(this.config.successClass);
        this.clearFieldMessages(formGroup);
        field.removeAttribute('aria-invalid');
        this.updateValidationIcon(formGroup, null);
    },
    
    /**
     * Clear field messages
     */
    clearFieldMessages(formGroup) {
        const messages = formGroup.querySelectorAll(
            `.${this.config.errorMessageClass}, .${this.config.successMessageClass}`
        );
        messages.forEach(msg => msg.remove());
    },
    
    /**
     * Update validation icon
     */
    updateValidationIcon(formGroup, state) {
        let iconContainer = formGroup.querySelector('.form-validation-icon');
        
        if (!iconContainer && state) {
            iconContainer = document.createElement('span');
            iconContainer.className = 'form-validation-icon';
            const input = formGroup.querySelector('input, textarea, select');
            if (input && input.parentElement === formGroup) {
                formGroup.appendChild(iconContainer);
            }
        }
        
        if (iconContainer) {
            if (!state) {
                iconContainer.remove();
            } else {
                iconContainer.className = `form-validation-icon form-validation-icon--${state}`;
                iconContainer.innerHTML = state === 'error' 
                    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            }
        }
    },
    
    /**
     * Validate entire form
     */
    validateForm(form) {
        const formData = this.activeForms.get(form);
        if (!formData) return true;
        
        let isValid = true;
        
        formData.fields.forEach((fieldData, field) => {
            fieldData.pristine = false;
            const fieldValid = this.validateField(field, form);
            if (!fieldValid) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    /**
     * Handle form submission
     */
    async handleSubmit(e, form) {
        e.preventDefault();
        
        // Validate form
        const isValid = this.validateForm(form);
        
        if (!isValid) {
            // Focus first error field
            const firstError = form.querySelector(`.${this.config.errorClass} input, .${this.config.errorClass} textarea, .${this.config.errorClass} select`);
            if (firstError) {
                firstError.focus();
            }
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Call custom submit handler if provided
        const formConfig = this.activeForms.get(form);
        if (formConfig.options.onSubmit) {
            await formConfig.options.onSubmit(data, form);
        } else {
            // Default submission
            console.log('Form submitted:', data);
        }
    },
    
    /**
     * Setup auto-save functionality
     */
    setupAutoSave(form, options) {
        const saveKey = options.key || `form_${form.id || 'default'}`;
        let saveTimer;
        
        // Load saved data
        this.loadSavedData(form, saveKey);
        
        // Save on input
        form.addEventListener('input', () => {
            clearTimeout(saveTimer);
            saveTimer = setTimeout(() => {
                this.saveFormData(form, saveKey);
            }, options.delay || 1000);
        });
        
        // Clear saved data on successful submit
        const originalOptions = this.activeForms.get(form).options;
        const originalOnSubmit = originalOptions.onSubmit;
        
        originalOptions.onSubmit = async (data, form) => {
            if (originalOnSubmit) {
                await originalOnSubmit(data, form);
            }
            localStorage.removeItem(saveKey);
        };
    },
    
    /**
     * Save form data to localStorage
     */
    saveFormData(form, key) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            localStorage.setItem(key, JSON.stringify(data));
            this.showAutoSaveIndicator(form, 'saved');
        } catch (e) {
            console.error('Failed to save form data:', e);
            this.showAutoSaveIndicator(form, 'error');
        }
    },
    
    /**
     * Load saved form data
     */
    loadSavedData(form, key) {
        try {
            const savedData = localStorage.getItem(key);
            if (!savedData) return;
            
            const data = JSON.parse(savedData);
            
            Object.entries(data).forEach(([name, value]) => {
                const field = form.elements[name];
                if (field) {
                    field.value = value;
                    // Trigger input event for any listeners
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            
            this.showAutoSaveIndicator(form, 'restored');
        } catch (e) {
            console.error('Failed to load saved form data:', e);
        }
    },
    
    /**
     * Show auto-save indicator
     */
    showAutoSaveIndicator(form, status) {
        let indicator = form.querySelector('.form-autosave-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'form-autosave-indicator';
            form.appendChild(indicator);
        }
        
        const messages = {
            saved: 'Draft saved',
            restored: 'Draft restored',
            error: 'Failed to save'
        };
        
        indicator.textContent = messages[status] || '';
        indicator.className = `form-autosave-indicator form-autosave-indicator--${status}`;
        
        setTimeout(() => {
            indicator.classList.add('fade-out');
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    },
    
    /**
     * Reset form validation
     */
    reset(form) {
        const formData = this.activeForms.get(form);
        if (!formData) return;
        
        // Reset all fields
        formData.fields.forEach((fieldData, field) => {
            fieldData.pristine = true;
            this.clearFieldError(field);
        });
        
        // Reset form
        form.reset();
    },
    
    /**
     * Destroy form validation
     */
    destroy(form) {
        if (this.activeForms.has(form)) {
            this.activeForms.delete(form);
        }
    }
};

// Export for use in other modules
window.FormValidator = FormValidator;