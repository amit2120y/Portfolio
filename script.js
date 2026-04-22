// ── Theme toggle ──────────────────────────────────────
const htmlEl = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

// Restore saved preference (default: dark)
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeBtn.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'light' ? 'dark' : 'light');
});

// Cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
});

const lerp = (a, b, t) => a + (b - a) * t;
(function animate() {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animate);
})();

document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
});

// Also expand cursor on the new toggle button (ensure it picks it up)
themeBtn.addEventListener('mouseenter', () => cursor.classList.add('expand'));
themeBtn.addEventListener('mouseleave', () => cursor.classList.remove('expand'));

// Nav scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
});

// Intersection observer
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// About title reveal
const aboutObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
        }
    });
}, { threshold: 0.2 });

const aboutTitle = document.getElementById('aboutTitle');
if (aboutTitle) aboutObserver.observe(aboutTitle);

// Stagger reveals
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const siblings = e.target.parentElement.querySelectorAll('.reveal');
            siblings.forEach((el, i) => {
                setTimeout(() => el.classList.add('visible'), i * 100);
            });
        }
    });
}, { threshold: 0.05 });
