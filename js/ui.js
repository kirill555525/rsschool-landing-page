const scrollLocks = new Set();
let scrollPosition = { x: 0, y: 0 };

export const money = (pence) => new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP',
}).format(pence / 100);

export function imageUrl(movie) {
    return new URL(`../assets/images/${movie.image}`, import.meta.url).href;
}

export function lockScroll(owner) {
    if (scrollLocks.has(owner)) return;
    if (scrollLocks.size === 0) {
        const root = document.documentElement;
        scrollPosition = { x: window.scrollX, y: window.scrollY };
        root.style.setProperty('--scroll-top', `${-scrollPosition.y}px`);
        root.style.setProperty('--scrollbar-gap', `${window.innerWidth - root.clientWidth}px`);
        root.classList.add('scroll-locked');
    }
    scrollLocks.add(owner);
}

export function unlockScroll(owner) {
    if (!scrollLocks.delete(owner) || scrollLocks.size > 0) return;
    const root = document.documentElement;
    root.classList.remove('scroll-locked');
    root.style.removeProperty('--scroll-top');
    root.style.removeProperty('--scrollbar-gap');
    window.scrollTo({ left: scrollPosition.x, top: scrollPosition.y, behavior: 'instant' });
}

export function focusWithoutScroll(element) {
    element?.focus({ preventScroll: true });
}
