/* ========================================
   Stratosphere Consulting - Theme Manager
   File: assets/js/core/theme.js
   
   Dark mode toggle and theme management
   ======================================== */

const ThemeManager = {
    // Configuration
    config: {
        storageKey: 'stratosphere-theme',
        defaultTheme: 'light',
        themes: ['light', 'dark'],
        transitionDuration: 300
    },
    
    // State
    state: {
        currentTheme: null,
        isTransitioning: false
    },
    
    // Elements
    elements: {
        toggle: null,
        root: null
    },
    
    /**
     * Initialize theme manager
     */
    init() {
        // Get elements
        this.elements.root = document.documentElement;
        this.elements.toggle = document.getElementById('theme-toggle');
        
        if (!this.elements.toggle) {
            console.warn('Theme toggle button not found');
            return;
        }
        
        // Load saved theme or detect system preference
        this.loadTheme();
        
        // Set up event listeners
        this.bindEvents();
        
        // Watch for system theme changes
        this.watchSystemTheme();
        
        console.log('Theme Manager initialized');
    },
    
    /**
     * Load theme from storage or system
     */
    loadTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem(this.config.storageKey);
        
        if (savedTheme && this.config.themes.includes(savedTheme)) {
            this.setTheme(savedTheme, false);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light', false);
        }
    },
    
    /**
     * Set theme
     */
    setTheme(theme, animate = true) {
        if (!this.config.themes.includes(theme)) {
            console.error(`Invalid theme: ${theme}`);
            return;
        }
        
        if (theme === this.state.currentTheme) {
            return;
        }
        
        // Add transition class if animating
        if (animate && !this.state.isTransitioning) {
            this.state.isTransitioning = true;
            this.elements.root.classList.add('theme-transitioning');
            
            setTimeout(() => {
                this.state.isTransitioning = false;
                this.elements.root.classList.remove('theme-transitioning');
            }, this.config.transitionDuration);
        }
        
        // Update theme
        this.elements.root.setAttribute('data-theme', theme);
        this.state.currentTheme = theme;
        
        // Save to localStorage
        localStorage.setItem(this.config.storageKey, theme);
        
        // Update meta theme color
        this.updateMetaThemeColor(theme);
        
        // Emit event
        this.emitThemeChange(theme);
        
        // Update toggle button aria-label
        if (this.elements.toggle) {
            const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
            this.elements.toggle.setAttribute('aria-label', label);
        }
    },
    
    /**
     * Toggle theme
     */
    toggle() {
        const newTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle button click
        this.elements.toggle.addEventListener('click', () => {
            this.toggle();
        });
        
        // Keyboard accessibility
        this.elements.toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });
    },
    
    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        if (!window.matchMedia) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', (e) => {
                // Only update if user hasn't manually set a preference
                const savedTheme = localStorage.getItem(this.config.storageKey);
                if (!savedTheme) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        } else if (mediaQuery.addListener) {
            // Older browsers
            mediaQuery.addListener((e) => {
                const savedTheme = localStorage.getItem(this.config.storageKey);
                if (!savedTheme) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    },
    
    /**
     * Update meta theme color
     */
    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) return;
        
        // Get color from CSS custom property
        const color = theme === 'dark' ? '#0a0e27' : '#fafbff';
        metaThemeColor.setAttribute('content', color);
    },
    
    /**
     * Emit theme change event
     */
    emitThemeChange(theme) {
        const event = new CustomEvent('theme:change', {
            detail: { theme },
            bubbles: true
        });
        document.dispatchEvent(event);
    },
    
    /**
     * Public API
     */
    getTheme() {
        return this.state.currentTheme;
    },
    
    isDark() {
        return this.state.currentTheme === 'dark';
    },
    
    isLight() {
        return this.state.currentTheme === 'light';
    }
};

// Add theme transition styles
const style = document.createElement('style');
style.textContent = `
    .theme-transitioning,
    .theme-transitioning *,
    .theme-transitioning *::before,
    .theme-transitioning *::after {
        transition: background-color ${ThemeManager.config.transitionDuration}ms ease-in-out,
                    color ${ThemeManager.config.transitionDuration}ms ease-in-out,
                    border-color ${ThemeManager.config.transitionDuration}ms ease-in-out,
                    box-shadow ${ThemeManager.config.transitionDuration}ms ease-in-out !important;
    }
`;
document.head.appendChild(style);

// Export
window.ThemeManager = ThemeManager;