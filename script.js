// Enhanced smooth scroll function with custom easing - make it globally accessible
window.smoothScrollTo = function smoothScrollTo(targetPosition, duration = 800) {
    const startPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    
    // If already at target, don't animate
    if (Math.abs(distance) < 1) {
        return;
    }
    
    // Adjust duration based on distance for consistent feel
    // Minimum 800ms to ensure smooth visible animation, max 1200ms
    // Use at least 0.5ms per pixel for smooth animation
    const adjustedDuration = Math.min(duration, Math.max(800, Math.abs(distance) * 0.5));
    
    // Cancel any existing scroll animation
    if (window._currentScrollAnimation) {
        cancelAnimationFrame(window._currentScrollAnimation);
        window._currentScrollAnimation = null;
    }
    
    const startTime = performance.now();
    let isAnimating = true;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animate(timestamp) {
        if (!isAnimating) return;
        
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / adjustedDuration, 1);
        const eased = easeInOutCubic(progress);
        
        const currentPos = Math.round(startPosition + distance * eased);
        
        // Scroll to current position using multiple methods for compatibility
        window.scrollTo(0, currentPos);
        document.documentElement.scrollTop = currentPos;
        if (document.body) {
            document.body.scrollTop = currentPos;
        }
        
        if (progress < 1) {
            // Continue animation
            window._currentScrollAnimation = requestAnimationFrame(animate);
        } else {
            // Ensure exact target
            window.scrollTo(0, targetPosition);
            document.documentElement.scrollTop = targetPosition;
            if (document.body) {
                document.body.scrollTop = targetPosition;
            }
            isAnimating = false;
            window._currentScrollAnimation = null;
        }
    }

    // Start animation
    window._currentScrollAnimation = requestAnimationFrame(animate);
}

// Smooth scroll function
function initSmoothScroll() {
    // Only target anchor links (internal page links), exclude mailto: and external links
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach((anchor) => {
        // Skip if it's a mailto: link or external link
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('mailto:') || href.startsWith('http')) {
            return;
        }
        
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const href = this.getAttribute('href');
            
            if (!href || href === '#' || href === '') {
                return false;
            }
            
            const target = document.querySelector(href);
            if (!target) {
                return false;
            }
            
            const headerOffset = 80;
            const targetTop = target.offsetTop;
            const desiredPosition = Math.max(0, targetTop - headerOffset);
            
            // Always use custom smooth scroll - function is defined at top of file as window.smoothScrollTo
            // Use 1200ms duration for clearly visible smooth scrolling
            // Ensure function exists, if not use native smooth scroll as fallback
            if (window.smoothScrollTo && typeof window.smoothScrollTo === 'function') {
                window.smoothScrollTo(desiredPosition, 1200);
            } else {
                // Fallback to native smooth scroll
                window.scrollTo({
                    top: desiredPosition,
                    behavior: 'smooth'
                });
            }
            
            // Update URL without hash (clean URL)
            setTimeout(() => {
                if (history.pushState) {
                    // Replace hash with clean URL
                    history.pushState(null, null, window.location.pathname + window.location.search);
                }
            }, 1100);
            
            return false;
        });
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('mobile-open');
            
            // Prevent body scroll when menu is open
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a nav link
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('mobile-open');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('mobile-open');
                document.body.style.overflow = '';
            }
        });
    }
}

// Initialize when DOM is ready
function initAll() {
    initSmoothScroll();
    initMobileMenu();

    // Scroll progress indicator
    function updateScrollProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
    }

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Update active nav link on scroll
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
        
        // Clean URL hash if it exists (remove hash from URL)
        if (window.location.hash && history.replaceState) {
            history.replaceState(null, null, window.location.pathname + window.location.search);
        }
    }

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();
    
    // Remove hash on page load if present
    if (window.location.hash && history.replaceState) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
    }

    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        // Scroll to top on click
        scrollToTopBtn.addEventListener('click', () => {
            smoothScrollTo(0, 800);
        });
    }

    // Ensure hero title text is never cut off after animation completes
    function ensureHeroTitleVisible() {
        const heroTitle = document.querySelector('.hero-title.line');
        if (heroTitle) {
            // Force inline-block display immediately
            heroTitle.style.display = 'inline-block';
            
            // Calculate the actual text width needed for the animation
            // Temporarily make it visible to measure
            const originalWidth = heroTitle.style.width;
            const originalOverflow = heroTitle.style.overflow;
            const originalVisibility = heroTitle.style.visibility;
            
            heroTitle.style.width = 'auto';
            heroTitle.style.overflow = 'visible';
            heroTitle.style.visibility = 'hidden'; // Hide but keep layout
            heroTitle.style.borderRight = 'none'; // Remove border for measurement
            
            // Force a reflow
            heroTitle.offsetHeight;
            
            // Get the actual width needed
            const textWidth = heroTitle.scrollWidth;
            
            // Restore original state for animation
            heroTitle.style.width = '0';
            heroTitle.style.overflow = 'hidden';
            heroTitle.style.visibility = '';
            heroTitle.style.borderRight = '';
            
            // Set the animation end width to the actual text width
            if (textWidth > 0) {
                // Update the keyframe animation dynamically
                const existingStyle = document.getElementById('typewriter-animation-style');
                if (existingStyle) {
                    existingStyle.remove();
                }
                const style = document.createElement('style');
                style.id = 'typewriter-animation-style';
                style.textContent = `
                    @keyframes typewriter {
                        from {
                            width: 0;
                        }
                        to {
                            width: ${textWidth}px;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // After typewriter animation completes (5.5 seconds: 1s delay + 4s animation + 0.5s buffer)
            setTimeout(() => {
                // Mark animation as complete
                heroTitle.classList.add('animation-complete');
                
                // Force a reflow to ensure styles are applied
                heroTitle.offsetHeight;
                
                // Get the actual text width needed
                const textWidth = heroTitle.scrollWidth;
                const container = heroTitle.parentElement;
                const containerWidth = container ? container.clientWidth : window.innerWidth;
                
                // Set width to auto to get natural width, but ensure it fits
                heroTitle.style.width = 'auto';
                heroTitle.style.maxWidth = '100%';
                heroTitle.style.overflow = 'visible';
                
                // Force another reflow
                heroTitle.offsetHeight;
                
                // Check if text is cut off and adjust - ensure full text is visible
                // First, set to auto to get natural width
                heroTitle.style.width = 'auto';
                heroTitle.style.maxWidth = 'none'; // Remove max-width temporarily
                heroTitle.style.overflow = 'visible';
                
                // Force reflow
                heroTitle.offsetHeight;
                
                // Get actual needed width
                let neededWidth = heroTitle.scrollWidth;
                let currentWidth = heroTitle.getBoundingClientRect().width;
                
                // If text is cut off, expand to full width needed
                if (neededWidth > currentWidth) {
                    // Set width to exactly what's needed
                    heroTitle.style.width = neededWidth + 'px';
                    heroTitle.style.maxWidth = 'none'; // No max-width constraint
                    heroTitle.style.overflow = 'visible';
                    
                    // Force reflow and verify
                    heroTitle.offsetHeight;
                    currentWidth = heroTitle.getBoundingClientRect().width;
                    neededWidth = heroTitle.scrollWidth;
                    
                    // If still cut off, expand further
                    if (neededWidth > currentWidth) {
                        heroTitle.style.width = neededWidth + 'px';
                        heroTitle.style.maxWidth = 'none';
                    }
                }
                
                // Ensure text is fully visible - set width to scrollWidth
                // First, remove any constraints to get true scrollWidth
                heroTitle.style.width = 'auto';
                heroTitle.style.maxWidth = 'none';
                heroTitle.style.overflow = 'visible';
                
                // Force reflow
                heroTitle.offsetHeight;
                
                // Get the actual needed width
                const finalNeededWidth = heroTitle.scrollWidth;
                const viewportWidth = window.innerWidth;
                const container = heroTitle.parentElement;
                const containerWidth = container ? container.clientWidth : viewportWidth;
                
                // Set width to needed width
                heroTitle.style.width = finalNeededWidth + 'px';
                heroTitle.style.overflow = 'visible';
                
                // On mobile, if text is wider than viewport, we need to handle it differently
                if (viewportWidth <= 768) {
                    // Mobile: if text is wider than viewport, allow it but prevent horizontal scroll on body
                    if (finalNeededWidth > viewportWidth - 48) { // Account for padding
                        // Text is wider - set to viewport width but allow overflow visible
                        heroTitle.style.width = finalNeededWidth + 'px';
                        heroTitle.style.maxWidth = 'none'; // Allow expansion
                        // Ensure body doesn't scroll horizontally
                        document.body.style.overflowX = 'hidden';
                    } else {
                        heroTitle.style.width = finalNeededWidth + 'px';
                        heroTitle.style.maxWidth = '100%';
                    }
                } else {
                    // Desktop: allow expansion beyond container
                    heroTitle.style.width = finalNeededWidth + 'px';
                    heroTitle.style.maxWidth = 'none'; // Allow expansion
                }
                
                // Final verification after a delay
                setTimeout(() => {
                    const checkWidth = heroTitle.getBoundingClientRect().width;
                    const checkNeeded = heroTitle.scrollWidth;
                    if (checkNeeded > checkWidth) {
                        heroTitle.style.width = checkNeeded + 'px';
                        heroTitle.style.maxWidth = 'none';
                        heroTitle.style.overflow = 'visible';
                    }
                }, 500);
                
                // Final check after a brief delay to ensure everything is correct
                setTimeout(() => {
                    const finalWidth = heroTitle.getBoundingClientRect().width;
                    const finalNeeded = heroTitle.scrollWidth;
                    if (finalNeeded > finalWidth) {
                        heroTitle.style.width = finalNeeded + 'px';
                        heroTitle.style.maxWidth = 'none';
                        heroTitle.style.overflow = 'visible';
                    }
                }, 500);
            }, 5000);
            
            // Also handle window resize - only after animation completes
            let resizeTimeout;
            window.addEventListener('resize', () => {
                if (heroTitle.classList.contains('animation-complete')) {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        heroTitle.style.width = 'auto';
                        heroTitle.style.maxWidth = '100%';
                        const container = heroTitle.parentElement;
                        if (container && heroTitle.scrollWidth > container.clientWidth) {
                            heroTitle.style.width = Math.min(heroTitle.scrollWidth, container.clientWidth) + 'px';
                            heroTitle.style.maxWidth = '100%';
                        }
                    }, 250);
                }
            });
        }
    }
    
    ensureHeroTitleVisible();
}

// Typewriter animation is now handled inline in index.html for immediate execution

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
