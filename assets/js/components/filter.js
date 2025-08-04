/* ========================================
   Stratosphere Consulting - Filter Component
   File: assets/js/components/filter.js
   
   Case study filtering functionality
   ======================================== */

const FilterManager = {
    // Configuration
    config: {
        activeClass: 'filter-active',
        hiddenClass: 'filter-hidden',
        animationDuration: 300,
        filterAttribute: 'data-category',
        counterAttribute: 'data-count'
    },
    
    // State
    state: {
        activeFilter: 'all',
        items: [],
        filters: [],
        isAnimating: false
    },
    
    // Elements
    elements: {
        container: null,
        items: null,
        filters: null,
        counter: null,
        noResults: null
    },
    
    /**
     * Initialize filter system
     */
    init(containerSelector = '.filter-container') {
        // Get container
        this.elements.container = document.querySelector(containerSelector);
        
        if (!this.elements.container) {
            console.warn(`Filter container not found: ${containerSelector}`);
            return;
        }
        
        // Get elements
        this.elements.items = this.elements.container.querySelectorAll('[data-filter-item]');
        this.elements.filters = document.querySelectorAll('[data-filter-button]');
        this.elements.counter = document.querySelector('[data-filter-counter]');
        this.elements.noResults = document.querySelector('[data-filter-no-results]');
        
        if (!this.elements.items.length || !this.elements.filters.length) {
            console.warn('Filter items or buttons not found');
            return;
        }
        
        // Store items data
        this.cacheItems();
        
        // Bind events
        this.bindEvents();
        
        // Check URL for initial filter
        this.checkUrlFilter();
        
        // Initialize counter
        this.updateCounter();
        
        console.log('Filter Manager initialized');
    },
    
    /**
     * Cache items data
     */
    cacheItems() {
        this.state.items = Array.from(this.elements.items).map(item => {
            const categories = item.getAttribute(this.config.filterAttribute);
            return {
                element: item,
                categories: categories ? categories.split(',').map(c => c.trim()) : [],
                title: item.querySelector('.case-study-card__title')?.textContent || '',
                description: item.querySelector('.case-study-card__excerpt')?.textContent || ''
            };
        });
    },
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Filter button clicks
        this.elements.filters.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = button.getAttribute('data-filter-button');
                this.setFilter(filter);
            });
        });
        
        // Keyboard navigation
        this.elements.filters.forEach((button, index) => {
            button.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' && index < this.elements.filters.length - 1) {
                    this.elements.filters[index + 1].focus();
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    this.elements.filters[index - 1].focus();
                }
            });
        });
        
        // Search functionality (if search input exists)
        const searchInput = document.querySelector('[data-filter-search]');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchItems(e.target.value);
            }, 300));
            
            // Clear search on ESC
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    e.target.value = '';
                    this.searchItems('');
                }
            });
        }
    },
    
    /**
     * Check URL for filter parameter
     */
    checkUrlFilter() {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter');
        
        if (filter && this.isValidFilter(filter)) {
            this.setFilter(filter, false);
        }
    },
    
    /**
     * Check if filter is valid
     */
    isValidFilter(filter) {
        return Array.from(this.elements.filters).some(button => 
            button.getAttribute('data-filter-button') === filter
        );
    },
    
    /**
     * Set active filter
     */
    setFilter(filter, updateUrl = true) {
        if (this.state.isAnimating || filter === this.state.activeFilter) {
            return;
        }
        
        this.state.isAnimating = true;
        this.state.activeFilter = filter;
        
        // Update filter buttons
        this.updateFilterButtons(filter);
        
        // Filter items
        this.filterItems(filter);
        
        // Update URL
        if (updateUrl) {
            this.updateUrl(filter);
        }
        
        // Update counter
        this.updateCounter();
        
        // Reset animation flag
        setTimeout(() => {
            this.state.isAnimating = false;
        }, this.config.animationDuration);
        
        // Emit event
        this.emitEvent('filter:change', { filter });
    },
    
    /**
     * Update filter button states
     */
    updateFilterButtons(activeFilter) {
        this.elements.filters.forEach(button => {
            const buttonFilter = button.getAttribute('data-filter-button');
            
            if (buttonFilter === activeFilter) {
                button.classList.add(this.config.activeClass);
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove(this.config.activeClass);
                button.setAttribute('aria-pressed', 'false');
            }
            
            // Update count badges if they exist
            const countBadge = button.querySelector('[data-filter-count]');
            if (countBadge) {
                const count = this.getFilterCount(buttonFilter);
                countBadge.textContent = count;
                countBadge.style.display = count > 0 ? '' : 'none';
            }
        });
    },
    
    /**
     * Filter items based on category
     */
    filterItems(filter) {
        let visibleCount = 0;
        
        this.state.items.forEach((item, index) => {
            const shouldShow = filter === 'all' || item.categories.includes(filter);
            
            if (shouldShow) {
                this.showItem(item.element, index * 50);
                visibleCount++;
            } else {
                this.hideItem(item.element);
            }
        });
        
        // Show/hide no results message
        if (this.elements.noResults) {
            if (visibleCount === 0) {
                this.elements.noResults.style.display = 'block';
                this.elements.noResults.classList.add('fade-in');
            } else {
                this.elements.noResults.style.display = 'none';
            }
        }
        
        // Trigger layout recalculation
        this.relayout();
    },
    
    /**
     * Show item with animation
     */
    showItem(element, delay = 0) {
        setTimeout(() => {
            element.style.display = '';
            element.classList.remove(this.config.hiddenClass);
            
            // Force reflow
            element.offsetHeight;
            
            // Add visible class
            element.classList.add('filter-visible');
            
            // Animate in
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                element.style.transition = `all ${this.config.animationDuration}ms ease-out`;
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }, delay);
    },
    
    /**
     * Hide item with animation
     */
    hideItem(element) {
        element.style.transition = `all ${this.config.animationDuration}ms ease-out`;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.display = 'none';
            element.classList.add(this.config.hiddenClass);
            element.classList.remove('filter-visible');
        }, this.config.animationDuration);
    },
    
    /**
     * Search items by text
     */
    searchItems(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        if (!normalizedQuery) {
            // Reset to current filter
            this.filterItems(this.state.activeFilter);
            return;
        }
        
        let visibleCount = 0;
        
        this.state.items.forEach((item, index) => {
            const matchesSearch = 
                item.title.toLowerCase().includes(normalizedQuery) ||
                item.description.toLowerCase().includes(normalizedQuery) ||
                item.categories.some(cat => cat.toLowerCase().includes(normalizedQuery));
            
            const matchesFilter = 
                this.state.activeFilter === 'all' || 
                item.categories.includes(this.state.activeFilter);
            
            if (matchesSearch && matchesFilter) {
                this.showItem(item.element, index * 50);
                visibleCount++;
            } else {
                this.hideItem(item.element);
            }
        });
        
        // Update no results message
        if (this.elements.noResults) {
            this.elements.noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
        
        // Update counter
        this.updateCounter(visibleCount);
    },
    
    /**
     * Get count for specific filter
     */
    getFilterCount(filter) {
        if (filter === 'all') {
            return this.state.items.length;
        }
        
        return this.state.items.filter(item => 
            item.categories.includes(filter)
        ).length;
    },
    
    /**
     * Update counter display
     */
    updateCounter(count = null) {
        if (!this.elements.counter) return;
        
        if (count === null) {
            // Count visible items
            count = Array.from(this.elements.items).filter(item => 
                !item.classList.contains(this.config.hiddenClass) && 
                item.style.display !== 'none'
            ).length;
        }
        
        const total = this.state.items.length;
        const text = count === total ? 
            `Showing all ${total} projects` : 
            `Showing ${count} of ${total} projects`;
        
        this.elements.counter.textContent = text;
        
        // Animate counter
        this.elements.counter.style.opacity = '0';
        setTimeout(() => {
            this.elements.counter.style.opacity = '1';
        }, 100);
    },
    
    /**
     * Update URL with filter parameter
     */
    updateUrl(filter) {
        const url = new URL(window.location);
        
        if (filter === 'all') {
            url.searchParams.delete('filter');
        } else {
            url.searchParams.set('filter', filter);
        }
        
        // Update URL without reload
        window.history.pushState({}, '', url);
    },
    
    /**
     * Trigger layout recalculation
     */
    relayout() {
        // Dispatch resize event for any layout libraries
        window.dispatchEvent(new Event('resize'));
        
        // Custom relayout event
        this.emitEvent('filter:relayout');
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
     * Reset filters
     */
    reset() {
        this.setFilter('all');
        
        // Clear search if exists
        const searchInput = document.querySelector('[data-filter-search]');
        if (searchInput) {
            searchInput.value = '';
        }
    },
    
    /**
     * Get current filter
     */
    getCurrentFilter() {
        return this.state.activeFilter;
    },
    
    /**
     * Get filtered items
     */
    getFilteredItems() {
        if (this.state.activeFilter === 'all') {
            return this.state.items;
        }
        
        return this.state.items.filter(item => 
            item.categories.includes(this.state.activeFilter)
        );
    }
};

// Export
window.FilterManager = FilterManager;