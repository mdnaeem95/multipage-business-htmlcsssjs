/* ========================================
   Stratosphere Consulting - Navigation Manager
   File: assets/js/core/navigation.js
   
   Header navigation, mobile menu, and scroll behavior
   ======================================== */

const NavigationManager = {
    // Configuration
    config: {
        headerHeight: 80,
        scrollThreshold: 50,
        mobileBreakpoint: 1024,
        animationDuration: 300
    },
    
    // State
    state: {
        isScrolled: false,
        isMobileMenuOpen: false,
        lastScrollPosition: 0,
        isHeaderHidden: false
    },
    
    // Elements
    elements: {
        header: null,
        mobileToggle: null,
        mobileMenu: null,
        navLinks: null,
        dropdownItems: null
    },
    
    /**
     * Initialize navigation
     */
    init() {
        // Get elements
        this.elements.header = document.getElementById('header');
        this.elements.mobileToggle = document.getElementById('mobile-menu-toggle');
        this.elements.mobileMenu = document.getElementById('mobile-menu');
        this.elements.navLinks = document.querySelectorAll('.nav__link, .mobile-menu__link');
        this.elements.dropdownItems = document.querySelectorAll('.nav__item');
        
        if (!this.elements.header) {
            console.warn('Header element not found');
            return;
        }
        
        // Set up event listeners
        this.bindEvents();
        
        // Initialize scroll behavior
        this.initScrollBehavior();
        
        // Set active navigation state
        this.setActiveNavigation();
        
        // Initialize dropdown menus
        this.initDropdowns();
        
        console.log('Navigation Manager initialized');
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Mobile menu toggle
        if (this.elements.mobileToggle && this.elements.mobileMenu) {
            this.elements.mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
            
            // Close mobile menu on link click
            this.elements.mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
            });
            
            // Close mobile menu on outside click
            document.addEventListener('click', (e) => {
                if (this.state.isMobileMenuOpen && 
                    !this.elements.mobileMenu.contains(e.target) && 
                    !this.elements.mobileToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
        
        // Window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth >= this.config.mobileBreakpoint && this.state.isMobileMenuOpen) {
                    this.closeMobileMenu();
                }
            }, 250);
        });
        
        // Escape key to close mobile menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isMobileMenuOpen) {
                this.closeMobileMenu();
                this.elements.mobileToggle.focus();
            }
        });
    },
    
    /**
     * Initialize scroll behavior
     */
    initScrollBehavior() {
        let scrollTimer;
        
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                this.handleScroll();
            }, 10);
        }, { passive: true });
        
        // Initial check
        this.handleScroll();
    },
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        const currentScroll = window.scrollY;
        
        // Add/remove scrolled class
        if (currentScroll > this.config.scrollThreshold) {
            if (!this.state.isScrolled) {
                this.state.isScrolled = true;
                this.elements.header.classList.add('scrolled');
            }
        } else {
            if (this.state.isScrolled) {
                this.state.isScrolled = false;
                this.elements.header.classList.remove('scrolled');
            }
        }
        
        // Hide/show header on scroll (optional)
        if (this.config.hideOnScroll) {
            if (currentScroll > this.state.lastScrollPosition && currentScroll > this.config.headerHeight) {
                // Scrolling down
                if (!this.state.isHeaderHidden) {
                    this.state.isHeaderHidden = true;
                    this.elements.header.style.transform = `translateY(-${this.config.headerHeight}px)`;
                }
            } else {
                // Scrolling up
                if (this.state.isHeaderHidden) {
                    this.state.isHeaderHidden = false;
                    this.elements.header.style.transform = 'translateY(0)';
                }
            }
        }
        
        this.state.lastScrollPosition = currentScroll;
    },
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.state.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    },
    
    /**
     * Open mobile menu
     */
    openMobileMenu() {
        this.state.isMobileMenuOpen = true;
        this.elements.mobileToggle.classList.add('active');
        this.elements.mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Trap focus
        this.trapFocus(this.elements.mobileMenu);
        
        // Announce to screen readers
        this.elements.mobileMenu.setAttribute('aria-hidden', 'false');
        
        // Emit event
        document.dispatchEvent(new CustomEvent('navigation:mobileMenuOpen'));
    },
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.state.isMobileMenuOpen = false;
        this.elements.mobileToggle.classList.remove('active');
        this.elements.mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        
        // Release focus trap
        this.releaseFocusTrap();
        
        // Announce to screen readers
        this.elements.mobileMenu.setAttribute('aria-hidden', 'true');
        
        // Emit event
        document.dispatchEvent(new CustomEvent('navigation:mobileMenuClose'));
    },
    
    /**
     * Set active navigation state
     */
    setActiveNavigation() {
        const currentPath = window.location.pathname;
        
        this.elements.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Remove active class
            link.classList.remove('nav__link--active', 'mobile-menu__link--active');
            
            // Add active class to current page
            if (href === currentPath || (currentPath === '/' && href === '/index.html')) {
                if (link.classList.contains('nav__link')) {
                    link.classList.add('nav__link--active');
                } else if (link.classList.contains('mobile-menu__link')) {
                    link.classList.add('mobile-menu__link--active');
                }
            }
        });
    },
    
    /**
     * Initialize dropdown menus
     */
    initDropdowns() {
        this.elements.dropdownItems.forEach(item => {
            const dropdown = item.querySelector('.nav__dropdown');
            if (!dropdown) return;
            
            let hoverTimer;
            
            // Mouse enter
            item.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimer);
                this.openDropdown(dropdown);
            });
            
            // Mouse leave
            item.addEventListener('mouseleave', () => {
                hoverTimer = setTimeout(() => {
                    this.closeDropdown(dropdown);
                }, 200);
            });
            
            // Keyboard navigation
            const link = item.querySelector('.nav__link');
            if (link) {
                link.addEventListener('focus', () => {
                    this.openDropdown(dropdown);
                });
                
                // Close when focus leaves dropdown
                const lastDropdownLink = dropdown.querySelector('.nav__dropdown-link:last-child');
                if (lastDropdownLink) {
                    lastDropdownLink.addEventListener('blur', (e) => {
                        if (!item.contains(e.relatedTarget)) {
                            this.closeDropdown(dropdown);
                        }
                    });
                }
            }
        });
    },
    
    /**
     * Open dropdown
     */
    openDropdown(dropdown) {
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'translateY(0)';
    },
    
    /**
     * Close dropdown
     */
    closeDropdown(dropdown) {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-10px)';
    },
    
    /**
     * Trap focus within element
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
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
        
        element.addEventListener('keydown', this.focusTrapHandler);
        
        // Focus first element
        if (firstFocusable) {
            firstFocusable.focus();
        }
    },
    
    /**
     * Release focus trap
     */
    releaseFocusTrap() {
        if (this.focusTrapHandler && this.elements.mobileMenu) {
            this.elements.mobileMenu.removeEventListener('keydown', this.focusTrapHandler);
            this.focusTrapHandler = null;
        }
    },
    
    /**
     * Public API
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },
    
    getHeaderHeight() {
        return this.elements.header ? this.elements.header.offsetHeight : 0;
    },
    
    hideHeader() {
        if (this.elements.header) {
            this.elements.header.style.transform = `translateY(-${this.config.headerHeight}px)`;
        }
    },
    
    showHeader() {
        if (this.elements.header) {
            this.elements.header.style.transform = 'translateY(0)';
        }
    }
};

// Export
window.NavigationManager = NavigationManager;