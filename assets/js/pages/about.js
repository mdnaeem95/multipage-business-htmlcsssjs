/* ========================================
   Stratosphere Consulting - About Page Scripts
   File: assets/js/pages/about.js
   
   About page-specific functionality
   ======================================== */

const AboutPage = {
    // Configuration
    config: {
        timelineAnimationDelay: 200,
        teamCardHoverScale: 1.05,
        valueItemDelay: 100
    },
    
    /**
     * Initialize about page
     */
    init() {
        console.log('Initializing about page...');
        
        // Initialize timeline
        this.initTimeline();
        
        // Initialize team section
        this.initTeamSection();
        
        // Initialize values animation
        this.initValues();
        
        // Initialize awards
        this.initAwards();
        
        // Initialize story stats
        this.initStoryStats();
        
        // Page-specific animations
        this.initPageAnimations();
    },
    
    /**
     * Initialize timeline
     */
    initTimeline() {
        const timelineItems = document.querySelectorAll('.timeline__item');
        
        if (!timelineItems.length) return;
        
        // Create intersection observer for timeline
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Animate timeline items
                    setTimeout(() => {
                        entry.target.classList.add('timeline__item--visible');
                        
                        // Animate the dot
                        const dot = entry.target.querySelector('::before');
                        if (dot) {
                            entry.target.style.setProperty('--dot-scale', '1');
                        }
                    }, index * this.config.timelineAnimationDelay);
                    
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe timeline items
        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
        
        // Add hover effects
        timelineItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(10px)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
            });
        });
    },
    
    /**
     * Initialize team section
     */
    initTeamSection() {
        const teamCards = document.querySelectorAll('.team-card');
        
        teamCards.forEach((card, index) => {
            // Add staggered entrance animation
            card.style.animationDelay = `${index * 100}ms`;
            
            // Enhanced hover effects
            const image = card.querySelector('.team-card__image img');
            const overlay = card.querySelector('.team-card__overlay');
            
            card.addEventListener('mouseenter', () => {
                if (image) {
                    image.style.transform = `scale(${this.config.teamCardHoverScale})`;
                }
                if (overlay) {
                    overlay.style.transform = 'translateY(0)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (image) {
                    image.style.transform = 'scale(1)';
                }
                if (overlay) {
                    overlay.style.transform = 'translateY(100%)';
                }
            });
            
            // Click to open modal (optional)
            card.addEventListener('click', () => {
                this.openTeamMemberModal(card);
            });
        });
    },
    
    /**
     * Open team member modal
     */
    openTeamMemberModal(card) {
        // Get member data
        const name = card.querySelector('.team-card__name').textContent;
        const role = card.querySelector('.team-card__role').textContent;
        const image = card.querySelector('.team-card__image img').src;
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'team-modal';
        modal.innerHTML = `
            <div class="team-modal__backdrop"></div>
            <div class="team-modal__content">
                <button class="team-modal__close" aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="team-modal__grid">
                    <div class="team-modal__image">
                        <img src="${image}" alt="${name}">
                    </div>
                    <div class="team-modal__info">
                        <h3 class="team-modal__name">${name}</h3>
                        <p class="team-modal__role">${role}</p>
                        <p class="team-modal__bio">
                            A seasoned professional with over 15 years of experience in strategic consulting 
                            and business transformation. Known for innovative approaches to complex challenges 
                            and building high-performing teams.
                        </p>
                        <div class="team-modal__social">
                            <a href="#" class="social-link" aria-label="LinkedIn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                            <a href="#" class="social-link" aria-label="Twitter">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('team-modal--active');
        });
        
        // Close modal
        const closeModal = () => {
            modal.classList.remove('team-modal--active');
            document.body.style.overflow = '';
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        modal.querySelector('.team-modal__close').addEventListener('click', closeModal);
        modal.querySelector('.team-modal__backdrop').addEventListener('click', closeModal);
        
        // ESC key to close
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    },
    
    /**
     * Initialize values section
     */
    initValues() {
        const valueItems = document.querySelectorAll('.value-item');
        
        // Stagger animations
        const valueObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('value-item--visible');
                    }, index * this.config.valueItemDelay);
                    
                    valueObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });
        
        valueItems.forEach(item => {
            valueObserver.observe(item);
            
            // Add hover effect
            item.addEventListener('mouseenter', () => {
                const icon = item.querySelector('.value-item__icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const icon = item.querySelector('.value-item__icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    },
    
    /**
     * Initialize awards section
     */
    initAwards() {
        const awardItems = document.querySelectorAll('.award-item');
        
        awardItems.forEach((item, index) => {
            // Add entrance animation
            item.style.animationDelay = `${index * 100}ms`;
            
            // Hover effect
            item.addEventListener('mouseenter', () => {
                const icon = item.querySelector('.award-item__icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(10deg)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const icon = item.querySelector('.award-item__icon svg');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    },
    
    /**
     * Initialize story stats
     */
    initStoryStats() {
        const storyStats = document.querySelectorAll('.story-stat__number[data-counter]');
        
        // Add custom counter animation for story stats
        storyStats.forEach(stat => {
            stat.setAttribute('data-duration', '3000');
        });
    },
    
    /**
     * Initialize page animations
     */
    initPageAnimations() {
        // Parallax effect for page hero
        const pageHero = document.querySelector('.page-hero');
        if (pageHero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                pageHero.style.transform = `translateY(${rate}px)`;
            });
        }
        
        // Add floating animation to value cards
        const valueCards = document.querySelectorAll('.value-card--featured');
        valueCards.forEach((card, index) => {
            const delay = index * 2;
            card.style.animation = `float-gentle 6s ease-in-out ${delay}s infinite`;
        });
        
        // Image reveal animation
        const images = document.querySelectorAll('.story-content__visual img, .team-card__image img');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('image-revealed');
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    }
};

// Add required styles
const style = document.createElement('style');
style.textContent = `
    /* Timeline animations */
    .timeline__item {
        opacity: 0;
        transform: translateX(-20px);
        transition: all 0.6s ease-out;
    }
    
    .timeline__item--visible {
        opacity: 1;
        transform: translateX(0);
    }
    
    .timeline__item::before {
        transform: scale(var(--dot-scale, 0));
        transition: transform 0.3s ease-out;
    }
    
    /* Team modal */
    .team-modal {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease-out;
    }
    
    .team-modal--active {
        opacity: 1;
        visibility: visible;
    }
    
    .team-modal__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
    }
    
    .team-modal__content {
        position: relative;
        background: var(--bg-primary);
        border-radius: var(--radius-xl);
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-2xl);
        transform: translateY(20px);
        transition: transform 0.3s ease-out;
    }
    
    .team-modal--active .team-modal__content {
        transform: translateY(0);
    }
    
    .team-modal__close {
        position: absolute;
        top: var(--space-4);
        right: var(--space-4);
        width: 40px;
        height: 40px;
        background: var(--bg-secondary);
        border: none;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 1;
    }
    
    .team-modal__close:hover {
        background: var(--bg-tertiary);
        transform: rotate(90deg);
    }
    
    .team-modal__grid {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: var(--space-8);
        padding: var(--space-8);
    }
    
    @media (max-width: 768px) {
        .team-modal__grid {
            grid-template-columns: 1fr;
            gap: var(--space-6);
            padding: var(--space-6);
        }
    }
    
    .team-modal__image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--radius-lg);
    }
    
    .team-modal__name {
        font-size: var(--text-3xl);
        margin-bottom: var(--space-2);
    }
    
    .team-modal__role {
        font-size: var(--text-lg);
        color: var(--color-primary);
        margin-bottom: var(--space-6);
    }
    
    .team-modal__bio {
        line-height: var(--leading-relaxed);
        margin-bottom: var(--space-6);
    }
    
    .team-modal__social {
        display: flex;
        gap: var(--space-3);
    }
    
    /* Value items animation */
    .value-item {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
    
    .value-item--visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Float animation */
    @keyframes float-gentle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    /* Image reveal */
    .image-revealed {
        animation: image-reveal 0.8s ease-out forwards;
    }
    
    @keyframes image-reveal {
        from {
            opacity: 0;
            transform: scale(1.1);
            filter: blur(10px);
        }
        to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
        }
    }
    
    /* Award items */
    .award-item {
        opacity: 0;
        transform: translateY(20px);
        animation: fade-in-up 0.6s ease-out forwards;
    }
    
    @keyframes fade-in-up {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);

// Export
window.AboutPage = AboutPage;