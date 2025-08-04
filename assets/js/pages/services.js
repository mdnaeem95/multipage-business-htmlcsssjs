/* ========================================
   Stratosphere Consulting - Services Page Scripts
   File: assets/js/pages/services.js
   
   Services page-specific functionality
   ======================================== */

const ServicesPage = {
    // Configuration
    config: {
        stickyNavOffset: 100,
        scrollSpyOffset: 200,
        animationDelay: 100
    },
    
    // State
    state: {
        activeSection: null,
        isNavSticky: false
    },
    
    // Elements
    elements: {
        serviceNav: null,
        serviceNavLinks: null,
        serviceSections: null,
        header: null
    },
    
    /**
     * Initialize services page
     */
    init() {
        console.log('Initializing services page...');
        
        // Get elements
        this.getElements();
        
        // Initialize service navigation
        this.initServiceNavigation();
        
        // Initialize scroll spy
        this.initScrollSpy();
        
        // Initialize service cards
        this.initServiceCards();
        
        // Initialize process timeline
        this.initProcessTimeline();
        
        // Initialize page animations
        this.initPageAnimations();
        
        // Initialize expandable content
        this.initExpandableContent();
    },
    
    /**
     * Get page elements
     */
    getElements() {
        this.elements.serviceNav = document.querySelector('.service-nav');
        this.elements.serviceNavLinks = document.querySelectorAll('.service-nav__link');
        this.elements.serviceSections = document.querySelectorAll('.service-detail');
        this.elements.header = document.getElementById('header');
    },
    
    /**
     * Initialize service navigation
     */
    initServiceNavigation() {
        if (!this.elements.serviceNav || !this.elements.serviceNavLinks.length) return;
        
        // Smooth scroll to sections
        this.elements.serviceNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    const offset = this.elements.header ? this.elements.header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL
                    history.pushState(null, '', targetId);
                }
            });
        });
        
        // Make navigation sticky on scroll
        this.initStickyNav();
    },
    
    /**
     * Initialize sticky navigation
     */
    initStickyNav() {
        const navContainer = this.elements.serviceNav.parentElement;
        const navOffset = navContainer.offsetTop;
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const headerHeight = this.elements.header ? this.elements.header.offsetHeight : 0;
            
            if (scrollY > navOffset - headerHeight) {
                if (!this.state.isNavSticky) {
                    this.state.isNavSticky = true;
                    this.elements.serviceNav.classList.add('sticky');
                    navContainer.style.height = `${this.elements.serviceNav.offsetHeight}px`;
                }
            } else {
                if (this.state.isNavSticky) {
                    this.state.isNavSticky = false;
                    this.elements.serviceNav.classList.remove('sticky');
                    navContainer.style.height = '';
                }
            }
        });
    },
    
    /**
     * Initialize scroll spy
     */
    initScrollSpy() {
        if (!this.elements.serviceSections.length) return;
        
        const observerOptions = {
            rootMargin: `-${this.config.scrollSpyOffset}px 0px -50% 0px`,
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    this.setActiveNavItem(sectionId);
                }
            });
        }, observerOptions);
        
        // Observe all service sections
        this.elements.serviceSections.forEach(section => {
            observer.observe(section);
        });
    },
    
    /**
     * Set active navigation item
     */
    setActiveNavItem(sectionId) {
        this.elements.serviceNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        this.state.activeSection = sectionId;
    },
    
    /**
     * Initialize service cards
     */
    initServiceCards() {
        const serviceCards = document.querySelectorAll('.service-overview-card');
        
        serviceCards.forEach((card, index) => {
            // Add entrance animation delay
            card.style.animationDelay = `${index * this.config.animationDelay}ms`;
            
            // Enhanced hover effects
            card.addEventListener('mouseenter', () => {
                // Scale neighboring cards slightly down
                const allCards = document.querySelectorAll('.service-overview-card');
                allCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.style.transform = 'scale(0.95)';
                        otherCard.style.opacity = '0.7';
                    }
                });
            });
            
            card.addEventListener('mouseleave', () => {
                // Reset all cards
                const allCards = document.querySelectorAll('.service-overview-card');
                allCards.forEach(otherCard => {
                    otherCard.style.transform = '';
                    otherCard.style.opacity = '';
                });
            });
            
            // Smooth scroll on click
            const link = card.querySelector('.service-overview-card__link');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    const target = document.querySelector(targetId);
                    
                    if (target) {
                        const offset = this.elements.header ? this.elements.header.offsetHeight : 0;
                        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            }
        });
    },
    
    /**
     * Initialize process timeline
     */
    initProcessTimeline() {
        const processSteps = document.querySelectorAll('.process-step');
        
        if (!processSteps.length) return;
        
        // Create intersection observer for timeline animation
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('process-step--visible');
                        
                        // Animate the number
                        const number = entry.target.querySelector('.process-step__number');
                        if (number) {
                            number.style.animation = 'pulse 0.6s ease-out';
                        }
                    }, index * 200);
                    
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        // Observe all process steps
        processSteps.forEach(step => {
            timelineObserver.observe(step);
        });
        
        // Add hover effects
        processSteps.forEach(step => {
            step.addEventListener('mouseenter', () => {
                const allSteps = document.querySelectorAll('.process-step');
                allSteps.forEach(otherStep => {
                    if (otherStep !== step) {
                        otherStep.style.opacity = '0.5';
                    }
                });
            });
            
            step.addEventListener('mouseleave', () => {
                const allSteps = document.querySelectorAll('.process-step');
                allSteps.forEach(otherStep => {
                    otherStep.style.opacity = '';
                });
            });
        });
    },
    
    /**
     * Initialize expandable content
     */
    initExpandableContent() {
        const serviceFeatures = document.querySelectorAll('.service-feature');
        
        serviceFeatures.forEach(feature => {
            const content = feature.querySelector('.service-feature__content p');
            if (!content) return;
            
            // Check if content is long enough to warrant expansion
            const fullText = content.textContent;
            const words = fullText.split(' ');
            
            if (words.length > 20) {
                // Truncate and add expand functionality
                const truncatedText = words.slice(0, 20).join(' ');
                const remainingText = words.slice(20).join(' ');
                
                content.innerHTML = `
                    <span class="truncated-text">${truncatedText}...</span>
                    <span class="full-text" style="display: none;">${fullText}</span>
                    <button class="expand-btn">Read more</button>
                `;
                
                const expandBtn = content.querySelector('.expand-btn');
                const truncatedSpan = content.querySelector('.truncated-text');
                const fullSpan = content.querySelector('.full-text');
                
                expandBtn.addEventListener('click', () => {
                    if (truncatedSpan.style.display !== 'none') {
                        truncatedSpan.style.display = 'none';
                        fullSpan.style.display = 'inline';
                        expandBtn.textContent = 'Read less';
                    } else {
                        truncatedSpan.style.display = 'inline';
                        fullSpan.style.display = 'none';
                        expandBtn.textContent = 'Read more';
                    }
                });
            }
        });
    },
    
    /**
     * Initialize page animations
     */
    initPageAnimations() {
        // Animate service stats
        const serviceStats = document.querySelectorAll('.service-stat__number');
        
        serviceStats.forEach(stat => {
            const value = stat.textContent;
            const isPercentage = value.includes('%');
            const isMultiplier = value.includes('x');
            
            if (isPercentage) {
                const number = parseInt(value);
                stat.setAttribute('data-counter', number);
                stat.textContent = '0';
                stat.setAttribute('data-suffix', '%');
            } else if (isMultiplier) {
                const number = parseFloat(value);
                stat.setAttribute('data-counter', number);
                stat.textContent = '0';
                stat.setAttribute('data-suffix', 'x');
            }
        });
        
        // Parallax effect for service visuals
        const serviceVisuals = document.querySelectorAll('.service-visual');
        
        if (serviceVisuals.length) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                
                serviceVisuals.forEach((visual, index) => {
                    const rect = visual.getBoundingClientRect();
                    const speed = index % 2 === 0 ? 0.5 : -0.5;
                    
                    if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                        const yPos = -(scrolled - visual.offsetTop) * speed * 0.1;
                        visual.style.transform = `translateY(${yPos}px)`;
                    }
                });
            });
        }
        
        // Add floating animation to service icons
        const serviceIcons = document.querySelectorAll('.service-overview-card__icon, .service-feature__icon');
        
        serviceIcons.forEach((icon, index) => {
            icon.style.animation = `float ${3 + (index % 3)}s ease-in-out ${index * 0.2}s infinite`;
        });
        
        // Initialize intersection observer for reveal animations
        this.initRevealAnimations();
    },
    
    /**
     * Initialize reveal animations
     */
    initRevealAnimations() {
        const revealElements = document.querySelectorAll(
            '.service-detail__content, .service-visual, .process-step'
        );
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        revealElements.forEach(element => {
            element.classList.add('reveal-on-scroll');
            revealObserver.observe(element);
        });
    }
};

// Add required styles
const style = document.createElement('style');
style.textContent = `
    /* Sticky navigation styles */
    .service-nav.sticky {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-primary);
        padding: var(--space-3);
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-lg);
        z-index: var(--z-30);
        transition: all var(--transition-base) var(--ease-in-out);
    }
    
    .service-nav.sticky .service-nav__link {
        background-color: transparent;
        color: var(--text-primary);
        border-color: transparent;
    }
    
    .service-nav.sticky .service-nav__link:hover,
    .service-nav.sticky .service-nav__link.active {
        background-color: var(--color-primary);
        color: var(--color-white);
    }
    
    /* Process step visible state */
    .process-step {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .process-step--visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Expand button */
    .expand-btn {
        background: none;
        border: none;
        color: var(--color-primary);
        font-weight: var(--font-semibold);
        cursor: pointer;
        margin-left: var(--space-1);
        font-size: var(--text-sm);
        text-decoration: underline;
        transition: color var(--transition-base) var(--ease-in-out);
    }
    
    .expand-btn:hover {
        color: var(--color-primary-dark);
    }
    
    /* Float animation */
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    /* Pulse animation */
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    /* Reveal animations */
    .reveal-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .reveal-on-scroll.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Service detail animations */
    .service-detail__content.reveal-on-scroll {
        transform: translateX(-30px);
    }
    
    .service-detail__content.reveal-on-scroll.revealed {
        transform: translateX(0);
    }
    
    .service-visual.reveal-on-scroll {
        transform: scale(0.95);
    }
    
    .service-visual.reveal-on-scroll.revealed {
        transform: scale(1);
    }
`;

document.head.appendChild(style);

// Export
window.ServicesPage = ServicesPage;