import { initMenu } from './menu.js';
import { createMovieDialog } from './modal.js';
import { initSlider } from './slider.js';
import { initCatalog } from './catalog.js';

const openMovie = createMovieDialog();
initMenu();
initSlider(openMovie);
initCatalog(openMovie);
