/* ═══════════════════════════════════════════════════════════════
   script.js — Neel Raj Portfolio
   Features: mobile nav toggle, theme toggle, typing animation,
             scroll reveal, scroll progress, sticky-nav shadow
═══════════════════════════════════════════════════════════════ */

/* ── 1. Mobile Navigation Toggle ── */
const navToggle = document.querySelector('.nav-toggle');
const navMenu   = document.getElementById('nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close when a nav link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ── 2. Typing Animation ── */
const roles = [
    'Frontend Developer',
    'UI/UX Enthusiast',
    'CS Student',
    'Web Designer',
];

const typedEl = document.getElementById('typed-role');
// Start with the first role fully typed (pre-filled in the HTML),
// pause, then delete and cycle through the rest.
let roleIndex  = 0;
let charIndex  = roles[0].length;
let isDeleting = true;
let typingPaused = true;

function typeRole() {
    if (typingPaused) return;

    const current = roles[roleIndex];

    if (!isDeleting) {
        typedEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
            isDeleting = true;
            typingPaused = true;
            setTimeout(() => { typingPaused = false; typeRole(); }, 1800);
            return;
        }
    } else {
        typedEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            roleIndex  = (roleIndex + 1) % roles.length;
        }
    }

    const speed = isDeleting ? 55 : 90;
    setTimeout(typeRole, speed);
}

if (typedEl) setTimeout(() => { typingPaused = false; typeRole(); }, 1800);

/* ── 3. Scroll Reveal ── */
const revealEls = document.querySelectorAll(
    '.skill-card, .project-card, .info-card, .about-text p, .section-inner > h2, .section-label, .section-sub'
);

// Add reveal class
revealEls.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Respect prefers-reduced-motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReduced) {
    revealEls.forEach(el => observer.observe(el));
} else {
    // Show everything immediately
    revealEls.forEach(el => el.classList.add('visible'));
}

/* ── 4. Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks  = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.removeAttribute('aria-current');
                    if (link.getAttribute('href') === '#' + entry.target.id) {
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
    },
    { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));

/* ── 5. Theme Toggle (dark / light) ── */
const themeToggle = document.getElementById('theme-toggle');

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
        themeToggle.setAttribute('aria-label',
            theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        try { localStorage.setItem('portfolio-theme', next); } catch (e) { /* private mode */ }
    });
    // Sync label with the theme chosen by the inline head script
    applyTheme(document.documentElement.getAttribute('data-theme') || 'dark');
}

/* ── 6. Scroll progress bar + sticky-nav shadow ── */
const progressBar = document.getElementById('scroll-progress');
const siteHeader = document.querySelector('.site-header');

function onScroll() {
    if (progressBar) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        progressBar.style.width = pct + '%';
    }
    if (siteHeader) {
        siteHeader.classList.toggle('scrolled', window.scrollY > 10);
    }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
