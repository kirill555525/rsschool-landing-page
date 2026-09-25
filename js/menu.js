import { focusWithoutScroll, lockScroll, unlockScroll } from './ui.js';

export function initMenu() {
    const header = document.querySelector('.header');
    const button = header.querySelector('.burger');
    const nav = header.querySelector('.nav');
    const mobile = window.matchMedia('(max-width: 768px)');
    const background = [...document.querySelectorAll('main, footer, .skip-link')];
    let isOpen = false;

    function updateAvailability() {
        nav.inert = mobile.matches && !isOpen;
        if (nav.inert) nav.setAttribute('aria-hidden', 'true');
        else nav.removeAttribute('aria-hidden');
    }

    function closeMenu(restoreFocus = false) {
        if (!isOpen) return;
        isOpen = false;
        header.classList.remove('header--menu-open');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Open navigation menu');
        background.forEach(element => element.inert = false);
        if (restoreFocus && mobile.matches) focusWithoutScroll(button);
        updateAvailability();
        unlockScroll('menu');
    }

    button.addEventListener('click', () => {
        if (!mobile.matches) return;
        if (isOpen) {
            closeMenu(true);
            return;
        }
        isOpen = true;
        lockScroll('menu');
        header.classList.add('header--menu-open');
        button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-label', 'Close navigation menu');
        updateAvailability();
        background.forEach(element => element.inert = true);
        focusWithoutScroll(nav.querySelector('a'));
    });

    header.addEventListener('click', (event) => {
        if (!isOpen || !event.target.closest('a')) return;
        const link = event.target.closest('a');
        closeMenu(false);
        const target = new URL(link.href);
        if (target.pathname === window.location.pathname && target.hash) {
            const section = document.getElementById(decodeURIComponent(target.hash.slice(1)));
            if (section) {
                section.setAttribute('tabindex', '-1');
                focusWithoutScroll(section);
                section.addEventListener('blur', () => section.removeAttribute('tabindex'), { once: true });
            }
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!isOpen) return;
        if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu(true);
        }
        if (event.key === 'Tab') {
            const focusable = [...header.querySelectorAll('a, button')].filter(el => el.getClientRects().length && !el.closest('[inert]'));
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                focusWithoutScroll(last);
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                focusWithoutScroll(first);
            }
        }
    });

    mobile.addEventListener('change', () => {
        if (!mobile.matches) {
            closeMenu();
            if (document.activeElement === button) focusWithoutScroll(header.querySelector('.logo'));
        }
        updateAvailability();
    });

    new ResizeObserver(() => {
        document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`);
    }).observe(header);
    updateAvailability();
}
