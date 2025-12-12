// Sound effects removed per user request

// Smooth scroll polyfill for older browsers
function smoothScrollTo(targetPosition) {
    const startPosition = window.pageYOffset || document.documentElement.scrollTop;
    const distance = targetPosition - startPosition;
    const duration = 500; // 500ms scroll duration
    let start = null;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function (ease-in-out)
        const ease = percentage < 0.5
            ? 2 * percentage * percentage
            : 1 - Math.pow(-2 * percentage + 2, 2) / 2;
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (progress < duration) {
            window.requestAnimationFrame(step);
        }
    }
    
    window.requestAnimationFrame(step);
}

// Enhanced smooth scroll function
function smoothScrollToTop() {
    const startPosition = window.pageYOffset;
    if (startPosition === 0) {
        // Already at top, just update active state
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(l => l.classList.remove('active'));
        const homeLink = document.querySelector('a[href="#"]');
        if (homeLink) homeLink.classList.add('active');
        return;
    }
    
    const distance = -startPosition;
    const duration = 800;
    let start = null;
    let animationId = null;
    
    function scrollStep(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);
        
        // Easing function (ease-in-out)
        const ease = percentage < 0.5
            ? 2 * percentage * percentage
            : 1 - Math.pow(-2 * percentage + 2, 2) / 2;
        
        const currentPosition = startPosition + distance * ease;
        window.scrollTo(0, currentPosition);
        
        if (progress < duration) {
            animationId = window.requestAnimationFrame(scrollStep);
        } else {
            window.scrollTo(0, 0);
            // Update active nav after scroll completes
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(l => l.classList.remove('active'));
            const homeLink = document.querySelector('a[href="#"]');
            if (homeLink) homeLink.classList.add('active');
        }
    }
    
    animationId = window.requestAnimationFrame(scrollStep);
    
    // Store animation ID for potential cancellation
    if (window.homeScrollAnimation) {
        window.cancelAnimationFrame(window.homeScrollAnimation);
    }
    window.homeScrollAnimation = animationId;
}

// Smooth scroll function - can be called immediately or on DOMContentLoaded
function initSmoothScroll() {
    // Smooth scroll for anchor links only (not mailto, http, https)
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach((anchor) => {
        // Skip mailto and external links
        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('mailto:') || href.startsWith('http://') || href.startsWith('https://')) {
            return; // Let browser handle these normally
        }
        
        // Remove any existing listeners
        const newAnchor = anchor.cloneNode(true);
        anchor.parentNode.replaceChild(newAnchor, anchor);
        
        newAnchor.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            
            const href = this.getAttribute('href');
            
            // Close mobile menu if open
            const mainNav = document.getElementById('main-nav');
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                if (mobileMenuToggle) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                }
            }
            
            // CRITICAL: Update active nav IMMEDIATELY and PERSISTENTLY
            // Use a single synchronous operation to avoid race conditions
            const allNavLinks = document.querySelectorAll('.nav-link');
            
            // Find the corresponding nav link if this is a hero CTA button
            let navLinkToActivate = null;
            if (this.classList.contains('btn-primary') || this.classList.contains('btn-secondary')) {
                // This is a hero CTA button - find the matching nav link
                const targetHref = this.getAttribute('href');
                navLinkToActivate = document.querySelector(`.nav-link[href="${targetHref}"]`);
            } else {
                // This is a nav link itself
                navLinkToActivate = this;
            }
            
            const clickedLink = navLinkToActivate || this;
            
            // Clear all active states and user-clicked flags
            allNavLinks.forEach(l => {
                l.classList.remove('active');
                l.dataset.userClicked = 'false';
            });
            
            // Only update nav link if we found one (skip if clicking nav link directly)
            if (navLinkToActivate) {
                // Immediately set this link as active - MUST be synchronous
                clickedLink.classList.add('active');
                clickedLink.dataset.userClicked = 'true';
                clickedLink.dataset.clickTime = Date.now().toString();
                lastClickedLink = clickedLink;
            }
            
            // Only verify if we have a nav link to activate
            if (navLinkToActivate) {
                // Verify in next frame to ensure it stuck
                requestAnimationFrame(() => {
                    // Ensure only this link is active
                    allNavLinks.forEach(l => {
                        if (l !== clickedLink) {
                            l.classList.remove('active');
                        }
                    });
                    clickedLink.classList.add('active');
                });
                
                // Also verify after a short delay
                setTimeout(() => {
                    // Final check - ensure clicked link is active
                    allNavLinks.forEach(l => {
                        if (l !== clickedLink && l.classList.contains('active')) {
                            l.classList.remove('active');
                        }
                    });
                    if (!clickedLink.classList.contains('active')) {
                        clickedLink.classList.add('active');
                    }
                }, 50);
                
                // Prevent scroll handler from overriding for 3.5 seconds
                ignoreScrollUpdate = true;
                setTimeout(() => {
                    // Only re-enable if this is still the last clicked link
                    if (lastClickedLink === clickedLink) {
                        ignoreScrollUpdate = false;
                        // Final verification
                        allNavLinks.forEach(l => {
                            if (l !== clickedLink) l.classList.remove('active');
                        });
                        clickedLink.classList.add('active');
                    }
                }, 3500);
            }
            
            // Handle home link - scroll to top
            if (!href || href === '#' || href === '' || href === '#home') {
                // Smooth scroll to top
                smoothScrollToTop();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Update URL without hash
                if (history.pushState) {
                    history.pushState(null, null, window.location.pathname + window.location.search);
                }
                
                return false;
            }
            
            const target = document.querySelector(href);
            if (!target) {
                return false;
            }
            
            // If navigating to contact section, show it immediately
            if (href === '#contact') {
                const contactCard = document.querySelector('.contact-card');
                if (contactCard) {
                    contactCard.style.opacity = '1';
                    contactCard.style.transform = 'translateY(0)';
                }
            }
            
            // Get header height dynamically
            const header = document.querySelector('.header');
            const headerOffset = header ? header.offsetHeight : 80;
            
            // Calculate target position
            const targetTop = target.offsetTop;
            const desiredPosition = Math.max(0, targetTop - headerOffset);
            
            // Detect mobile device for optimized scrolling
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            
            // On mobile, use native smooth scroll only (faster, smoother)
            if (isMobile) {
                // Use native smooth scroll with shorter duration via CSS
                window.scrollTo({
                    top: desiredPosition,
                    behavior: 'smooth'
                });
                
                // Verify active state after scroll completes
                setTimeout(() => {
                    if (lastClickedLink === this && this.dataset.userClicked === 'true') {
                        const allNavLinks = document.querySelectorAll('.nav-link');
                        allNavLinks.forEach(l => l.classList.remove('active'));
                        this.classList.add('active');
                    }
                }, 300);
            } else {
                // Desktop: use optimized polyfill for better control
                const startPosition = window.pageYOffset;
                const distance = desiredPosition - startPosition;
                const duration = Math.min(600, Math.abs(distance) * 0.5); // Adaptive duration
                let start = null;
                let animationId = null;
                
                function scrollStep(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const percentage = Math.min(progress / duration, 1);
                    
                    // Easing function (ease-in-out)
                    const ease = percentage < 0.5
                        ? 2 * percentage * percentage
                        : 1 - Math.pow(-2 * percentage + 2, 2) / 2;
                    
                    const currentPos = startPosition + distance * ease;
                    window.scrollTo(0, currentPos);
                    
                    if (progress < duration) {
                        animationId = window.requestAnimationFrame(scrollStep);
                    } else {
                        // Ensure we end at exact position
                        window.scrollTo(0, desiredPosition);
                        // Verify active state after scroll completes
                        setTimeout(() => {
                            if (lastClickedLink === this && this.dataset.userClicked === 'true') {
                                const allNavLinks = document.querySelectorAll('.nav-link');
                                allNavLinks.forEach(l => l.classList.remove('active'));
                                this.classList.add('active');
                            }
                        }, 100);
                    }
                }
                
                // Start polyfill animation
                animationId = window.requestAnimationFrame(scrollStep);
            }
            
            // Update URL without hash
            if (history.pushState) {
                history.pushState(null, null, window.location.pathname + window.location.search);
            }
            
            return false;
        });
    });
}

// Remove hash from URL on page load (especially #hero or any hash)
function removeHashFromURL() {
    // If there's a hash in the URL, handle it
    if (window.location.hash) {
        const hash = window.location.hash;
        
        // If it's #hero or empty, just remove it and scroll to top
        if (hash === '#hero' || hash === '#') {
            // Scroll to top smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Remove hash from URL
            if (history.pushState) {
                history.pushState(null, null, window.location.pathname + window.location.search);
            } else {
                window.location.hash = '';
            }
        } else {
            // For other hashes, scroll to the section smoothly, then remove hash
            const target = document.querySelector(hash);
            if (target) {
                const header = document.querySelector('.header');
                const headerOffset = header ? header.offsetHeight : 80;
                const targetTop = target.offsetTop;
                const desiredPosition = Math.max(0, targetTop - headerOffset);
                
                // Scroll smoothly to the section
                window.scrollTo({
                    top: desiredPosition,
                    behavior: 'smooth'
                });
                
                // Remove hash from URL after scrolling starts
                setTimeout(() => {
                    if (history.pushState) {
                        history.pushState(null, null, window.location.pathname + window.location.search);
                    }
                }, 100);
            } else {
                // Target not found, just remove hash
                if (history.pushState) {
                    history.pushState(null, null, window.location.pathname + window.location.search);
                }
            }
        }
    }
}

// Initialize smooth scroll when DOM is ready
function initAll() {
    // Remove hash from URL first
    removeHashFromURL();
    
    initSmoothScroll();
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            mainNav.classList.toggle('active');
            const isOpen = mainNav.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isOpen);
        });
        
        // Close menu when clicking on a nav link
        const navLinks = mainNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Close menu immediately
                mainNav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }, { capture: true }); // Use capture phase to run before smooth scroll
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mainNav.classList.contains('active') && 
                !mainNav.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                mainNav.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

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
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            lastScroll = currentScroll;
        });
    }

    // Update active nav link on scroll
    const sections = document.querySelectorAll('.section[id], .hero-section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    let ignoreScrollUpdate = false; // Flag to prevent scroll updates right after click
    let lastClickedLink = null; // Track last clicked link

    function updateActiveNavLink() {
        // Don't update if we just clicked a link (wait for scroll to settle)
        if (ignoreScrollUpdate) {
            return;
        }
        
        // Check if any link was recently clicked by user - if so, don't override
        let userClickedLink = null;
        navLinks.forEach(link => {
            if (link.dataset.userClicked === 'true') {
                const clickTime = parseInt(link.dataset.clickTime || '0');
                const timeSinceClick = Date.now() - clickTime;
                // If clicked within last 4 seconds, keep it active
                if (timeSinceClick < 4000) {
                    userClickedLink = link;
                } else {
                    // Clear old click flag
                    link.dataset.userClicked = 'false';
                }
            }
        });
        
        // If user clicked a link recently, keep it active and exit
        if (userClickedLink) {
            navLinks.forEach(link => {
                if (link !== userClickedLink) link.classList.remove('active');
            });
            userClickedLink.classList.add('active');
            return;
        }
        
        const scrollPosition = window.pageYOffset;
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        let current = '';
        
        // If at top (within first 400px), highlight home link
        if (scrollPosition < 400) {
            current = 'home';
        } else {
            // Find which section we're currently in
            const sectionsArray = Array.from(sections);
            
            // Check each section to see if we're in it
            for (const section of sectionsArray) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                const sectionId = section.getAttribute('id');
                
                // Calculate if we're in this section
                const sectionStart = sectionTop - headerHeight - 150;
                const sectionEnd = sectionTop + sectionHeight - headerHeight - 150;
                
                // If scroll position is within this section's range
                if (scrollPosition >= sectionStart && scrollPosition <= sectionEnd) {
                    current = sectionId;
                    break;
                }
            }
            
            // If no section matched, find the closest one
            if (!current) {
                let closestSection = '';
                let closestDistance = Infinity;
                
                sectionsArray.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionId = section.getAttribute('id');
                    const distance = Math.abs(scrollPosition - (sectionTop - headerHeight));
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestSection = sectionId;
                    }
                });
                
                current = closestSection;
            }
        }

        // Update all nav links - but don't override user-clicked links
        navLinks.forEach(link => {
            // Only remove active if this link wasn't user-clicked
            if (link.dataset.userClicked !== 'true') {
                link.classList.remove('active');
            }
        });
        
        // Then add active to the correct one (if not user-clicked)
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip if this link was user-clicked
            if (link.dataset.userClicked === 'true') {
                return;
            }
            
            // Handle home link
            if ((href === '#' || href === '#home') && current === 'home') {
                link.classList.add('active');
            } else if (href === `#${current}` && current && current !== 'home') {
                link.classList.add('active');
            }
        });
    }

    // Throttle scroll events for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveNavLink, 200);
    }, { passive: true });
    
    // Update immediately on page load
    updateActiveNavLink();
    
    // Also update after a short delay to catch any layout changes
    setTimeout(updateActiveNavLink, 500);
    
    // Clear user-clicked flags after 4 seconds to allow scroll-based updates again
    setInterval(() => {
        navLinks.forEach(link => {
            if (link.dataset.userClicked === 'true') {
                // Only clear if scroll has settled
                const timeSinceClick = Date.now() - (link.dataset.clickTime || 0);
                if (timeSinceClick > 4000) {
                    link.dataset.userClicked = 'false';
                }
            }
        });
    }, 1000);

    // Intersection Observer for fade-in animations with stagger
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Contact cards appear immediately (no delay)
                if (entry.target.classList.contains('contact-card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                } else {
                    // Other cards have minimal stagger
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50);
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections with stagger
    document.querySelectorAll('.project-card, .tech-category, .content-card, .contact-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        
        // Contact cards have faster transition
        if (el.classList.contains('contact-card')) {
            el.style.transition = `opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)`;
            el.style.transitionDelay = '0s';
        } else {
            el.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
            el.style.transitionDelay = `${index * 0.05}s`;
        }
        observer.observe(el);
    });
    
    // Immediately show contact section when navigated to via anchor
    function showContactSectionImmediately() {
        const contactCard = document.querySelector('.contact-card');
        const contactSection = document.querySelector('#contact');
        if (contactCard && contactSection) {
            // Check if we're at or near the contact section
            const rect = contactSection.getBoundingClientRect();
            const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
            const isVisible = rect.top <= headerHeight + 200 && rect.bottom >= 0;
            
            if (isVisible && contactCard.style.opacity === '0') {
                contactCard.style.opacity = '1';
                contactCard.style.transform = 'translateY(0)';
                // Stop observing since we've manually shown it
                observer.unobserve(contactCard);
            }
        }
    }
    
    // Check immediately and on scroll
    showContactSectionImmediately();
    window.addEventListener('scroll', () => {
        showContactSectionImmediately();
    }, { passive: true });

    // Hover sounds disabled - removed per user request

    // Click sounds removed per user request
}

// Prevent default hash jump behavior
function preventHashJump() {
    // If there's a hash, scroll to top first to prevent jump
    if (window.location.hash) {
        // Temporarily remove scroll-behavior to prevent jump
        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, 0);
        
        // Restore smooth scroll after a brief moment
        setTimeout(() => {
            document.documentElement.style.scrollBehavior = 'smooth';
        }, 10);
    }
}

// Run immediately to prevent hash jump
preventHashJump();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    // DOM is already loaded, run immediately
    initAll();
}

// Also ensure smooth scroll works on page load
window.addEventListener('load', () => {
    // Re-initialize smooth scroll to catch any dynamically added links
    setTimeout(initSmoothScroll, 100);
});

// Email copy functionality
function copyEmail(e) {
    e.preventDefault();
    e.stopPropagation();

    const email = "ethanstoner08@gmail.com";
    
    // Use modern clipboard API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
            showCopyFeedback(e.currentTarget);
        }).catch(err => {
            console.warn('Failed to copy:', err);
            // Fallback to older method
            fallbackCopyTextToClipboard(email, e.currentTarget);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(email, e.currentTarget);
    }
}

function fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback(button);
        } else {
            console.warn('Fallback copy failed');
        }
    } catch (err) {
        console.warn('Fallback copy error:', err);
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback(button) {
    const original = button.textContent;
    button.textContent = "Copied!";
    button.style.background = "rgba(255, 255, 255, 0.3)";
    button.style.borderColor = "rgba(255, 255, 255, 0.6)";
    
    setTimeout(() => {
        button.textContent = original;
        button.style.background = "";
        button.style.borderColor = "";
    }, 1200);
}
