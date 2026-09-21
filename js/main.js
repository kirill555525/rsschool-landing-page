'use strict';

const themeButtons = document.querySelectorAll('.theme-toggle');

const savedTheme = localStorage.getItem('theme');

if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
}

function getCurrentTheme() {
    return document.documentElement.dataset.theme || 'dark';
}

function updateThemeButtons() {
    const currentTheme = getCurrentTheme();

    themeButtons.forEach((button) => {
        const icon = button.querySelector('.theme-toggle__icon');

        if (currentTheme === 'light') {
            icon.textContent = '☀';
            button.setAttribute('aria-label', 'Switch to dark theme');
        } else {
            icon.textContent = '☾';
            button.setAttribute('aria-label', 'Switch to light theme');
        }
    });
}

function toggleTheme() {
    const currentTheme = getCurrentTheme();

    const newTheme =
        currentTheme === 'dark'
            ? 'light'
            : 'dark';

    document.documentElement.dataset.theme = newTheme;

    localStorage.setItem('theme', newTheme);

    updateThemeButtons();
}

themeButtons.forEach((button) => {
    button.addEventListener('click', toggleTheme);
});

updateThemeButtons();