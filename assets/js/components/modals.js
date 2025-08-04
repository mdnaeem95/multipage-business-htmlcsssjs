/* ========================================
   Stratosphere Consulting - Modal Component
   File: assets/js/components/modals.js
   
   Modal dialog functionality
   ======================================== */

const ModalManager = {
    // Configuration
    config: {
        animationDuration: 300,
        modalClass: 'modal',
        activeClass: 'modal--active',
        backdropClass: 'modal__backdrop',
        contentClass: 'modal__content',
        closeButtonClass: 'modal__close',
        openClass: 'modal-open'
    },
    
    // State
    state: {
        activeModals: [],
        scrollPosition: 0,
        isAnimating: false
    },
    
    // Modal templates
    templates: {
        basic: `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div class="modal__backdrop"></div>
                <div class="modal__content">
                    <button class="modal__close" aria-label="Close modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div class="modal__header">
                        <h2 class="modal__title" id="modal-title"></h2>
                    </div>
                    <div class="modal__body"></div>
                    <div class="modal__footer"></div>
                </div>
            </div>
        `,
        
        confirm: `
            <div class="modal modal--confirm" role="alertdialog" aria-modal="true" aria-labelledby="modal-title">
                <div class="modal__backdrop"></div>
                <div class="modal__content">
                    <div class="modal__icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div class="modal__header">
                        <h2 class="modal__title" id="modal-title"></h2>
                    </div>
                    <div class="modal__body"></div>
                    <div class="modal__footer">
                        <button class="btn btn--outline modal__cancel">Cancel</button>
                        <button class="btn btn--primary modal__confirm">Confirm</button>
                    </div>
                </div>
            </div>
        `,
        
        image: `
            <div class="modal modal--image" role="dialog" aria-modal="true" aria-label="Image viewer">
                <div class="modal__backdrop"></div>
                <div class="modal__content">
                    <button class="modal__close" aria-label="Close modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <div class="modal__image-wrapper">
                        <img class="modal__image" alt="">
                        <div class="modal__image-caption"></div>
                    </div>
                </div>
            </div>
        `
    },
    
    /**
     * Initialize modal manager
     */
    init() {
        // Set up global event listeners
        this.bindGlobalEvents();
        
        // Initialize existing modals
        this.initExistingModals();
        
        // Set up trigger buttons
        this.initTriggers();
        
        console.log('Modal Manager initialized');
    },
    
    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // ESC key to close top modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.activeModals.length > 0) {
                const topModal = this.state.activeModals[this.state.activeModals.length - 1];
                if (!topModal.config.preventClose) {
                    this.close(topModal.id);
                }
            }
        });
        
        // Handle browser back button
        window.addEventListener('popstate', () => {
            if (this.state.activeModals.length > 0) {
                this.closeAll();
            }
        });
    },
    
    /**
     * Initialize existing modals in DOM
     */
    initExistingModals() {
        const modals = document.querySelectorAll(`.${this.config.modalClass}`);
        
        modals.forEach(modal => {
            const id = modal.id || this.generateId();
            modal.id = id;
            
            // Set up close button
            const closeButton = modal.querySelector(`.${this.config.closeButtonClass}`);
            if (closeButton) {
                closeButton.addEventListener('click', () => this.close(id));
            }
            
            // Set up backdrop click
            const backdrop = modal.querySelector(`.${this.config.backdropClass}`);
            if (backdrop) {
                backdrop.addEventListener('click', () => this.close(id));
            }
            
            // Prevent content click from closing
            const content = modal.querySelector(`.${this.config.contentClass}`);
            if (content) {
                content.addEventListener('click', (e) => e.stopPropagation());
            }
        });
    },
    
    /**
     * Initialize trigger buttons
     */
    initTriggers() {
        const triggers = document.querySelectorAll('[data-modal-trigger]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal-trigger');
                const modalType = trigger.getAttribute('data-modal-type') || 'basic';
                
                if (modalId) {
                    // Open existing modal
                    this.open(modalId);
                } else {
                    // Create dynamic modal
                    const config = {
                        type: modalType,
                        title: trigger.getAttribute('data-modal-title'),
                        content: trigger.getAttribute('data-modal-content'),
                        confirmText: trigger.getAttribute('data-modal-confirm'),
                        cancelText: trigger.getAttribute('data-modal-cancel'),
                        onConfirm: () => {
                            const action = trigger.getAttribute('data-modal-action');
                            if (action && typeof window[action] === 'function') {
                                window[action]();
                            }
                        }
                    };
                    
                    this.create(config);
                }
            });
        });
    },
    
    /**
     * Create a new modal
     */
    create(config = {}) {
        const defaults = {
            type: 'basic',
            title: '',
            content: '',
            footer: '',
            size: 'medium',
            preventClose: false,
            onOpen: null,
            onClose: null,
            onConfirm: null,
            onCancel: null,
            confirmText: 'Confirm',
            cancelText: 'Cancel'
        };
        
        const options = { ...defaults, ...config };
        const id = this.generateId();
        
        // Create modal element
        const modalHtml = this.templates[options.type] || this.templates.basic;
        const modalElement = this.createElementFromHTML(modalHtml);
        modalElement.id = id;
        
        // Add size class
        modalElement.classList.add(`modal--${options.size}`);
        
        // Set content
        if (options.type === 'image') {
            this.setupImageModal(modalElement, options);
        } else {
            this.setupContentModal(modalElement, options);
        }
        
        // Add to DOM
        document.body.appendChild(modalElement);
        
        // Initialize modal
        this.initExistingModals();
        
        // Open modal
        this.open(id, options);
        
        return id;
    },
    
    /**
     * Set up content modal
     */
    setupContentModal(modalElement, options) {
        const title = modalElement.querySelector('.modal__title');
        const body = modalElement.querySelector('.modal__body');
        const footer = modalElement.querySelector('.modal__footer');
        
        if (title) title.textContent = options.title;
        if (body) body.innerHTML = options.content;
        if (footer && options.footer) footer.innerHTML = options.footer;
        
        // Set up confirm modal
        if (options.type === 'confirm') {
            const confirmBtn = modalElement.querySelector('.modal__confirm');
            const cancelBtn = modalElement.querySelector('.modal__cancel');
            
            if (confirmBtn) {
                confirmBtn.textContent = options.confirmText;
                confirmBtn.addEventListener('click', () => {
                    if (options.onConfirm) options.onConfirm();
                    this.close(modalElement.id);
                });
            }
            
            if (cancelBtn) {
                cancelBtn.textContent = options.cancelText;
                cancelBtn.addEventListener('click', () => {
                    if (options.onCancel) options.onCancel();
                    this.close(modalElement.id);
                });
            }
        }
    },
    
    /**
     * Set up image modal
     */
    setupImageModal(modalElement, options) {
        const img = modalElement.querySelector('.modal__image');
        const caption = modalElement.querySelector('.modal__image-caption');
        
        if (img && options.image) {
            img.src = options.image;
            img.alt = options.alt || '';
        }
        
        if (caption && options.caption) {
            caption.textContent = options.caption;
        }
    },
    
    /**
     * Open modal
     */
    open(id, config = {}) {
        const modal = document.getElementById(id);
        
        if (!modal || this.state.isAnimating) {
            console.warn(`Modal not found: ${id}`);
            return;
        }
        
        this.state.isAnimating = true;
        
        // Store scroll position
        this.state.scrollPosition = window.pageYOffset;
        
        // Add to active modals
        this.state.activeModals.push({ id, config });
        
        // Lock body scroll
        document.body.classList.add(this.config.openClass);
        document.body.style.top = `-${this.state.scrollPosition}px`;
        
        // Show modal
        modal.style.display = 'block';
        
        // Force reflow
        modal.offsetHeight;
        
        // Add active class
        requestAnimationFrame(() => {
            modal.classList.add(this.config.activeClass);
            
            // Focus management
            this.trapFocus(modal);
            
            // Callback
            if (config.onOpen) config.onOpen(modal);
            
            // Emit event
            this.emitEvent('modal:open', { id, modal });
            
            // Reset animation flag
            setTimeout(() => {
                this.state.isAnimating = false;
            }, this.config.animationDuration);
        });
    },
    
    /**
     * Close modal
     */
    close(id) {
        const modal = document.getElementById(id);
        const modalIndex = this.state.activeModals.findIndex(m => m.id === id);
        
        if (!modal || modalIndex === -1 || this.state.isAnimating) {
            return;
        }
        
        this.state.isAnimating = true;
        
        const modalConfig = this.state.activeModals[modalIndex];
        
        // Remove active class
        modal.classList.remove(this.config.activeClass);
        
        // Wait for animation
        setTimeout(() => {
            // Hide modal
            modal.style.display = 'none';
            
            // Remove from active modals
            this.state.activeModals.splice(modalIndex, 1);
            
            // Restore body scroll if no more modals
            if (this.state.activeModals.length === 0) {
                document.body.classList.remove(this.config.openClass);
                document.body.style.top = '';
                window.scrollTo(0, this.state.scrollPosition);
            }
            
            // Release focus trap
            this.releaseFocusTrap();
            
            // Remove dynamic modals
            if (modal.hasAttribute('data-dynamic')) {
                modal.remove();
            }
            
            // Callback
            if (modalConfig.config.onClose) {
                modalConfig.config.onClose(modal);
            }
            
            // Emit event
            this.emitEvent('modal:close', { id, modal });
            
            // Reset animation flag
            this.state.isAnimating = false;
        }, this.config.animationDuration);
    },
    
    /**
     * Close all modals
     */
    closeAll() {
        const modals = [...this.state.activeModals];
        modals.forEach(modal => this.close(modal.id));
    },
    
    /**
     * Trap focus within modal
     */
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], ' +
            'input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        // Store previous focus
        this.previousFocus = document.activeElement;
        
        // Focus first element
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Handle tab key
        this.focusTrapHandler = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        
        modal.addEventListener('keydown', this.focusTrapHandler);
    },
    
    /**
     * Release focus trap
     */
    releaseFocusTrap() {
        if (this.focusTrapHandler) {
            const activeModal = this.state.activeModals[this.state.activeModals.length - 1];
            if (activeModal) {
                const modal = document.getElementById(activeModal.id);
                if (modal) {
                    modal.removeEventListener('keydown', this.focusTrapHandler);
                }
            }
        }
        
        // Restore previous focus
        if (this.previousFocus && this.previousFocus.focus) {
            this.previousFocus.focus();
        }
    },
    
    /**
     * Create element from HTML string
     */
    createElementFromHTML(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    },
    
    /**
     * Generate unique ID
     */
    generateId() {
        return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Emit custom event
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true
        });
        document.dispatchEvent(event);
    },
    
    /**
     * Public API: Confirm dialog
     */
    confirm(message, onConfirm, onCancel) {
        return this.create({
            type: 'confirm',
            title: 'Confirm Action',
            content: message,
            onConfirm,
            onCancel
        });
    },
    
    /**
     * Public API: Alert dialog
     */
    alert(message, title = 'Alert') {
        return this.create({
            type: 'basic',
            title,
            content: message,
            footer: '<button class="btn btn--primary" onclick="ModalManager.close(this.closest(\'.modal\').id)">OK</button>'
        });
    },
    
    /**
     * Public API: Image lightbox
     */
    image(src, caption = '', alt = '') {
        return this.create({
            type: 'image',
            image: src,
            caption,
            alt,
            size: 'large'
        });
    }
};

// Export
window.ModalManager = ModalManager;