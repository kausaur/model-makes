/**
 * Model Makes - Theme Controller
 * Manages Dark / Light theme toggle with localStorage persistence and system preference detection.
 */

const STORAGE_KEY = 'theme';

/**
 * Gets the preferred initial theme based on saved preference or system mode.
 * @returns {'dark' | 'light'}
 */
export function getPreferredTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

/**
 * Applies the specified theme to the document element.
 * @param {'dark' | 'light'} theme
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    toggleBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
}

/**
 * Toggles between dark and light themes and persists preference.
 * @returns {'dark' | 'light'} The new theme applied.
 */
export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem(STORAGE_KEY, nextTheme);
  return nextTheme;
}

/**
 * Initializes the theme controller and binds click handler to #themeToggle.
 */
export function initTheme() {
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      toggleTheme();
    });
  }

  // Listen for OS system theme changes if no explicit preference saved
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'light' : 'dark');
      }
    });
  }
}
