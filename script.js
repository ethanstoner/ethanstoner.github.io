// Enhanced smooth scroll function with custom easing
function smoothScrollTo(targetPosition, duration = 1000) {
    const startPosition = window.pageYOffset || window.scrollY || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    let startTime = null;
    let animationFrameId = null;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        
        const currentPosition = startPosition + distance * easedProgress;
        
        // Use multiple methods to ensure scroll works
        window.scrollTo(0, currentPosition);
        document.documentElement.scrollTop = currentPosition;
        if (document.body) {
            document.body.scrollTop = currentPosition;
        }
        
        if (timeElapsed < duration) {
            animationFrameId = requestAnimationFrame(animation);
        } else {
            // Ensure we end at exact target
            window.scrollTo(0, targetPosition);
            document.documentElement.scrollTop = targetPosition;
            if (document.body) {
                document.body.scrollTop = targetPosition;
            }
        }
    }

    // Cancel any existing scroll animation
    if (window._currentScrollAnimation) {
        cancelAnimationFrame(window._currentScrollAnimation);
    }
    
    window._currentScrollAnimation = requestAnimationFrame(animation);
}

// Smooth scroll function
function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
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
            
            // Use custom smooth scroll (1000ms for smooth animation)
            smoothScrollTo(desiredPosition, 1000);
            
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

// Initialize when DOM is ready
function initAll() {
    initSmoothScroll();

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
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}
