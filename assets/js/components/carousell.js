/* ========================================
   Stratosphere Consulting - Carousel Component
   File: assets/js/components/carousel.js
   
   Testimonial carousel and slider functionality
   ======================================== */

const CarouselManager = {
    // Configuration
    config: {
        autoplayDelay: 5000,
        transitionDuration: 500,
        swipeThreshold: 50,
        enableAutoplay: true,
        enableSwipe: true,
        pauseOnHover: true
    },
    
    // State
    carousels: new Map(),
    
    /**
     * Initialize all carousels
     */
    init() {
        // Find all carousel elements
        const carouselElements = document.querySelectorAll('[data-carousel]');
        
        carouselElements.forEach(element => {
            const id = element.id || this.generateId();
            element.id = id;
            
            // Create carousel instance
            const carousel = new Carousel(element, this.config);
            this.carousels.set(id, carousel);
            
            // Initialize carousel
            carousel.init();
        });
        
        console.log(`Initialized ${this.carousels.size} carousels`);
    },
    
    /**
     * Get carousel instance by ID
     */
    getCarousel(id) {
        return this.carousels.get(id);
    },
    
    /**
     * Generate unique ID
     */
    generateId() {
        return `carousel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Destroy all carousels
     */
    destroy() {
        this.carousels.forEach(carousel => {
            carousel.destroy();
        });
        this.carousels.clear();
    }
};

/**
 * Carousel Class
 */
class Carousel {
    constructor(element, config = {}) {
        this.element = element;
        this.config = { ...CarouselManager.config, ...config };
        
        // Elements
        this.track = element.querySelector('.testimonial-track, .carousel-track');
        this.slides = Array.from(this.track?.children || []);
        this.prevButton = element.querySelector('.testimonial-control--prev, .carousel-control--prev');
        this.nextButton = element.querySelector('.testimonial-control--next, .carousel-control--next');
        this.indicators = Array.from(element.querySelectorAll('.testimonial-indicator, .carousel-indicator'));
        
        // State
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoplayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
    }
    
    /**
     * Initialize carousel
     */
    init() {
        if (!this.track || !this.slides.length) {
            console.warn('Carousel track or slides not found');
            return;
        }
        
        // Set up carousel
        this.setupCarousel();
        
        // Bind events
        this.bindEvents();
        
        // Start autoplay
        if (this.config.enableAutoplay) {
            this.startAutoplay();
        }
        
        // Set initial state
        this.goToSlide(0, false);
    }
    
    /**
     * Set up carousel structure
     */
    setupCarousel() {
        // Clone slides for infinite loop
        const firstClone = this.slides[0].cloneNode(true);
        const lastClone = this.slides[this.slides.length - 1].cloneNode(true);
        
        firstClone.classList.add('clone');
        lastClone.classList.add('clone');
        
        this.track.appendChild(firstClone);
        this.track.insertBefore(lastClone, this.slides[0]);
        
        // Update slides array with clones
        this.allSlides = Array.from(this.track.children);
        
        // Set track styles
        this.track.style.display = 'flex';
        this.track.style.transition = `transform ${this.config.transitionDuration}ms ease-in-out`;
        
        // Set slide widths
        this.updateSlideWidths();
    }
    
    /**
     * Update slide widths
     */
    updateSlideWidths() {
        const containerWidth = this.element.offsetWidth;
        
        this.allSlides.forEach(slide => {
            slide.style.flex = '0 0 100%';
            slide.style.width = `${containerWidth}px`;
        });
        
        // Update track width
        this.track.style.width = `${containerWidth * this.allSlides.length}px`;
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.prev());
        }
        
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.next());
        }
        
        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Touch/swipe support
        if (this.config.enableSwipe && 'ontouchstart' in window) {
            this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
            this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
            this.track.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }
        
        // Mouse drag support
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        
        this.track.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            this.track.style.cursor = 'grabbing';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
            const diff = currentX - startX;
            
            if (Math.abs(diff) > this.config.swipeThreshold) {
                if (diff > 0) {
                    this.prev();
                } else {
                    this.next();
                }
                isDragging = false;
            }
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            this.track.style.cursor = 'grab';
        });
        
        // Pause on hover
        if (this.config.pauseOnHover && this.config.enableAutoplay) {
            this.element.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.element.addEventListener('mouseleave', () => this.startAutoplay());
        }
        
        // Keyboard navigation
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });
        
        // Window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.updateSlideWidths();
            this.goToSlide(this.currentIndex, false);
        }, 250));
    }
    
    /**
     * Go to previous slide
     */
    prev() {
        if (this.isAnimating) return;
        this.goToSlide(this.currentIndex - 1);
    }
    
    /**
     * Go to next slide
     */
    next() {
        if (this.isAnimating) return;
        this.goToSlide(this.currentIndex + 1);
    }
    
    /**
     * Go to specific slide
     */
    goToSlide(index, animate = true) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Handle infinite loop
        let targetIndex = index;
        let needsReset = false;
        
        if (index < 0) {
            targetIndex = this.slides.length - 1;
            needsReset = true;
        } else if (index >= this.slides.length) {
            targetIndex = 0;
            needsReset = true;
        }
        
        // Calculate transform
        const slideWidth = this.element.offsetWidth;
        const offset = -((index + 1) * slideWidth); // +1 for the prepended clone
        
        // Apply transform
        if (animate) {
            this.track.style.transition = `transform ${this.config.transitionDuration}ms ease-in-out`;
        } else {
            this.track.style.transition = 'none';
        }
        
        this.track.style.transform = `translateX(${offset}px)`;
        
        // Update indicators
        this.updateIndicators(targetIndex);
        
        // Handle infinite loop reset
        if (needsReset && animate) {
            setTimeout(() => {
                this.track.style.transition = 'none';
                const resetOffset = -((targetIndex + 1) * slideWidth);
                this.track.style.transform = `translateX(${resetOffset}px)`;
                this.isAnimating = false;
            }, this.config.transitionDuration);
        } else {
            setTimeout(() => {
                this.isAnimating = false;
            }, animate ? this.config.transitionDuration : 0);
        }
        
        // Update current index
        this.currentIndex = targetIndex;
        
        // Emit event
        this.element.dispatchEvent(new CustomEvent('carousel:change', {
            detail: { index: this.currentIndex }
        }));
    }
    
    /**
     * Update indicators
     */
    updateIndicators(index) {
        this.indicators.forEach((indicator, i) => {
            if (i === index) {
                indicator.classList.add('testimonial-indicator--active', 'carousel-indicator--active');
            } else {
                indicator.classList.remove('testimonial-indicator--active', 'carousel-indicator--active');
            }
        });
    }
    
    /**
     * Start autoplay
     */
    startAutoplay() {
        if (!this.config.enableAutoplay) return;
        
        this.stopAutoplay();
        
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.config.autoplayDelay);
    }
    
    /**
     * Stop autoplay
     */
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    
    /**
     * Pause autoplay
     */
    pauseAutoplay() {
        this.stopAutoplay();
    }
    
    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
    }
    
    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
    }
    
    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (!this.touchStartX || !this.touchEndX) return;
        
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > this.config.swipeThreshold) {
            if (diff > 0) {
                this.next(); // Swipe left
            } else {
                this.prev(); // Swipe right
            }
        }
        
        // Reset
        this.touchStartX = 0;
        this.touchEndX = 0;
    }
    
    /**
     * Destroy carousel
     */
    destroy() {
        this.stopAutoplay();
        this.track.style = '';
        this.allSlides.forEach(slide => {
            if (slide.classList.contains('clone')) {
                slide.remove();
            }
        });
    }
}

// Export
window.CarouselManager = CarouselManager;