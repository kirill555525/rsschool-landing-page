import { focusWithoutScroll, imageUrl, lockScroll, money, unlockScroll } from './ui.js';

export function createMovieDialog() {
    const dialog = document.createElement('dialog');
    dialog.className = 'movie-dialog';
    dialog.setAttribute('aria-labelledby', 'movie-dialog-title');
    dialog.setAttribute('aria-describedby', 'movie-dialog-description');
    dialog.innerHTML = `
        <div class="movie-dialog__layout">
            <div class="movie-dialog__art"><img class="movie-dialog__image" alt=""></div>
            <div class="movie-dialog__content">
                <button class="movie-dialog__close" type="button" aria-label="Close movie details" autofocus>×</button>
                <p class="movie-dialog__eyebrow"></p>
                <h2 class="movie-dialog__title" id="movie-dialog-title"></h2>
                <p class="movie-dialog__meta"></p>
                <p class="movie-dialog__description" id="movie-dialog-description"></p>
                <form class="movie-dialog__parameters" aria-label="Screening options"></form>
                <div class="movie-dialog__selection" aria-live="polite" aria-atomic="true">
                    <p class="movie-dialog__summary"></p>
                    <p class="movie-dialog__details"></p>
                    <div class="movie-dialog__total"><span>Price per person</span><output class="movie-dialog__price" aria-label="Price per person"></output></div>
                </div>
            </div>
        </div>`;
    document.body.append(dialog);

    const close = dialog.querySelector('.movie-dialog__close');
    const form = dialog.querySelector('form');
    let currentMovie;
    let opener;
    let startedOutside = false;

    function updateSelection() {
        const values = new FormData(form);
        const selected = currentMovie.parameters.map(parameter =>
            parameter.options.find(option => option.id === values.get(parameter.id))
        );
        const price = selected.reduce((total, option) => total + option.price, currentMovie.price);
        dialog.querySelector('.movie-dialog__price').textContent = money(price);
        dialog.querySelector('.movie-dialog__summary').textContent = selected.map(option => option.label).join(' · ');
        dialog.querySelector('.movie-dialog__details').textContent = selected.map(option => option.description).join('. ') + '.';
    }

    form.addEventListener('change', updateSelection);
    form.addEventListener('submit', event => event.preventDefault());
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        dialog.close();
    });

    dialog.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const stops = [close, ...form.querySelectorAll('input:checked')];
        const first = stops[0];
        const last = stops.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            focusWithoutScroll(last);
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            focusWithoutScroll(first);
        }
    });

    function isOutside(event) {
        const rect = dialog.getBoundingClientRect();
        return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    }

    dialog.addEventListener('pointerdown', event => { startedOutside = isOutside(event); });
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog && startedOutside && isOutside(event)) dialog.close();
        startedOutside = false;
    });
    dialog.addEventListener('close', () => {
        if (dialog.open) return;
        unlockScroll('movie-dialog');
        const replacement = [...document.querySelectorAll('[data-movie-id]')]
            .find(card => card.dataset.movieId === currentMovie.id && !card.closest('[inert]'))
            ?.querySelector('button');
        const fallback = document.querySelector('.catalog__tab--active, .slider__button--next');
        focusWithoutScroll(opener?.isConnected && opener.getClientRects().length && !opener.closest('[inert]') ? opener : replacement || fallback);
    });

    return function openMovie(movie, trigger) {
        if (dialog.open) return;
        currentMovie = movie;
        opener = trigger;
        startedOutside = false;
        const image = dialog.querySelector('img');
        image.src = imageUrl(movie);
        image.alt = movie.imageAlt;
        image.width = movie.imageWidth;
        image.height = movie.imageHeight;
        dialog.querySelector('.movie-dialog__eyebrow').textContent = movie.availability;
        dialog.querySelector('.movie-dialog__title').textContent = movie.title;
        dialog.querySelector('.movie-dialog__meta').textContent = `${movie.genre} · ${movie.duration} · ${movie.age}`;
        dialog.querySelector('.movie-dialog__description').textContent = movie.description;
        form.replaceChildren();

        movie.parameters.forEach((parameter) => {
            const fieldset = document.createElement('fieldset');
            const legend = document.createElement('legend');
            legend.textContent = parameter.label;
            fieldset.append(legend);
            const options = document.createElement('div');
            options.className = 'movie-options';
            parameter.options.forEach((option, index) => {
                const label = document.createElement('label');
                label.className = 'movie-option';
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = parameter.id;
                input.value = option.id;
                input.checked = index === 0;
                input.required = true;
                const text = document.createElement('span');
                text.className = 'movie-option__label';
                const name = document.createElement('span');
                name.textContent = option.label;
                const price = document.createElement('span');
                price.className = 'movie-option__price';
                price.textContent = option.price ? `+${money(option.price)}` : 'Included';
                text.append(name, price);
                label.append(input, text);
                options.append(label);
            });
            fieldset.append(options);
            form.append(fieldset);
        });

        updateSelection();
        lockScroll('movie-dialog');
        dialog.showModal();
        dialog.scrollTop = 0;
        focusWithoutScroll(close);
    };
}
