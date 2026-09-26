import { imageUrl, money } from './ui.js';

export function createMovieCard(movie, openMovie, featured = false) {
    const prefix = featured ? 'featured-card' : 'movie-card';
    const card = document.createElement('article');
    card.className = prefix;
    card.dataset.movieId = movie.id;
    card.innerHTML = `
        <div class="${prefix}__poster"><img loading="lazy" decoding="async" alt=""></div>
        <div class="${prefix}__content">
            <div class="${prefix}__top">
                <p class="${featured ? 'featured-card__meta' : 'movie-card__genre'}"></p>
                <span class="age-rating"><span class="visually-hidden">Age rating </span><span class="age-rating__value"></span></span>
            </div>
            <h3 class="${prefix}__title"><button class="movie-card__open" type="button" aria-haspopup="dialog"></button></h3>
            <p class="${prefix}__description"></p>
            <div class="${featured ? 'featured-card__footer' : 'movie-card__info'}">
                <span class="card-duration"></span><span class="card-price"></span>
            </div>
        </div>`;

    const image = card.querySelector('img');
    image.src = imageUrl(movie);
    image.alt = movie.imageAlt;
    image.width = movie.imageWidth;
    image.height = movie.imageHeight;
    card.querySelector(featured ? '.featured-card__meta' : '.movie-card__genre').textContent = movie.genre;
    card.querySelector('.age-rating__value').textContent = movie.age;
    const button = card.querySelector('.movie-card__open');
    button.textContent = movie.title;
    button.setAttribute('aria-label', `View ${movie.title} details`);
    card.querySelector(`.${prefix}__description`).textContent = movie.description;
    card.querySelector('.card-duration').textContent = movie.duration;
    card.querySelector('.card-price').textContent = `From ${money(movie.price)}`;

    card.addEventListener('click', () => openMovie(movie, button));
    return card;
}
