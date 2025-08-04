/* ========================================
   Stratosphere Consulting - Animation Manager
   File: assets/js/components/animations.js
   
   Scroll animations and intersection observer
   ======================================== */

const AnimationManager = {
    // Configuration
    config: {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        animationClass: 'aos-animate',
        duration: 600,
        once: true
    },
    
    // State
    state: {
        observers: [],
        animatedElements: new Set(),
        countersAnimated: new Set()
    },
    
    /**
     * Initialize animation manager
     */
    init() {
        // Initialize AOS (Animate On Scroll)
        this.initAOS();
        
        // Initialize counters
        this.initCounters();
        
        // Initialize parallax effects
        this.initParallax();
        
        // Initialize hover effects
        this.initHoverEffects();
        
        console.log('Animation Manager initialized');
    },
    
    /**
     * Initialize AOS animations
     */
    initAOS() {
        // Get all elements with data-aos attribute
        const elements = document.querySelectorAll('[data-aos]');
        
        if (!elements.length) return;
        
        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class
                    entry.target.classList.add(this.config.animationClass);
                    
                    // Handle animation delay
                    const delay = entry.target.getAttribute('data-aos-delay');
                    if (delay) {
                        entry.target.style.transitionDelay = `${delay}ms`;
                    }
                    
                    // Mark as animated
                    this.state.animatedElements.add(entry.target);
                    
                    // Unobserve if once is true
                    if (this.config.once) {
                        observer.unobserve(entry.target);
                    }
                } else if (!this.config.once && this.state.animatedElements.has(entry.target)) {
                    // Remove animation class if not once
                    entry.target.classList.remove(this.config.animationClass);
                    this.state.animatedElements.delete(entry.target);
                }
            });
        }, {
            threshold: this.config.threshold,
            rootMargin: this.config.rootMargin
        });
        
        // Observe all elements
        elements.forEach(element => {
            observer.observe(element);
        });
        
        // Store observer
        this.state.observers.push(observer);
    },
    
    /**
     * Initialize counter animations
     */
    initCounters() {
        const counters = document.querySelectorAll('[data-counter]');
        
        if (!counters.length) return;
        
        // Create intersection observer for counters
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.countersAnimated.has(entry.target)) {
                    const target = parseFloat(entry.target.getAttribute('data-counter'));
                    const suffix = entry.target.getAttribute('data-suffix') || '';
                    const duration = parseInt(entry.target.getAttribute('data-duration')) || 2000;
                    
                    // Animate the counter
                    this.animateCounter(entry.target, 0, target, duration, suffix);
                    
                    // Mark as animated
                    this.state.countersAnimated.add(entry.target);
                    
                    // Unobserve
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        // Observe all counters
        counters.forEach(counter => {
            observer.observe(counter);
        });
        
        // Store observer
        this.state.observers.push(observer);
    },
    
    /**
     * Animate counter
     */
    animateCounter(element, start, end, duration, suffix = '') {
        const startTime = Date.now();
        const isDecimal = !Number.isInteger(end);
        
        function update() {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            
            // Easing function (ease-out-quart)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            // Update text content
            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current);
            }
            
            // Add suffix if exists (as sibling element)
            if (suffix && progress === 1) {
                const suffixEl = element.nextElementSibling;
                if (suffixEl && suffixEl.classList.contains('stat__suffix')) {
                    suffixEl.textContent = suffix;
                }
            }
            
            // Continue animation
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Ensure final value is exact
                element.textContent = isDecimal ? end.toFixed(1) : end;
            }
        }
        
        update();
    },
    
    /**
     * Initialize parallax effects
     */
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (!parallaxElements.length) return;
        
        // Throttled scroll handler
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateParallax(parallaxElements);
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        // Add scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial update
        this.updateParallax(parallaxElements);
    },
    
    /**
     * Update parallax positions
     */
    updateParallax(elements) {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
            const offset = parseFloat(element.getAttribute('data-parallax-offset')) || 0;
            
            // Only update if element is in viewport
            if (rect.bottom >= 0 && rect.top <= windowHeight) {
                const yPos = -(scrolled * speed) + offset;
                element.style.transform = `translateY(${yPos}px)`;
            }
        });
    },
    
    /**
     * Initialize hover effects
     */
    initHoverEffects() {
        // Card tilt effect
        this.initCardTilt();
        
        // Magnetic buttons
        this.initMagneticButtons();
        
        // Image hover effects
        this.initImageHovers();
    },
    
    /**
     * Initialize card tilt effect
     */
    initCardTilt() {
        const cards = document.querySelectorAll('[data-tilt]');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const percentX = (x - centerX) / centerX;
                const percentY = (y - centerY) / centerY;
                
                const rotateY = percentX * 10;
                const rotateX = -percentY * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        });
    },
    
    /**
     * Initialize magnetic buttons
     */
    initMagneticButtons() {
        const buttons = document.querySelectorAll('[data-magnetic]');
        
        buttons.forEach(button => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = Math.max(rect.width, rect.height) / 2;
                
                if (distance < maxDistance) {
                    const strength = (1 - distance / maxDistance) * 0.3;
                    button.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
                }
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
            });
        });
    },
    
    /**
     * Initialize image hover effects
     */
    initImageHovers() {
        const images = document.querySelectorAll('[data-hover-scale]');
        
        images.forEach(image => {
            const container = image.parentElement;
            
            container.addEventListener('mouseenter', () => {
                image.style.transform = 'scale(1.05)';
            });
            
            container.addEventListener('mouseleave', () => {
                image.style.transform = 'scale(1)';
            });
        });
    },
    
    /**
     * Trigger animation on element
     */
    triggerAnimation(element, animationName) {
        element.style.animation = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.animation = animationName;
    },
    
    /**
     * Add animation to element
     */
    addAnimation(element, animationClass, delay = 0) {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, delay);
    },
    
    /**
     * Remove animation from element
     */
    removeAnimation(element, animationClass) {
        element.classList.remove(animationClass);
    },
    
    /**
     * Stagger animations
     */
    staggerAnimations(elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            this.addAnimation(element, animationClass, index * delay);
        });
    },
    
    /**
     * Clean up
     */
    destroy() {
        // Disconnect all observers
        this.state.observers.forEach(observer => {
            observer.disconnect();
        });
        
        // Clear state
        this.state.observers = [];
        this.state.animatedElements.clear();
        this.state.countersAnimated.clear();
        
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
    }
};

// Export
window.AnimationManager = AnimationManager;