'use strict';

(() => {
    const storageKey = 'theme';
    const root = document.documentElement;
    const isValidTheme = (theme) => theme === 'light' || theme === 'dark';

    function readTheme() {
        try {
            const savedTheme = window.localStorage.getItem(storageKey);
            return isValidTheme(savedTheme) ? savedTheme : 'dark';
        } catch {
            return 'dark';
        }
    }

    function updateButtons() {
        const isLight = root.dataset.theme === 'light';
        document.querySelectorAll('.theme-toggle').forEach((button) => {
            button.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
            button.setAttribute('aria-pressed', String(isLight));
            button.querySelector('.theme-toggle__icon').textContent = isLight ? '☀' : '☾';
        });
    }

    root.dataset.theme = readTheme();

    document.addEventListener('DOMContentLoaded', () => {
        updateButtons();
        document.querySelectorAll('.theme-toggle').forEach((button) => {
            button.addEventListener('click', () => {
                const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
                root.dataset.theme = theme;
                updateButtons();
                try {
                    window.localStorage.setItem(storageKey, theme);
                } catch {
                    // Keep the theme on this page even when saving is unavailable.
                }
            });
        });
    });

    // Keep already-open pages consistent when the user changes theme in a tab.
    window.addEventListener('storage', (event) => {
        if (event.key !== storageKey && event.key !== null) return;
        root.dataset.theme = isValidTheme(event.newValue) ? event.newValue : 'dark';
        updateButtons();
    });
})();
