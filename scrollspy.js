/**
 * Scrollspy implementation based on a viewport anchor line.
 * The active section is the last section whose top has crossed
 * a point below the fixed header.
 *
 * Nav links are resolved from the LIVE DOM at use-time (via the
 * data-nav-link attribute) rather than cached, because script.js
 * clone-replaces the nav anchors after this script runs to strip
 * old listeners. Caching element references here would leave
 * scrollspy updating detached, orphaned nodes.
 */

(function() {
    'use strict';

    const sections = new Map();
    let currentActive = null;
    let isScrolling = false;
    let rafId = null;

    function getNavLink(name) {
        return document.querySelector(`[data-nav-link="${name}"]`);
    }

    function getAllNavLinks() {
        return document.querySelectorAll('[data-nav-link]');
    }

    function initScrollspy() {
        sections.clear();

        document.querySelectorAll('[data-section]').forEach((section) => {
            const sectionName = section.getAttribute('data-section');
            if (sectionName) {
                sections.set(sectionName, section);
            }
        });

        if (sections.size === 0 || getAllNavLinks().length === 0) {
            console.warn('Scrollspy: No sections or nav links found with data attributes');
            return;
        }

        updateActiveSection();
        bindEvents();
    }

    function getHeaderOffset() {
        const header = document.querySelector('.header');
        return header ? header.offsetHeight : 80;
    }

    function getOrderedSections() {
        return Array.from(sections.entries())
            .map(([name, element]) => ({
                name,
                element,
                top: element.getBoundingClientRect().top + window.pageYOffset
            }))
            .sort((a, b) => a.top - b.top);
    }

    function findActiveSection() {
        const scrollY = window.pageYOffset || window.scrollY;
        if (scrollY < 160) {
            return 'home';
        }

        const headerOffset = getHeaderOffset();
        const anchorY = scrollY + headerOffset + Math.min(window.innerHeight * 0.3, 220);
        const orderedSections = getOrderedSections();

        let active = 'home';
        for (const section of orderedSections) {
            if (section.top <= anchorY) {
                active = section.name;
            } else {
                break;
            }
        }

        return active;
    }

    function setActive(sectionName) {
        if (!sectionName) {
            return;
        }

        const activeLink = getNavLink(sectionName);
        if (!activeLink) {
            return;
        }

        // Reconcile against the LIVE DOM, not just the cached value:
        // another module (script.js click handler) may have changed the
        // active link without telling us, and our nav references can be
        // replaced out from under us. Only skip work if the DOM already
        // shows exactly the right link active.
        const currentlyActive = document.querySelectorAll('.nav-link.active');
        const alreadyCorrect =
            currentActive === sectionName &&
            currentlyActive.length === 1 &&
            currentlyActive[0] === activeLink;
        if (alreadyCorrect) {
            return;
        }

        currentActive = sectionName;

        getAllNavLinks().forEach((link) => {
            link.classList.remove('active');
        });

        activeLink.classList.add('active');
        updateIndicatorBar(activeLink);
    }

    function updateIndicatorBar(activeLink) {
        if (!activeLink) {
            return;
        }

        let indicator = document.querySelector('.nav-indicator');
        if (!indicator) {
            const nav = document.getElementById('main-nav');
            if (!nav) {
                return;
            }
            indicator = document.createElement('div');
            indicator.className = 'nav-indicator';
            nav.appendChild(indicator);
        }

        requestAnimationFrame(() => {
            const nav = activeLink.closest('.nav');
            if (!nav) {
                return;
            }

            const linkRect = activeLink.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            indicator.style.left = `${linkRect.left - navRect.left}px`;
            indicator.style.width = `${linkRect.width}px`;
        });
    }

    function updateActiveSection() {
        if (isScrolling) {
            return;
        }
        setActive(findActiveSection());
    }

    function scheduleUpdate() {
        // Coalesce: if an update is already scheduled for the next frame,
        // let it run. Cancelling + rescheduling on every scroll event
        // starves the callback during continuous scrolling, which makes
        // the active link lag ~a section behind the real scroll position.
        if (rafId) {
            return;
        }
        rafId = requestAnimationFrame(() => {
            rafId = null;
            updateActiveSection();
        });
    }

    let eventsBound = false;
    function bindEvents() {
        if (eventsBound) {
            return;
        }
        eventsBound = true;

        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        window.addEventListener('load', scheduleUpdate, { passive: true });

        // Any user-initiated wheel or touch always clears the isScrolling lock
        window.addEventListener('wheel', () => {
            if (isScrolling) {
                isScrolling = false;
                if (scrollTimer) { clearTimeout(scrollTimer); scrollTimer = null; }
                scheduleUpdate();
            }
        }, { passive: true });
        window.addEventListener('touchstart', () => {
            if (isScrolling) {
                isScrolling = false;
                if (scrollTimer) { clearTimeout(scrollTimer); scrollTimer = null; }
                scheduleUpdate();
            }
        }, { passive: true });
    }

    let scrollTimer = null;
    function setScrolling(flag) {
        isScrolling = flag;
        if (scrollTimer) {
            clearTimeout(scrollTimer);
            scrollTimer = null;
        }
        if (flag) {
            // Safety net only: the nav click handler releases this lock precisely
            // when its smooth scroll settles on target (holdNavIndicatorUntilSettled).
            // This timer just guarantees the lock can never get stuck permanently.
            // It must be LONGER than any real smooth scroll — a short cap (e.g. 700ms)
            // used to expire mid-flight on long top-to-bottom scrolls and make the
            // active nav indicator bounce through the sections it passed.
            scrollTimer = setTimeout(() => {
                isScrolling = false;
                scrollTimer = null;
                scheduleUpdate();
            }, 3500);
        } else {
            scheduleUpdate();
        }
    }

    window.scrollspySetScrolling = setScrolling;
    window.scrollspyUpdateIndicator = updateIndicatorBar;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollspy);
    } else {
        initScrollspy();
    }

    // Re-sync shortly after load: script.js clone-replaces the nav anchors
    // and may set an active link on click without notifying scrollspy.
    window.addEventListener('load', () => {
        currentActive = null;
        scheduleUpdate();
    });
})();
