import { categories, movies } from './data.js';
import { createMovieCard } from './cards.js';
import { focusWithoutScroll } from './ui.js';

export function initCatalog(openMovie) {
    const grid = document.querySelector('.movie-grid');
    if (!grid) return;
    const buttons = [...document.querySelectorAll('.catalog__tab')];
    const more = document.querySelector('.catalog__more');
    const moreButton = more.querySelector('button');
    const status = document.querySelector('.catalog__status');
    const medium = window.matchMedia('(min-width: 901px) and (max-width: 1100px)');
    let activeCategory = categories[0].id;
    let expanded = false;

    function render() {
        const items = movies.filter(movie => movie.category === activeCategory);
        const visibleItems = expanded ? items : items.slice(0, medium.matches ? 3 : 4);
        grid.replaceChildren(...visibleItems.map(movie => createMovieCard(movie, openMovie)));
        buttons.forEach((button) => {
            const active = button.dataset.category === activeCategory;
            button.classList.toggle('catalog__tab--active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        const name = categories.find(category => category.id === activeCategory).label;
        document.querySelector('#category-title').textContent = name;
        status.textContent = `${name} · Showing ${visibleItems.length} of ${items.length}`;
        more.hidden = visibleItems.length === items.length;
        moreButton.setAttribute('aria-label', `Show all ${items.length} ${name.toLowerCase()} movies`);
    }

    buttons.forEach(button => button.addEventListener('click', () => {
        if (activeCategory === button.dataset.category) return;
        activeCategory = button.dataset.category;
        expanded = false;
        render();
    }));
    moreButton.addEventListener('click', () => {
        const previousCount = grid.children.length;
        expanded = true;
        render();
        focusWithoutScroll(grid.children[previousCount]?.querySelector('button'));
    });
    medium.addEventListener('change', () => {
        const focusedId = document.activeElement.closest('[data-movie-id]')?.dataset.movieId;
        const moreWasFocused = document.activeElement === moreButton;
        render();
        if (focusedId) {
            const card = [...grid.children].find(element => element.dataset.movieId === focusedId);
            focusWithoutScroll(card?.querySelector('button') || moreButton);
        } else if (moreWasFocused && more.hidden) {
            focusWithoutScroll(buttons.find(button => button.dataset.category === activeCategory));
        }
    });
    render();
}
