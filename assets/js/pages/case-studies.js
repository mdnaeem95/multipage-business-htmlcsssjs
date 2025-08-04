/* ========================================
   Stratosphere Consulting - Case Studies Page Scripts
   File: assets/js/pages/case-studies.js
   
   Case studies page-specific functionality
   ======================================== */

const CaseStudiesPage = {
    // Configuration
    config: {
        loadMoreCount: 6,
        animationDelay: 100,
        filterAnimationDuration: 300
    },
    
    // State
    state: {
        currentFilter: 'all',
        visibleCount: 6,
        totalCount: 0,
        isLoading: false,
        searchQuery: ''
    },
    
    // Elements
    elements: {
        grid: null,
        loadMoreBtn: null,
        filterButtons: null,
        searchInput: null,
        resultsCounter: null,
        caseStudyCards: null
    },
    
    /**
     * Initialize case studies page
     */
    init() {
        console.log('Initializing case studies page...');
        
        // Get elements
        this.getElements();
        
        // Initialize filter system
        if (typeof FilterManager !== 'undefined') {
            FilterManager.init('.case-studies-grid');
        }
        
        // Initialize case study cards
        this.initCaseStudyCards();
        
        // Initialize load more functionality
        this.initLoadMore();
        
        // Initialize search
        this.initSearch();
        
        // Initialize view toggle
        this.initViewToggle();
        
        // Initialize sort functionality
        this.initSort();
        
        // Initialize modal previews
        this.initModalPreviews();
        
        // Initialize page animations
        this.initPageAnimations();
    },
    
    /**
     * Get page elements
     */
    getElements() {
        this.elements.grid = document.querySelector('.case-studies-grid');
        this.elements.loadMoreBtn = document.querySelector('.load-more-btn');
        this.elements.filterButtons = document.querySelectorAll('[data-filter-button]');
        this.elements.searchInput = document.querySelector('[data-filter-search]');
        this.elements.resultsCounter = document.querySelector('[data-filter-counter]');
        this.elements.caseStudyCards = document.querySelectorAll('.case-study-card');
    },
    
    /**
     * Initialize case study cards
     */
    initCaseStudyCards() {
        if (!this.elements.caseStudyCards.length) return;
        
        this.state.totalCount = this.elements.caseStudyCards.length;
        
        this.elements.caseStudyCards.forEach((card, index) => {
            // Add entrance animation
            card.style.animationDelay = `${(index % 3) * this.config.animationDelay}ms`;
            
            // Enhanced hover effects
            this.addCardHoverEffects(card);
            
            // Click tracking
            card.addEventListener('click', () => {
                this.trackCaseStudyClick(card);
            });
            
            // Initially hide cards beyond visible count
            if (index >= this.state.visibleCount) {
                card.style.display = 'none';
                card.classList.add('hidden-initially');
            }
        });
    },
    
    /**
     * Add card hover effects
     */
    addCardHoverEffects(card) {
        const image = card.querySelector('.case-study-card__image img');
        const badge = card.querySelector('.case-study-card__badge');
        
        card.addEventListener('mouseenter', () => {
            // Image zoom effect
            if (image) {
                image.style.transform = 'scale(1.1)';
            }
            
            // Badge animation
            if (badge) {
                badge.style.transform = 'translateY(-2px)';
            }
            
            // Add glow effect
            card.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', () => {
            if (image) {
                image.style.transform = 'scale(1)';
            }
            
            if (badge) {
                badge.style.transform = 'translateY(0)';
            }
            
            card.style.boxShadow = '';
        });
    },
    
    /**
     * Initialize load more functionality
     */
    initLoadMore() {
        if (!this.elements.loadMoreBtn) return;
        
        // Update button visibility
        this.updateLoadMoreButton();
        
        this.elements.loadMoreBtn.addEventListener('click', () => {
            if (this.state.isLoading) return;
            
            this.state.isLoading = true;
            this.elements.loadMoreBtn.classList.add('loading');
            
            // Simulate loading delay
            setTimeout(() => {
                this.loadMoreCaseStudies();
                this.state.isLoading = false;
                this.elements.loadMoreBtn.classList.remove('loading');
            }, 600);
        });
    },
    
    /**
     * Load more case studies
     */
    loadMoreCaseStudies() {
        const hiddenCards = document.querySelectorAll('.case-study-card.hidden-initially:not(.filter-hidden)');
        const cardsToShow = Array.from(hiddenCards).slice(0, this.config.loadMoreCount);
        
        cardsToShow.forEach((card, index) => {
            setTimeout(() => {
                card.style.display = '';
                card.classList.remove('hidden-initially');
                card.classList.add('fade-in-up');
                
                // Trigger animation
                requestAnimationFrame(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }, index * this.config.animationDelay);
        });
        
        this.state.visibleCount += cardsToShow.length;
        this.updateLoadMoreButton();
        
        // Update counter
        if (this.elements.resultsCounter) {
            this.elements.resultsCounter.textContent = 
                `Showing ${this.state.visibleCount} of ${this.state.totalCount} case studies`;
        }
    },
    
    /**
     * Update load more button visibility
     */
    updateLoadMoreButton() {
        if (!this.elements.loadMoreBtn) return;
        
        const hiddenCards = document.querySelectorAll('.case-study-card.hidden-initially');
        
        if (hiddenCards.length === 0) {
            this.elements.loadMoreBtn.style.display = 'none';
        } else {
            this.elements.loadMoreBtn.style.display = '';
            this.elements.loadMoreBtn.textContent = `Load More (${hiddenCards.length} remaining)`;
        }
    },
    
    /**
     * Initialize search functionality
     */
    initSearch() {
        if (!this.elements.searchInput) return;
        
        // Add search icon
        const searchWrapper = this.elements.searchInput.parentElement;
        if (searchWrapper && !searchWrapper.querySelector('.search-icon')) {
            const searchIcon = document.createElement('span');
            searchIcon.className = 'search-icon';
            searchIcon.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            `;
            searchWrapper.insertBefore(searchIcon, this.elements.searchInput);
        }
        
        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear';
        clearButton.innerHTML = '×';
        clearButton.style.display = 'none';
        clearButton.setAttribute('aria-label', 'Clear search');
        searchWrapper.appendChild(clearButton);
        
        // Search input events
        this.elements.searchInput.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value;
            clearButton.style.display = this.state.searchQuery ? 'block' : 'none';
        });
        
        // Clear button event
        clearButton.addEventListener('click', () => {
            this.elements.searchInput.value = '';
            this.state.searchQuery = '';
            clearButton.style.display = 'none';
            this.elements.searchInput.focus();
            
            // Trigger search event to reset filters
            this.elements.searchInput.dispatchEvent(new Event('input'));
        });
    },
    
    /**
     * Initialize view toggle (grid/list)
     */
    initViewToggle() {
        const viewToggle = document.querySelector('.view-toggle');
        if (!viewToggle) return;
        
        const gridBtn = viewToggle.querySelector('[data-view="grid"]');
        const listBtn = viewToggle.querySelector('[data-view="list"]');
        
        if (!gridBtn || !listBtn) return;
        
        gridBtn.addEventListener('click', () => {
            this.setView('grid');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        });
        
        listBtn.addEventListener('click', () => {
            this.setView('list');
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
        });
    },
    
    /**
     * Set view type
     */
    setView(viewType) {
        if (!this.elements.grid) return;
        
        this.elements.grid.className = `case-studies-grid case-studies-grid--${viewType}`;
        
        // Trigger reflow for animations
        this.elements.grid.offsetHeight;
        
        // Add animation class
        this.elements.grid.classList.add('view-transitioning');
        
        setTimeout(() => {
            this.elements.grid.classList.remove('view-transitioning');
        }, this.config.filterAnimationDuration);
        
        // Save preference
        if (typeof Utils !== 'undefined') {
            Utils.storage.set('caseStudiesView', viewType);
        }
    },
    
    /**
     * Initialize sort functionality
     */
    initSort() {
        const sortDropdown = document.querySelector('.sort-dropdown');
        if (!sortDropdown) return;
        
        const sortButton = sortDropdown.querySelector('.sort-button');
        const sortOptions = sortDropdown.querySelectorAll('.sort-option');
        
        if (!sortButton || !sortOptions.length) return;
        
        // Toggle dropdown
        sortButton.addEventListener('click', () => {
            sortDropdown.classList.toggle('active');
        });
        
        // Sort options
        sortOptions.forEach(option => {
            option.addEventListener('click', () => {
                const sortBy = option.getAttribute('data-sort');
                this.sortCaseStudies(sortBy);
                
                // Update button text
                sortButton.querySelector('.sort-label').textContent = option.textContent;
                
                // Close dropdown
                sortDropdown.classList.remove('active');
                
                // Update active state
                sortOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!sortDropdown.contains(e.target)) {
                sortDropdown.classList.remove('active');
            }
        });
    },
    
    /**
     * Sort case studies
     */
    sortCaseStudies(sortBy) {
        const cards = Array.from(this.elements.caseStudyCards);
        const grid = this.elements.grid;
        
        // Define sort functions
        const sortFunctions = {
            'date-desc': (a, b) => {
                const dateA = new Date(a.getAttribute('data-date') || '0');
                const dateB = new Date(b.getAttribute('data-date') || '0');
                return dateB - dateA;
            },
            'date-asc': (a, b) => {
                const dateA = new Date(a.getAttribute('data-date') || '0');
                const dateB = new Date(b.getAttribute('data-date') || '0');
                return dateA - dateB;
            },
            'title-asc': (a, b) => {
                const titleA = a.querySelector('.case-study-card__title').textContent.toLowerCase();
                const titleB = b.querySelector('.case-study-card__title').textContent.toLowerCase();
                return titleA.localeCompare(titleB);
            },
            'title-desc': (a, b) => {
                const titleA = a.querySelector('.case-study-card__title').textContent.toLowerCase();
                const titleB = b.querySelector('.case-study-card__title').textContent.toLowerCase();
                return titleB.localeCompare(titleA);
            }
        };
        
        // Sort cards
        if (sortFunctions[sortBy]) {
            cards.sort(sortFunctions[sortBy]);
            
            // Reorder DOM
            cards.forEach((card, index) => {
                card.style.order = index;
                
                // Add staggered animation
                card.style.animation = 'none';
                card.offsetHeight; // Trigger reflow
                card.style.animation = `fade-in-up 0.6s ease-out ${index * 50}ms forwards`;
            });
        }
    },
    
    /**
     * Initialize modal previews
     */
    initModalPreviews() {
        this.elements.caseStudyCards.forEach(card => {
            const link = card.querySelector('.case-study-card__link');
            if (!link) return;
            
            link.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) return; // Allow normal link behavior for new tab
                
                e.preventDefault();
                this.openCaseStudyModal(card);
            });
        });
    },
    
    /**
     * Open case study modal
     */
    openCaseStudyModal(card) {
        const title = card.querySelector('.case-study-card__title').textContent;
        const excerpt = card.querySelector('.case-study-card__excerpt').textContent;
        const image = card.querySelector('.case-study-card__image img').src;
        const client = card.querySelector('.case-study-card__client').textContent;
        const badge = card.querySelector('.case-study-card__badge').textContent;
        const link = card.querySelector('.case-study-card__link').href;
        
        const modalContent = `
            <div class="case-study-modal">
                <div class="case-study-modal__image">
                    <img src="${image}" alt="${title}">
                    <span class="case-study-modal__badge">${badge}</span>
                </div>
                <div class="case-study-modal__content">
                    <p class="case-study-modal__client">${client}</p>
                    <h3 class="case-study-modal__title">${title}</h3>
                    <p class="case-study-modal__excerpt">${excerpt}</p>
                    <div class="case-study-modal__stats">
                        <div class="stat">
                            <span class="stat__label">Duration</span>
                            <span class="stat__value">6 months</span>
                        </div>
                        <div class="stat">
                            <span class="stat__label">Team Size</span>
                            <span class="stat__value">8 people</span>
                        </div>
                        <div class="stat">
                            <span class="stat__label">ROI</span>
                            <span class="stat__value">250%</span>
                        </div>
                    </div>
                    <div class="case-study-modal__actions">
                        <a href="${link}" class="btn btn--primary">View Full Case Study</a>
                    </div>
                </div>
            </div>
        `;
        
        if (typeof ModalManager !== 'undefined') {
            ModalManager.create({
                type: 'basic',
                title: '',
                content: modalContent,
                size: 'large'
            });
        }
    },
    
    /**
     * Track case study click
     */
    trackCaseStudyClick(card) {
        const title = card.querySelector('.case-study-card__title').textContent;
        const category = card.getAttribute('data-category');
        
        // Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'view_case_study', {
                event_category: 'engagement',
                event_label: title,
                value: category
            });
        }
        
        console.log('Case study clicked:', { title, category });
    },
    
    /**
     * Initialize page animations
     */
    initPageAnimations() {
        // Hero stats animation
        const heroStats = document.querySelectorAll('.page-hero .stat__number');
        heroStats.forEach(stat => {
            const value = stat.textContent;
            if (value.includes('+')) {
                const number = parseInt(value);
                stat.setAttribute('data-counter', number);
                stat.textContent = '0';
                stat.setAttribute('data-suffix', '+');
            }
        });
        
        // Filter buttons hover effect
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                const count = button.querySelector('[data-filter-count]');
                if (count) {
                    count.style.transform = 'scale(1.2)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                const count = button.querySelector('[data-filter-count]');
                if (count) {
                    count.style.transform = 'scale(1)';
                }
            });
        });
        
        // Add parallax to page hero
        const pageHero = document.querySelector('.page-hero');
        if (pageHero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                pageHero.style.transform = `translateY(${rate}px)`;
            });
        }
    }
};

// Add required styles
const style = document.createElement('style');
style.textContent = `
    /* Search input styles */
    .search-wrapper {
        position: relative;
    }
    
    .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-muted);
        pointer-events: none;
    }
    
    .search-clear {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        font-size: 24px;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--radius-full);
        transition: all var(--transition-base) var(--ease-in-out);
    }
    
    .search-clear:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }
    
    /* Load more button loading state */
    .load-more-btn.loading {
        position: relative;
        color: transparent;
    }
    
    .load-more-btn.loading::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        top: 50%;
        left: 50%;
        margin-left: -10px;
        margin-top: -10px;
        border: 2px solid currentColor;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spinner 0.8s linear infinite;
    }
    
    @keyframes spinner {
        to { transform: rotate(360deg); }
    }
    
    /* Fade in up animation */
    .fade-in-up {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease-out;
    }
    
    /* View transitions */
    .view-transitioning .case-study-card {
        transition: all 0.3s ease-out;
    }
    
    /* Case study modal styles */
    .case-study-modal {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-8);
        align-items: center;
    }
    
    @media (max-width: 768px) {
        .case-study-modal {
            grid-template-columns: 1fr;
            gap: var(--space-6);
        }
    }
    
    .case-study-modal__image {
        position: relative;
        border-radius: var(--radius-lg);
        overflow: hidden;
    }
    
    .case-study-modal__image img {
        width: 100%;
        height: auto;
    }
    
    .case-study-modal__badge {
        position: absolute;
        top: var(--space-4);
        left: var(--space-4);
        background: var(--color-primary);
        color: var(--color-white);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-full);
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        text-transform: uppercase;
        letter-spacing: var(--tracking-wide);
    }
    
    .case-study-modal__client {
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-bottom: var(--space-2);
    }
    
    .case-study-modal__title {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        margin-bottom: var(--space-4);
        color: var(--text-primary);
    }
    
    .case-study-modal__excerpt {
        font-size: var(--text-lg);
        line-height: var(--leading-relaxed);
        color: var(--text-secondary);
        margin-bottom: var(--space-6);
    }
    
    .case-study-modal__stats {
        display: flex;
        gap: var(--space-6);
        padding: var(--space-6) 0;
        border-top: 1px solid var(--border-light);
        border-bottom: 1px solid var(--border-light);
        margin-bottom: var(--space-6);
    }
    
    .case-study-modal__stats .stat {
        text-align: center;
    }
    
    .case-study-modal__stats .stat__label {
        display: block;
        font-size: var(--text-sm);
        color: var(--text-muted);
        margin-bottom: var(--space-1);
    }
    
    .case-study-modal__stats .stat__value {
        display: block;
        font-size: var(--text-xl);
        font-weight: var(--font-bold);
        color: var(--color-primary);
    }
    
    .case-study-modal__actions {
        display: flex;
        gap: var(--space-4);
    }
    
    /* Sort dropdown styles */
    .sort-dropdown {
        position: relative;
    }
    
    .sort-dropdown.active .sort-options {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    .sort-options {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: var(--space-2);
        background: var(--bg-primary);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all var(--transition-base) var(--ease-in-out);
        z-index: var(--z-10);
    }
    
    .sort-option {
        display: block;
        width: 100%;
        padding: var(--space-3) var(--space-4);
        text-align: left;
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-base) var(--ease-in-out);
    }
    
    .sort-option:hover,
    .sort-option.active {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
    
    /* Grid/List view styles */
    .case-studies-grid--list {
        grid-template-columns: 1fr;
        gap: var(--space-4);
    }
    
    .case-studies-grid--list .case-study-card {
        display: grid;
        grid-template-columns: 300px 1fr;
        gap: var(--space-6);
        align-items: center;
    }
    
    @media (max-width: 768px) {
        .case-studies-grid--list .case-study-card {
            grid-template-columns: 1fr;
        }
    }
    
    .case-studies-grid--list .case-study-card__image {
        padding-bottom: 200px;
    }
    
    .case-studies-grid--list .case-study-card__content {
        padding: var(--space-4);
    }
`;

document.head.appendChild(style);

// Export
window.CaseStudiesPage = CaseStudiesPage;