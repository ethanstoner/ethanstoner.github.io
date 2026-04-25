/**
 * Scrollspy implementation based on a viewport anchor line.
 * The active section is the last section whose top has crossed
 * a point below the fixed header.
 */

(function() {
    'use strict';

    const sections = new Map();
    const navLinks = new Map();
    let currentActive = 'home';
    let isScrolling = false;
    let rafId = null;

    function initScrollspy() {
        sections.clear();
        navLinks.clear();

        document.querySelectorAll('[data-section]').forEach((section) => {
            const sectionName = section.getAttribute('data-section');
            if (sectionName) {
                sections.set(sectionName, section);
            }
        });

        document.querySelectorAll('[data-nav-link]').forEach((link) => {
            const sectionName = link.getAttribute('data-nav-link');
            if (sectionName) {
                navLinks.set(sectionName, link);
            }
        });

        if (sections.size === 0 || navLinks.size === 0) {
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
        if (!sectionName || currentActive === sectionName) {
            return;
        }

        currentActive = sectionName;

        navLinks.forEach((link) => {
            link.classList.remove('active');
        });

        const activeLink = navLinks.get(sectionName);
        if (activeLink) {
            activeLink.classList.add('active');
            updateIndicatorBar(activeLink);
        }
    }

    function updateIndicatorBar(activeLink) {
        let indicator = document.querySelector('.nav-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'nav-indicator';
            const nav = document.getElementById('main-nav');
            if (!nav) {
                return;
            }
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
        if (rafId) {
            cancelAnimationFrame(rafId);
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
    }

    let scrollTimer = null;
    function setScrolling(flag) {
        isScrolling = flag;
        if (scrollTimer) {
            clearTimeout(scrollTimer);
            scrollTimer = null;
        }
        if (flag) {
            // Re-enable scroll-based updates after smooth scroll finishes
            scrollTimer = setTimeout(() => {
                isScrolling = false;
                scrollTimer = null;
                scheduleUpdate();
            }, 600);
            // Also clear on any user-initiated wheel/touch (overrides the timer)
            const clearOnInput = () => {
                isScrolling = false;
                if (scrollTimer) { clearTimeout(scrollTimer); scrollTimer = null; }
                scheduleUpdate();
                window.removeEventListener('wheel', clearOnInput);
                window.removeEventListener('touchstart', clearOnInput);
            };
            window.addEventListener('wheel', clearOnInput, { once: true, passive: true });
            window.addEventListener('touchstart', clearOnInput, { once: true, passive: true });
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
})();
