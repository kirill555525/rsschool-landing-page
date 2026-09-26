import { initMenu } from './menu.js';
import { createMovieDialog } from './modal.js';
import { initCatalog } from './catalog.js';

const openMovie = createMovieDialog();

initMenu();
initCatalog(openMovie);