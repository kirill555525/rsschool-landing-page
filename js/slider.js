import { movies } from './data.js';
import { createMovieCard } from './cards.js';

export function initSlider(openMovie) {
    const slider = document.querySelector('.slider');
    if (!slider) return;
    const viewport = slider.querySelector('.slider__viewport');
    const track = slider.querySelector('.slider__track');
    const pagination = document.querySelector('.slider-pagination');
    const status = document.querySelector('.slider__status');
    const mobile = window.matchMedia('(max-width: 768px)');
    const tablet = window.matchMedia('(max-width: 900px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const items = movies.filter(movie => movie.featured);
    let perPage = 0;
    let pageIndex = 0;
    let pages = [];
    let animating = false;
    let timer;
    let pointerStart = null;
    let suppressClick = false;

    function translate(index) {
        track.style.transform = `translateX(-${(index + 1) * 100}%)`;
    }

    function updateState() {
        [...pagination.children].forEach((button, index) => {
            const active = index === pageIndex;
            button.classList.toggle('slider-pagination__item--active', active);
            if (active) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
        [...track.children].forEach((page, index) => {
            const active = index === pageIndex + 1;
            page.inert = !active;
            page.setAttribute('aria-hidden', String(!active));
        });
        status.textContent = `Featured movies, page ${pageIndex + 1} of ${pages.length}: ${pages[pageIndex].map(movie => movie.title).join(', ')}.`;
    }

    function finishTransition() {
        if (!animating) return;
        clearTimeout(timer);
        animating = false;
        track.classList.remove('slider__track--moving');
        translate(pageIndex);
    }

    function goTo(target) {
        if (animating || target === pageIndex) return;
        const visualIndex = target;
        pageIndex = (target + pages.length) % pages.length;
        animating = true;
        void track.offsetWidth;
        track.classList.add('slider__track--moving');
        translate(visualIndex);
        updateState();
        if (reducedMotion.matches) finishTransition();
        else timer = window.setTimeout(finishTransition, 500);
    }

    function build() {
        const nextPerPage = mobile.matches ? 1 : tablet.matches ? 2 : 3;
        if (perPage === nextPerPage) return;
        const firstItemIndex = pageIndex * perPage;
        finishTransition();
        perPage = nextPerPage;
        pageIndex = Math.floor(firstItemIndex / perPage);
        pages = [];
        for (let index = 0; index < items.length; index += perPage) pages.push(items.slice(index, index + perPage));
        track.style.setProperty('--slides-per-page', String(perPage));
        track.classList.remove('slider__track--moving');
        track.replaceChildren();
        [pages.at(-1), ...pages, pages[0]].forEach((group) => {
            const page = document.createElement('div');
            page.className = 'slider__page';
            page.append(...group.map(movie => createMovieCard(movie, openMovie, true)));
            track.append(page);
        });
        pagination.replaceChildren();
        pages.forEach((group, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'slider-pagination__item';
            button.setAttribute('aria-label', `Show featured page ${index + 1}`);
            button.setAttribute('aria-controls', 'featured-slides');
            button.addEventListener('click', () => goTo(index));
            pagination.append(button);
        });
        translate(pageIndex);
        updateState();
    }

    slider.querySelector('.slider__button--previous').addEventListener('click', () => goTo(pageIndex - 1));
    slider.querySelector('.slider__button--next').addEventListener('click', () => goTo(pageIndex + 1));
    track.addEventListener('transitionend', (event) => {
        if (event.target === track && event.propertyName === 'transform') finishTransition();
    });
    viewport.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        viewport.focus({ preventScroll: true });
        goTo(pageIndex + (event.key === 'ArrowRight' ? 1 : -1));
    });

    viewport.addEventListener('pointerdown', (event) => {
        suppressClick = false;
        if (event.pointerType === 'mouse') return;
        pointerStart = { x: event.clientX, y: event.clientY };
    });
    viewport.addEventListener('pointerup', (event) => {
        if (!pointerStart) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        pointerStart = null;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            suppressClick = true;
            goTo(pageIndex + (dx < 0 ? 1 : -1));
            window.setTimeout(() => { suppressClick = false; }, 400);
        }
    });
    viewport.addEventListener('pointercancel', () => { pointerStart = null; });
    viewport.addEventListener('click', (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
    }, true);

    mobile.addEventListener('change', build);
    tablet.addEventListener('change', build);
    reducedMotion.addEventListener('change', finishTransition);
    build();
}
