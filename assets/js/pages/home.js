/* ========================================
   Stratosphere Consulting - Homepage Scripts
   File: assets/js/pages/home.js
   
   Homepage-specific functionality
   ======================================== */

const HomePage = {
    // Configuration
    config: {
        heroAnimationDelay: 300,
        clientLogosSpeed: 30000,
        statsCountDuration: 2500
    },
    
    /**
     * Initialize homepage
     */
    init() {
        console.log('Initializing homepage...');
        
        // Initialize hero section
        this.initHero();
        
        // Initialize client logos
        this.initClientLogos();
        
        // Initialize services hover effects
        this.initServices();
        
        // Initialize testimonials carousel
        this.initTestimonials();
        
        // Initialize CTA section
        this.initCTA();
        
        // Add page-specific animations
        this.initPageAnimations();
    },
    
    /**
     * Initialize hero section
     */
    initHero() {
        // Animate hero elements on load
        const heroElements = [
            '.hero__badge',
            '.hero__title',
            '.hero__description',
            '.hero__actions',
            '.hero__stats',
            '.hero__visual'
        ];
        
        heroElements.forEach((selector, index) => {
            const element = document.querySelector(selector);
            if (element) {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * this.config.heroAnimationDelay);
            }
        });
        
        // Initialize hero background animation
        this.initHeroBackground();
        
        // Smooth scroll for hero CTA
        const heroCTA = document.getElementById('start-trial-btn');
        if (heroCTA) {
            heroCTA.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector('#cta');
                if (target) {
                    Utils.scrollToElement(target, 80);
                }
            });
        }
    },
    
    /**
     * Initialize hero background animation
     */
    initHeroBackground() {
        const heroPattern = document.querySelector('.hero__pattern');
        if (!heroPattern) return;
        
        // Mouse move parallax effect
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        
        function animate() {
            currentX += (mouseX - currentX) * 0.05;
            currentY += (mouseY - currentY) * 0.05;
            
            heroPattern.style.transform = `translate(${currentX * 20}px, ${currentY * 20}px)`;
            
            requestAnimationFrame(animate);
        }
        
        animate();
    },
    
    /**
     * Initialize client logos carousel
     */
    initClientLogos() {
        const logosTrack = document.querySelector('.client-logos__track');
        if (!logosTrack) return;
        
        // Clone logos for seamless loop
        const logos = Array.from(logosTrack.children);
        logos.forEach(logo => {
            const clone = logo.cloneNode(true);
            logosTrack.appendChild(clone);
        });
        
        // Set animation duration based on number of logos
        const totalWidth = logos.length * 200; // Approximate width per logo
        const duration = totalWidth / 100 * 1000; // pixels per second
        
        logosTrack.style.animationDuration = `${duration}ms`;
        
        // Pause on hover
        logosTrack.addEventListener('mouseenter', () => {
            logosTrack.style.animationPlayState = 'paused';
        });
        
        logosTrack.addEventListener('mouseleave', () => {
            logosTrack.style.animationPlayState = 'running';
        });
    },
    
    /**
     * Initialize services section
     */
    initServices() {
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach((card, index) => {
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                // Scale up current card
                card.style.transform = 'translateY(-8px) scale(1.02)';
                
                // Slightly scale down other cards
                serviceCards.forEach((otherCard, otherIndex) => {
                    if (otherIndex !== index) {
                        otherCard.style.transform = 'scale(0.98)';
                        otherCard.style.opacity = '0.7';
                    }
                });
            });
            
            card.addEventListener('mouseleave', () => {
                // Reset all cards
                serviceCards.forEach(c => {
                    c.style.transform = '';
                    c.style.opacity = '';
                });
            });
            
            // Add click animation
            const link = card.querySelector('.service-card__link');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Add ripple effect
                    const ripple = document.createElement('div');
                    ripple.className = 'ripple';
                    ripple.style.left = e.offsetX + 'px';
                    ripple.style.top = e.offsetY + 'px';
                    card.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                        window.location.href = link.href;
                    }, 600);
                });
            }
        });
    },
    
    /**
     * Initialize testimonials
     */
    initTestimonials() {
        // CarouselManager will handle the carousel
        // Add any homepage-specific testimonial features here
        
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        testimonialCards.forEach(card => {
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'scale(1)';
            });
        });
    },
    
    /**
     * Initialize CTA section
     */
    initCTA() {
        const ctaSection = document.querySelector('.cta-section');
        if (!ctaSection) return;
        
        // Add parallax effect to CTA background
        const ctaPattern = ctaSection.querySelector('.cta-section__pattern');
        if (ctaPattern) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                ctaPattern.style.transform = `translateY(${rate}px)`;
            });
        }
        
        // Animate CTA buttons on hover
        const ctaButtons = ctaSection.querySelectorAll('.btn');
        ctaButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.05)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        });
    },
    
    /**
     * Initialize page-specific animations
     */
    initPageAnimations() {
        // Stats animation in hero
        const stats = document.querySelectorAll('.stat__number[data-counter]');
        stats.forEach(stat => {
            stat.setAttribute('data-duration', this.config.statsCountDuration);
        });
        
        // Floating animation for hero visual
        const heroVisual = document.querySelector('.hero__visual');
        if (heroVisual) {
            let floatY = 0;
            let floatDirection = 1;
            
            function floatAnimation() {
                floatY += 0.3 * floatDirection;
                
                if (floatY > 20 || floatY < 0) {
                    floatDirection *= -1;
                }
                
                heroVisual.style.transform = `translateY(${floatY}px)`;
                requestAnimationFrame(floatAnimation);
            }
            
            floatAnimation();
        }
        
        // Add gradient animation to text
        const gradientTexts = document.querySelectorAll('.text-gradient');
        gradientTexts.forEach(text => {
            text.addEventListener('mouseenter', () => {
                text.style.backgroundSize = '200% 200%';
                text.style.animation = 'gradient-shift 3s ease infinite';
            });
            
            text.addEventListener('mouseleave', () => {
                text.style.animation = '';
            });
        });
        
        // Initialize scroll-triggered animations
        this.initScrollAnimations();
    },
    
    /**
     * Initialize scroll-triggered animations
     */
    initScrollAnimations() {
        // Reveal sections on scroll
        const sections = document.querySelectorAll('.section');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section--visible');
                    
                    // Animate children elements
                    const animateChildren = entry.target.querySelectorAll('[data-animate-children] > *');
                    animateChildren.forEach((child, index) => {
                        setTimeout(() => {
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }
};

// Add required styles
const style = document.createElement('style');
style.textContent = `
    /* Ripple effect */
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    /* Gradient shift animation */
    @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    
    /* Hero element initial states */
    .hero__badge,
    .hero__title,
    .hero__description,
    .hero__actions,
    .hero__stats,
    .hero__visual {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    /* Section visibility */
    .section {
        transition: opacity 0.6s ease-out;
    }
    
    .section--visible {
        opacity: 1;
    }
    
    /* Animate children */
    [data-animate-children] > * {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
`;

document.head.appendChild(style);

// Export
window.HomePage = HomePage;