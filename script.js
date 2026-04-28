const htmlEl = document.documentElement;
const themeButtons = Array.from(document.querySelectorAll("[data-theme-toggle]"));
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const aboutTitle = document.getElementById("aboutTitle");
const currentYear = document.getElementById("currentYear");
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

const storage = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Ignore storage failures in restrictive browsing modes.
        }
    }
};

const getPreferredTheme = () => {
    const savedTheme = storage.get("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const applyTheme = (theme) => {
    htmlEl.setAttribute("data-theme", theme);
    storage.set("theme", theme);

    themeButtons.forEach((button) => {
        const nextTheme = theme === "light" ? "dark" : "light";
        button.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
        button.setAttribute("title", `Switch to ${nextTheme} theme`);
        button.setAttribute("aria-pressed", String(theme === "light"));
    });
};

const setMenuOpen = (isOpen) => {
    if (!nav || !navToggle) {
        return;
    }

    nav.classList.toggle("menu-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    navToggle.setAttribute("title", isOpen ? "Close navigation" : "Open navigation");
};

applyTheme(getPreferredTheme());

themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const currentTheme = htmlEl.getAttribute("data-theme");
        applyTheme(currentTheme === "light" ? "dark" : "light");
    });
});

if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}

if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        setMenuOpen(!isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setMenuOpen(false);
        }
    });

    document.addEventListener("click", (event) => {
        if (nav.classList.contains("menu-open") && !nav.contains(event.target)) {
            setMenuOpen(false);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 780) {
            setMenuOpen(false);
        }
    });
}

const syncNavState = () => {
    if (nav) {
        nav.classList.toggle("scrolled", window.scrollY > 60);
    }
};

syncNavState();
window.addEventListener("scroll", syncNavState, { passive: true });

if (supportsFinePointer && !prefersReducedMotion.matches && cursor && ring) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const lerp = (start, end, amount) => start + (end - start) * amount;

    document.addEventListener("mousemove", (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        cursor.classList.add("is-visible");
        ring.classList.add("is-visible");
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    const animateCursor = () => {
        ringX = lerp(ringX, mouseX, 0.14);
        ringY = lerp(ringY, mouseY, 0.14);
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;
        window.requestAnimationFrame(animateCursor);
    };

    animateCursor();

    document.querySelectorAll("a, button").forEach((element) => {
        element.addEventListener("mouseenter", () => cursor.classList.add("expand"));
        element.addEventListener("mouseleave", () => cursor.classList.remove("expand"));
    });
} else {
    cursor?.remove();
    ring?.remove();
}

const revealElements = Array.from(document.querySelectorAll(".reveal"));

revealElements.forEach((element) => {
    const revealSiblings = Array.from(element.parentElement?.children || []).filter((child) =>
        child.classList?.contains("reveal")
    );
    const siblingIndex = revealSiblings.indexOf(element);
    element.style.transitionDelay = `${Math.max(0, siblingIndex) * 80}ms`;
});

if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
    aboutTitle?.classList.add("visible");
} else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
    });

    revealElements.forEach((element) => revealObserver.observe(element));

    if (aboutTitle) {
        const aboutObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.25
        });

        aboutObserver.observe(aboutTitle);
    }
}
