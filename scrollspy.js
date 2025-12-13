/**
 * Scrollspy implementation using IntersectionObserver
 * Updates active nav link and indicator bar based on scroll position
 */

(function() {
    'use strict';

    // Build maps of sections and nav links
    const sections = new Map();
    const navLinks = new Map();
    let currentActive = 'home';
    let isScrolling = false;
    let scrollTimeout = null;

    // Initialize scrollspy
    function initScrollspy() {
        // Build section map
        document.querySelectorAll('[data-section]').forEach(section => {
            const sectionName = section.getAttribute('data-section');
            if (sectionName) {
                sections.set(sectionName, section);
            }
        });

        // Build nav link map
        document.querySelectorAll('[data-nav-link]').forEach(link => {
            const sectionName = link.getAttribute('data-nav-link');
            if (sectionName) {
                navLinks.set(sectionName, link);
            }
        });

        if (sections.size === 0 || navLinks.size === 0) {
            console.warn('Scrollspy: No sections or nav links found with data attributes');
            return;
        }

        // Use IntersectionObserver if available
        if ('IntersectionObserver' in window) {
            initIntersectionObserver();
        } else {
            // Fallback to scroll events
            initScrollFallback();
        }

        // Set initial active state
        updateActiveOnLoad();
    }

    /**
     * Set active nav link and update indicator
     */
    function setActive(sectionName) {
        if (currentActive === sectionName) {
            return; // No change needed
        }

        currentActive = sectionName;

        // Remove active from all nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active to the correct nav link
        const activeLink = navLinks.get(sectionName);
        if (activeLink) {
            activeLink.classList.add('active');
            updateIndicatorBar(activeLink);
        }
    }

    /**
     * Update the white indicator bar position under the active nav link
     */
    function updateIndicatorBar(activeLink) {
        // Find or create indicator bar
        let indicator = document.querySelector('.nav-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'nav-indicator';
            const nav = document.getElementById('main-nav');
            if (nav) {
                nav.appendChild(indicator);
            } else {
                return; // Can't add indicator without nav
            }
        }

        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            // Get position and width of active link
            const linkRect = activeLink.getBoundingClientRect();
            const nav = activeLink.closest('.nav');
            if (!nav) return;
            
            const navRect = nav.getBoundingClientRect();
            
            // Calculate position relative to nav
            const left = linkRect.left - navRect.left;
            const width = linkRect.width;

            // Update indicator position and width
            indicator.style.left = `${left}px`;
            indicator.style.width = `${width}px`;
        });
    }

    /**
     * Initialize IntersectionObserver for scrollspy
     */
    function initIntersectionObserver() {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;
        
        // Calculate rootMargin to account for fixed header
        // Top margin: negative to trigger when section reaches header
        // Bottom margin: negative to trigger before section leaves viewport
        const rootMargin = `-${headerHeight + 20}px 0px -${window.innerHeight * 0.6}px 0px`;

        const observerOptions = {
            root: null,
            rootMargin: rootMargin,
            threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0]
        };

        // Track intersecting sections with their ratios
        const intersectingSections = new Map();

        const observer = new IntersectionObserver((entries) => {
            // Don't update during programmatic scrolling
            if (isScrolling) {
                return;
            }

            entries.forEach(entry => {
                const sectionName = entry.target.getAttribute('data-section');
                if (!sectionName) return;

                if (entry.isIntersecting) {
                    intersectingSections.set(sectionName, entry.intersectionRatio);
                } else {
                    intersectingSections.delete(sectionName);
                }
            });

            // Determine which section should be active
            if (intersectingSections.size > 0) {
                // Find section with highest intersection ratio
                let bestSection = null;
                let bestRatio = -1;
                let bestDistance = Infinity;

                intersectingSections.forEach((ratio, sectionName) => {
                    const section = sections.get(sectionName);
                    if (!section) return;

                    const rect = section.getBoundingClientRect();
                    const distanceFromTop = Math.abs(rect.top - (headerHeight + 20));

                    // Prefer higher intersection ratio, or if tied, closer to top
                    if (ratio > bestRatio || (ratio === bestRatio && distanceFromTop < bestDistance)) {
                        bestRatio = ratio;
                        bestDistance = distanceFromTop;
                        bestSection = sectionName;
                    }
                });

                if (bestSection) {
                    setActive(bestSection);
                }
            } else {
                // No sections intersecting - find closest one
                const scrollY = window.pageYOffset || window.scrollY;
                let closestSection = null;
                let closestDistance = Infinity;

                sections.forEach((section, sectionName) => {
                    const rect = section.getBoundingClientRect();
                    const sectionTop = rect.top + scrollY;
                    const distance = Math.abs(scrollY + headerHeight - sectionTop);

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestSection = sectionName;
                    }
                });

                if (closestSection) {
                    setActive(closestSection);
                }
            }
        }, observerOptions);

        // Observe all sections
        sections.forEach(section => {
            observer.observe(section);
        });

        // Update rootMargin on resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newHeaderHeight = header ? header.offsetHeight : 80;
                const newRootMargin = `-${newHeaderHeight + 20}px 0px -${window.innerHeight * 0.6}px 0px`;
                // Recreate observer with new rootMargin
                observer.disconnect();
                observerOptions.rootMargin = newRootMargin;
                sections.forEach(section => {
                    observer.observe(section);
                });
            }, 100);
        });
    }

    /**
     * Fallback scroll event handler for browsers without IntersectionObserver
     */
    function initScrollFallback() {
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 80;

        function updateActiveFromScroll() {
            if (isScrolling) return;

            const scrollY = window.pageYOffset || window.scrollY;
            const threshold = headerHeight + 100;

            // If at top, set home as active
            if (scrollY < 200) {
                setActive('home');
                return;
            }

            // Find the section we're currently viewing
            let bestSection = null;
            let bestScore = -Infinity;

            sections.forEach((section, sectionName) => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + scrollY;
                const sectionBottom = sectionTop + rect.height;

                // Calculate visibility
                const visibleTop = Math.max(scrollY + threshold, sectionTop);
                const visibleBottom = Math.min(scrollY + window.innerHeight, sectionBottom);
                const visibleHeight = Math.max(0, visibleBottom - visibleTop);

                if (visibleHeight > 0) {
                    const distanceFromTop = Math.abs((sectionTop - threshold) - scrollY);
                    const score = visibleHeight - (distanceFromTop * 0.1);

                    if (score > bestScore) {
                        bestScore = score;
                        bestSection = sectionName;
                    }
                }
            });

            if (bestSection) {
                setActive(bestSection);
            }
        }

        // Throttle scroll events
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = requestAnimationFrame(updateActiveFromScroll);
        }, { passive: true });

        // Update on resize
        window.addEventListener('resize', () => {
            updateActiveFromScroll();
        }, { passive: true });
    }

    /**
     * Set initial active state based on scroll position
     */
    function updateActiveOnLoad() {
        const scrollY = window.pageYOffset || window.scrollY;
        if (scrollY < 200) {
            setActive('home');
        } else {
            // Use same logic as fallback to find current section
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 80;
            const threshold = headerHeight + 100;

            let bestSection = null;
            let bestScore = -Infinity;

            sections.forEach((section, sectionName) => {
                const rect = section.getBoundingClientRect();
                const sectionTop = rect.top + scrollY;
                const sectionBottom = sectionTop + rect.height;

                const visibleTop = Math.max(scrollY + threshold, sectionTop);
                const visibleBottom = Math.min(scrollY + window.innerHeight, sectionBottom);
                const visibleHeight = Math.max(0, visibleBottom - visibleTop);

                if (visibleHeight > 0) {
                    const distanceFromTop = Math.abs((sectionTop - threshold) - scrollY);
                    const score = visibleHeight - (distanceFromTop * 0.1);

                    if (score > bestScore) {
                        bestScore = score;
                        bestSection = sectionName;
                    }
                }
            });

            if (bestSection) {
                setActive(bestSection);
            } else {
                setActive('home');
            }
        }
    }

    /**
     * Mark that programmatic scrolling is happening
     */
    function setScrolling(flag) {
        isScrolling = flag;
        if (flag) {
            setTimeout(() => {
                isScrolling = false;
            }, 1000); // Clear flag after 1 second
        }
    }

    // Expose functions for use by click handlers
    window.scrollspySetScrolling = setScrolling;
    window.scrollspyUpdateIndicator = updateIndicatorBar;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollspy);
    } else {
        initScrollspy();
    }

    // Also initialize after a short delay to catch dynamic content
    setTimeout(initScrollspy, 100);
})();
