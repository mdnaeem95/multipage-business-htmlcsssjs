/* ========================================
   Stratosphere Consulting - Main Application
   File: assets/js/core/app.js
   
   Core application initialization and orchestration
   ======================================== */

// App namespace
const StratosphereApp = {
    // Configuration
    config: {
        debug: false,
        scrollOffset: 80,
        animationDelay: 100,
        breakpoints: {
            mobile: 640,
            tablet: 768,
            desktop: 1024,
            wide: 1280
        }
    },
    
    // State
    state: {
        isInitialized: false,
        currentPage: null,
        isMobile: false,
        isTablet: false,
        isDesktop: false
    },
    
    // Modules
    modules: {},
    
    /**
     * Initialize the application
     */
    init() {
        if (this.state.isInitialized) {
            console.warn('App already initialized');
            return;
        }
        
        this.log('Initializing Stratosphere App...');
        
        // Set current page
        this.detectCurrentPage();
        
        // Initialize device detection
        this.detectDevice();
        
        // Initialize core modules
        this.initCoreModules();
        
        // Initialize page-specific modules
        this.initPageModules();
        
        // Set up global event listeners
        this.initGlobalEvents();
        
        // Mark as initialized
        this.state.isInitialized = true;
        
        this.log('App initialization complete');
    },
    
    /**
     * Detect current page
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const pageName = path === '/' ? 'home' : path.replace('/', '').replace('.html', '');
        this.state.currentPage = pageName;
        document.body.setAttribute('data-page', pageName);
        this.log(`Current page: ${pageName}`);
    },
    
    /**
     * Detect device type
     */
    detectDevice() {
        const width = window.innerWidth;
        
        this.state.isMobile = width < this.config.breakpoints.tablet;
        this.state.isTablet = width >= this.config.breakpoints.tablet && width < this.config.breakpoints.desktop;
        this.state.isDesktop = width >= this.config.breakpoints.desktop;
        
        // Add device class to body
        document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
        
        if (this.state.isMobile) {
            document.body.classList.add('device-mobile');
        } else if (this.state.isTablet) {
            document.body.classList.add('device-tablet');
        } else {
            document.body.classList.add('device-desktop');
        }
    },
    
    /**
     * Initialize core modules
     */
    initCoreModules() {
        // Theme Manager
        if (typeof ThemeManager !== 'undefined') {
            this.modules.theme = ThemeManager;
            ThemeManager.init();
        }
        
        // Navigation
        if (typeof NavigationManager !== 'undefined') {
            this.modules.navigation = NavigationManager;
            NavigationManager.init();
        }
        
        // Animation Manager
        if (typeof AnimationManager !== 'undefined') {
            this.modules.animations = AnimationManager;
            AnimationManager.init();
        }
        
        // Form Validation
        if (typeof FormValidator !== 'undefined') {
            this.modules.forms = FormValidator;
            FormValidator.init();
        }
        
        // Utility functions
        if (typeof Utils !== 'undefined') {
            this.modules.utils = Utils;
        }
    },
    
    /**
     * Initialize page-specific modules
     */
    initPageModules() {
        const pageName = this.state.currentPage;
        const pageModule = window[`${this.capitalize(pageName)}Page`];
        
        if (pageModule && typeof pageModule.init === 'function') {
            this.log(`Initializing ${pageName} page module`);
            pageModule.init();
            this.modules[pageName] = pageModule;
        }
    },
    
    /**
     * Initialize global event listeners
     */
    initGlobalEvents() {
        // Window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.detectDevice();
                this.emit('app:resize', {
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }, 250);
        });
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            this.emit('app:visibility', {
                visible: !document.hidden
            });
        });
        
        // Network status
        window.addEventListener('online', () => {
            this.emit('app:online', { online: true });
        });
        
        window.addEventListener('offline', () => {
            this.emit('app:online', { online: false });
        });
        
        // Back to top button
        this.initBackToTop();
        
        // Smooth scrolling for anchor links
        this.initSmoothScroll();
        
        // External link handling
        this.initExternalLinks();
    },
    
    /**
     * Initialize back to top button
     */
    initBackToTop() {
        const button = document.getElementById('back-to-top');
        if (!button) return;
        
        // Show/hide based on scroll position
        let scrollTimer;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                if (window.scrollY > 500) {
                    button.classList.add('visible');
                } else {
                    button.classList.remove('visible');
                }
            }, 100);
        });
        
        // Scroll to top on click
        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },
    
    /**
     * Initialize smooth scrolling for anchor links
     */
    initSmoothScroll() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            
            const targetId = link.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (!target) return;
            
            e.preventDefault();
            
            const offset = this.config.scrollOffset;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL
            history.pushState(null, '', targetId);
        });
    },
    
    /**
     * Initialize external link handling
     */
    initExternalLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="http"]');
            if (!link) return;
            
            const url = new URL(link.href);
            if (url.hostname !== window.location.hostname) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    },
    
    /**
     * Event emitter
     */
    emit(eventName, data = {}) {
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true
        });
        document.dispatchEvent(event);
        this.log(`Event emitted: ${eventName}`, data);
    },
    
    /**
     * Event listener helper
     */
    on(eventName, callback) {
        document.addEventListener(eventName, callback);
    },
    
    /**
     * Remove event listener
     */
    off(eventName, callback) {
        document.removeEventListener(eventName, callback);
    },
    
    /**
     * Utility: Capitalize string
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    /**
     * Utility: Debug logger
     */
    log(...args) {
        if (this.config.debug) {
            console.log('[Stratosphere]', ...args);
        }
    },
    
    /**
     * Utility: Get module
     */
    getModule(name) {
        return this.modules[name] || null;
    },
    
    /**
     * Public API
     */
    api: {
        /**
         * Show notification
         */
        notify(message, type = 'info', duration = 3000) {
            if (typeof NotificationManager !== 'undefined') {
                NotificationManager.show(message, type, duration);
            }
        },
        
        /**
         * Show loading state
         */
        showLoader() {
            document.body.classList.add('loading');
        },
        
        /**
         * Hide loading state
         */
        hideLoader() {
            document.body.classList.remove('loading');
        },
        
        /**
         * Scroll to element
         */
        scrollTo(element, offset = 80) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            
            if (!element) return;
            
            const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        },
        
        /**
         * Get current breakpoint
         */
        getBreakpoint() {
            const width = window.innerWidth;
            
            if (width < StratosphereApp.config.breakpoints.mobile) {
                return 'xs';
            } else if (width < StratosphereApp.config.breakpoints.tablet) {
                return 'sm';
            } else if (width < StratosphereApp.config.breakpoints.desktop) {
                return 'md';
            } else if (width < StratosphereApp.config.breakpoints.wide) {
                return 'lg';
            } else {
                return 'xl';
            }
        }
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        StratosphereApp.init();
    });
} else {
    StratosphereApp.init();
}

// Export for use in other modules
window.StratosphereApp = StratosphereApp;
window.App = StratosphereApp.api; // Shorthand API access