// Sound effects (using Web Audio API for subtle UI sounds)
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    playTone(frequency, duration, type = 'sine', volume = 0.08) {
        if (!this.enabled || !this.audioContext) return;
        if (typeof window !== 'undefined' && window.__PLAYWRIGHT_TEST__) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playClick() {
        // Satisfying keyboard-like thocky click sound
        // Quick, sharp, low-frequency thock - like a mechanical keyboard
        this.playTone(100, 0.03, 'sine', 0.25);
        setTimeout(() => this.playTone(60, 0.02, 'sine', 0.15), 10);
    }

    playHover() {
        // Disabled - no hover sounds
        return;
    }

    playSuccess() {
        this.playTone(600, 0.1, 'sine', 0.1);
        setTimeout(() => this.playTone(800, 0.15, 'sine', 0.1), 100);
    }
}

const soundManager = new SoundManager();

// Expose soundManager to window for debugging
if (typeof window !== 'undefined') {
    window.soundManager = soundManager;
}

// Smooth scroll function - can be called immediately or on DOMContentLoaded
function initSmoothScroll() {
    // Smooth scroll for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    
    anchors.forEach((anchor) => {
        // Remove any existing listeners by cloning the node
        const newAnchor = anchor.cloneNode(true);
        anchor.parentNode.replaceChild(newAnchor, anchor);
        
        newAnchor.addEventListener('click', function (e) {
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
            
            // Play click sound
            try {
                soundManager.playClick();
            } catch (err) {
                // Ignore sound errors
            }
            
            const headerOffset = 80;
            
            // Calculate target position
            const targetTop = target.offsetTop;
            const desiredPosition = Math.max(0, targetTop - headerOffset);
            
            // Force scroll using multiple methods to ensure it works
            // Method 1: Direct scroll
            window.scrollTo(0, desiredPosition);
            document.documentElement.scrollTop = desiredPosition;
            if (document.body) {
                document.body.scrollTop = desiredPosition;
            }
            
            // Method 2: Use scrollIntoView then adjust
            target.scrollIntoView({ behavior: 'instant', block: 'start' });
            
            // Method 3: Force again after a micro-delay
            setTimeout(() => {
                window.scrollTo(0, desiredPosition);
                document.documentElement.scrollTop = desiredPosition;
            }, 1);
            
            // Method 4: One more time to be absolutely sure
            requestAnimationFrame(() => {
                window.scrollTo(0, desiredPosition);
                document.documentElement.scrollTop = desiredPosition;
            });
            
            return false;
        });
    });
}

// Initialize smooth scroll when DOM is ready
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
    const sections = document.querySelectorAll('.section, .hero-section');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveNavLink() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
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
    }

    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();

    // Intersection Observer for fade-in animations with stagger
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections with stagger
    document.querySelectorAll('.project-card, .tech-category, .content-card, .contact-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
        el.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(el);
    });

    // Hover sounds disabled - removed per user request

    // Click sounds are handled in the smooth scroll function above
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    // DOM is already loaded, run immediately
    initAll();
}
