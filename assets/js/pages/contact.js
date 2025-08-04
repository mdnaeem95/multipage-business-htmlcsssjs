/* ========================================
   Stratosphere Consulting - Contact Page Scripts
   File: assets/js/pages/contact.js
   
   Contact page-specific functionality
   ======================================== */

const ContactPage = {
    // Configuration
    config: {
        mapZoom: 15,
        mapStyle: 'light',
        formEndpoint: '/api/contact',
        recaptchaSiteKey: '',
        animationDelay: 100
    },
    
    // State
    state: {
        isSubmitting: false,
        formData: {},
        selectedService: null
    },
    
    // Elements
    elements: {
        contactForm: null,
        mapContainer: null,
        officeCards: null,
        contactMethods: null,
        serviceSelect: null,
        budgetRange: null,
        fileUpload: null
    },
    
    /**
     * Initialize contact page
     */
    init() {
        console.log('Initializing contact page...');
        
        // Get elements
        this.getElements();
        
        // Initialize contact form
        this.initContactForm();
        
        // Initialize map
        this.initMap();
        
        // Initialize office cards
        this.initOfficeCards();
        
        // Initialize contact methods
        this.initContactMethods();
        
        // Initialize form enhancements
        this.initFormEnhancements();
        
        // Initialize FAQ section
        this.initFAQ();
        
        // Initialize page animations
        this.initPageAnimations();
    },
    
    /**
     * Get page elements
     */
    getElements() {
        this.elements.contactForm = document.getElementById('contact-form');
        this.elements.mapContainer = document.getElementById('map-container');
        this.elements.officeCards = document.querySelectorAll('.office-card');
        this.elements.contactMethods = document.querySelectorAll('.contact-method');
        this.elements.serviceSelect = document.querySelector('select[name="service"]');
        this.elements.budgetRange = document.querySelector('input[type="range"][name="budget"]');
        this.elements.fileUpload = document.querySelector('input[type="file"]');
    },
    
    /**
     * Initialize contact form
     */
    initContactForm() {
        if (!this.elements.contactForm) return;
        
        // Form validation
        if (typeof FormValidator !== 'undefined') {
            FormValidator.init('#contact-form');
        }
        
        // Handle form submission
        this.elements.contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
        
        // Auto-save form data
        this.initFormAutoSave();
        
        // Character counter for message
        const messageField = this.elements.contactForm.querySelector('textarea[name="message"]');
        if (messageField) {
            this.initCharacterCounter(messageField);
        }
    },
    
    /**
     * Handle form submission
     */
    async handleFormSubmit() {
        if (this.state.isSubmitting) return;
        
        // Validate form
        if (typeof FormValidator !== 'undefined' && !FormValidator.validateForm(this.elements.contactForm)) {
            return;
        }
        
        this.state.isSubmitting = true;
        
        // Get form data
        const formData = new FormData(this.elements.contactForm);
        this.state.formData = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = this.elements.contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call (replace with actual endpoint)
            await this.submitForm(this.state.formData);
            
            // Success
            this.showSuccessMessage();
            this.elements.contactForm.reset();
            this.clearAutoSave();
            
            // Track conversion
            this.trackFormSubmission();
            
        } catch (error) {
            // Error
            this.showErrorMessage(error.message);
            
        } finally {
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            this.state.isSubmitting = false;
        }
    },
    
    /**
     * Submit form data
     */
    async submitForm(data) {
        // Simulate API delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/error
                if (Math.random() > 0.1) {
                    resolve({ success: true, message: 'Form submitted successfully' });
                } else {
                    reject(new Error('Failed to submit form. Please try again.'));
                }
            }, 1500);
        });
        
        // Actual implementation would be:
        // const response = await fetch(this.config.formEndpoint, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Failed to submit form');
        // }
        // 
        // return response.json();
    },
    
    /**
     * Show success message
     */
    showSuccessMessage() {
        const successMessage = `
            <div class="form-message form-message--success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <h3>Thank you for your message!</h3>
                    <p>We'll get back to you within 24 hours.</p>
                </div>
            </div>
        `;
        
        this.showMessage(successMessage);
    },
    
    /**
     * Show error message
     */
    showErrorMessage(message) {
        const errorMessage = `
            <div class="form-message form-message--error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <div>
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        this.showMessage(errorMessage);
    },
    
    /**
     * Show message
     */
    showMessage(messageHtml) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Insert new message
        this.elements.contactForm.insertAdjacentHTML('afterend', messageHtml);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            const message = document.querySelector('.form-message');
            if (message) {
                message.style.opacity = '0';
                setTimeout(() => message.remove(), 300);
            }
        }, 5000);
    },
    
    /**
     * Initialize form auto-save
     */
    initFormAutoSave() {
        const inputs = this.elements.contactForm.querySelectorAll('input, textarea, select');
        
        // Load saved data
        const savedData = Utils.storage.get('contactFormData');
        if (savedData) {
            Object.entries(savedData).forEach(([name, value]) => {
                const field = this.elements.contactForm.querySelector(`[name="${name}"]`);
                if (field) {
                    field.value = value;
                }
            });
        }
        
        // Save on change
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveFormData();
            });
            
            // Debounced save for text inputs
            if (input.type === 'text' || input.type === 'email' || input.tagName === 'TEXTAREA') {
                input.addEventListener('input', Utils.debounce(() => {
                    this.saveFormData();
                }, 1000));
            }
        });
    },
    
    /**
     * Save form data
     */
    saveFormData() {
        const formData = new FormData(this.elements.contactForm);
        const data = Object.fromEntries(formData);
        Utils.storage.set('contactFormData', data);
    },
    
    /**
     * Clear auto-saved data
     */
    clearAutoSave() {
        Utils.storage.remove('contactFormData');
    },
    
    /**
     * Initialize character counter
     */
    initCharacterCounter(textarea) {
        const maxLength = parseInt(textarea.getAttribute('maxlength')) || 1000;
        
        // Create counter element
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.innerHTML = `<span class="current">0</span> / <span class="max">${maxLength}</span>`;
        textarea.parentElement.appendChild(counter);
        
        // Update counter
        const updateCounter = () => {
            const current = textarea.value.length;
            const currentSpan = counter.querySelector('.current');
            currentSpan.textContent = current;
            
            // Change color when approaching limit
            if (current > maxLength * 0.9) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    },
    
    /**
     * Initialize map
     */
    initMap() {
        if (!this.elements.mapContainer) return;
        
        // For demo purposes, we'll create a styled placeholder
        // In production, you would integrate with Google Maps or Mapbox
        
        const mapPlaceholder = `
            <div class="map-placeholder">
                <div class="map-marker">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div class="map-overlay">
                    <h3>Visit Our Office</h3>
                    <p>123 Business Ave, Suite 100<br>New York, NY 10001</p>
                    <a href="https://maps.google.com" target="_blank" class="btn btn--sm btn--primary">
                        Get Directions
                    </a>
                </div>
            </div>
        `;
        
        this.elements.mapContainer.innerHTML = mapPlaceholder;
        
        // Add interactive hover effect
        const mapOverlay = this.elements.mapContainer.querySelector('.map-overlay');
        this.elements.mapContainer.addEventListener('mouseenter', () => {
            mapOverlay.style.opacity = '1';
            mapOverlay.style.transform = 'translateY(0)';
        });
        
        this.elements.mapContainer.addEventListener('mouseleave', () => {
            mapOverlay.style.opacity = '0';
            mapOverlay.style.transform = 'translateY(20px)';
        });
    },
    
    /**
     * Initialize office cards
     */
    initOfficeCards() {
        if (!this.elements.officeCards.length) return;
        
        this.elements.officeCards.forEach((card, index) => {
            // Add entrance animation
            card.style.animationDelay = `${index * this.config.animationDelay}ms`;
            
            // Interactive hover effect
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.office-card__icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.office-card__icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0)';
                }
            });
            
            // Click to copy address
            const address = card.querySelector('.office-card__address');
            if (address) {
                address.style.cursor = 'pointer';
                address.addEventListener('click', () => {
                    this.copyToClipboard(address.textContent);
                    this.showTooltip(address, 'Address copied!');
                });
            }
        });
    },
    
    /**
     * Initialize contact methods
     */
    initContactMethods() {
        if (!this.elements.contactMethods.length) return;
        
        this.elements.contactMethods.forEach(method => {
            const link = method.querySelector('a');
            if (!link) return;
            
            // Track clicks
            link.addEventListener('click', () => {
                const type = method.querySelector('h3').textContent;
                this.trackContactMethod(type);
            });
            
            // Copy email/phone on click
            if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const value = link.href.replace(/^(mailto:|tel:)/, '');
                    this.copyToClipboard(value);
                    this.showTooltip(link, `${link.href.startsWith('mailto:') ? 'Email' : 'Phone'} copied!`);
                });
            }
        });
    },
    
    /**
     * Initialize form enhancements
     */
    initFormEnhancements() {
        // Service select enhancement
        if (this.elements.serviceSelect) {
            this.elements.serviceSelect.addEventListener('change', (e) => {
                this.state.selectedService = e.target.value;
                this.updateFormFields();
            });
        }
        
        // Budget range enhancement
        if (this.elements.budgetRange) {
            const output = document.createElement('output');
            output.className = 'budget-output';
            this.elements.budgetRange.parentElement.appendChild(output);
            
            const updateBudget = () => {
                const value = this.elements.budgetRange.value;
                const formatted = value < 100 ? `$${value}k` : `$${value / 1000}M`;
                output.textContent = formatted;
                output.style.left = `${(value / this.elements.budgetRange.max) * 100}%`;
            };
            
            this.elements.budgetRange.addEventListener('input', updateBudget);
            updateBudget();
        }
        
        // File upload enhancement
        if (this.elements.fileUpload) {
            this.initFileUpload();
        }
    },
    
    /**
     * Update form fields based on service selection
     */
    updateFormFields() {
        // Show/hide relevant fields based on service
        const serviceFields = {
            'strategy': ['timeline', 'company-size'],
            'digital': ['current-website', 'tech-stack'],
            'operations': ['team-size', 'current-challenges'],
            'leadership': ['team-size', 'training-needs']
        };
        
        // Implementation would show/hide fields dynamically
        console.log('Selected service:', this.state.selectedService);
    },
    
    /**
     * Initialize file upload
     */
    initFileUpload() {
        const fileInput = this.elements.fileUpload;
        const fileLabel = fileInput.parentElement;
        
        // Create file list container
        const fileList = document.createElement('div');
        fileList.className = 'file-list';
        fileLabel.parentElement.appendChild(fileList);
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            fileList.innerHTML = '';
            
            files.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                    <button type="button" class="file-remove" aria-label="Remove file">×</button>
                `;
                
                const removeBtn = fileItem.querySelector('.file-remove');
                removeBtn.addEventListener('click', () => {
                    fileItem.remove();
                    // In real implementation, would also remove from file input
                });
                
                fileList.appendChild(fileItem);
            });
        });
    },
    
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    /**
     * Initialize FAQ section
     */
    initFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (!question || !answer) return;
            
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
                
                // Animate answer
                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    },
    
    /**
     * Copy to clipboard
     */
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    },
    
    /**
     * Show tooltip
     */
    showTooltip(element, message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = message;
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${rect.top - 40}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        
        // Animate in
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
        
        // Remove after delay
        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    },
    
    /**
     * Track form submission
     */
    trackFormSubmission() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submit', {
                event_category: 'engagement',
                event_label: 'contact_form',
                value: this.state.selectedService
            });
        }
    },
    
    /**
     * Track contact method click
     */
    trackContactMethod(method) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_method_click', {
                event_category: 'engagement',
                event_label: method
            });
        }
    },
    
    /**
     * Initialize page animations
     */
    initPageAnimations() {
        // Animate form fields on focus
        const formFields = this.elements.contactForm.querySelectorAll('.form-group');
        
        formFields.forEach(field => {
            const input = field.querySelector('input, textarea, select');
            if (!input) return;
            
            input.addEventListener('focus', () => {
                field.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    field.classList.remove('focused');
                }
            });
            
            // Set initial state
            if (input.value) {
                field.classList.add('focused');
            }
        });
        
        // Parallax effect for page hero
        const pageHero = document.querySelector('.page-hero');
        if (pageHero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                pageHero.style.transform = `translateY(${rate}px)`;
            });
        }
        
        // Floating animation for contact cards
        const contactCards = document.querySelectorAll('.contact-method, .office-card');
        contactCards.forEach((card, index) => {
            card.style.animation = `float ${4 + (index % 2)}s ease-in-out ${index * 0.2}s infinite`;
        });
    }
};

// Add required styles
const style = document.createElement('style');
style.textContent = `
    /* Form message styles */
    .form-message {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4);
        margin-top: var(--space-4);
        border-radius: var(--radius-lg);
        animation: slideIn 0.3s ease-out;
    }
    
    .form-message--success {
        background: rgba(var(--color-success-rgb), 0.1);
        color: var(--color-success);
        border: 1px solid var(--color-success);
    }
    
    .form-message--error {
        background: rgba(var(--color-error-rgb), 0.1);
        color: var(--color-error);
        border: 1px solid var(--color-error);
    }
    
    .form-message h3 {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        margin-bottom: var(--space-1);
    }
    
    .form-message p {
        font-size: var(--text-sm);
        opacity: 0.8;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Character counter */
    .character-counter {
        text-align: right;
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-top: var(--space-2);
    }
    
    .character-counter.warning {
        color: var(--color-warning);
    }
    
    /* Budget output */
    .budget-output {
        position: absolute;
        top: -30px;
        transform: translateX(-50%);
        background: var(--color-primary);
        color: var(--color-white);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        pointer-events: none;
        transition: left var(--transition-base) var(--ease-in-out);
    }
    
    .budget-output::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: var(--color-primary);
    }
    
    /* File list */
    .file-list {
        margin-top: var(--space-3);
    }
    
    .file-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-2);
    }
    
    .file-name {
        flex: 1;
        font-size: var(--text-sm);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .file-size {
        font-size: var(--text-xs);
        color: var(--text-muted);
    }
    
    .file-remove {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: var(--radius-full);
        transition: all var(--transition-base) var(--ease-in-out);
    }
    
    .file-remove:hover {
        background: var(--bg-tertiary);
        color: var(--color-error);
    }
    
    /* Map placeholder */
    .map-placeholder {
        position: relative;
        height: 100%;
        min-height: 400px;
        background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        cursor: pointer;
    }
    
    .map-marker {
        animation: bounce 2s ease-in-out infinite;
        color: var(--color-primary);
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    
    .map-overlay {
        position: absolute;
        bottom: var(--space-6);
        left: var(--space-6);
        right: var(--space-6);
        background: var(--bg-primary);
        padding: var(--space-6);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        text-align: center;
        opacity: 0;
        transform: translateY(20px);
        transition: all var(--transition-base) var(--ease-in-out);
    }
    
    .map-overlay h3 {
        font-size: var(--text-xl);
        margin-bottom: var(--space-2);
    }
    
    .map-overlay p {
        margin-bottom: var(--space-4);
        color: var(--text-secondary);
    }
    
    /* Tooltip */
    .tooltip {
        background: var(--color-gray-900);
        color: var(--color-white);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        pointer-events: none;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease-out;
        z-index: var(--z-tooltip);
    }
    
    .tooltip.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* FAQ styles */
    .faq-item {
        border-bottom: 1px solid var(--border-light);
        padding: var(--space-4) 0;
    }
    
    .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        transition: color var(--transition-base) var(--ease-in-out);
    }
    
    .faq-question:hover {
        color: var(--color-primary);
    }
    
    .faq-question::after {
        content: '+';
        font-size: var(--text-2xl);
        font-weight: var(--font-light);
        transition: transform var(--transition-base) var(--ease-in-out);
    }
    
    .faq-item.active .faq-question::after {
        transform: rotate(45deg);
    }
    
    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height var(--transition-base) var(--ease-in-out);
        padding-top: 0;
    }
    
    .faq-item.active .faq-answer {
        padding-top: var(--space-3);
    }
    
    /* Form field focus state */
    .form-group.focused .form-label {
        color: var(--color-primary);
        transform: translateY(-24px) scale(0.85);
    }
    
    /* Float animation */
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;

document.head.appendChild(style);

// Export
window.ContactPage = ContactPage;