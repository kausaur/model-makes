/**
 * Model Makes - Main Application Entrypoint
 * Bootstraps theme, products catalog, shopping cart, mobile navigation, and interactions.
 */

import { initTheme } from './theme.js';
import { loadProducts, renderProducts, initFilters } from './products.js';
import { initCart, openCart, closeCart, updateCartBadge } from './cart.js';
import { closeLightbox } from './lightbox.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Theme Engine (Dark / Light mode)
  initTheme();

  // 2. Initialize Shopping Cart & Badges
  initCart();

  // 3. Load & Render Catalog
  try {
    const products = await loadProducts();
    renderProducts(products, 'all');
    initFilters(products);
  } catch (err) {
    console.error('Failed to initialize product catalog:', err);
  }

  // 4. Setup Mobile Navigation Menu
  initMobileNav();

  // 5. Setup Smooth Scrolling for In-Page Anchor Links
  initSmoothScroll();

  // 6. Setup Floating Quick Cart
  initFloatingCart();
});

/**
 * Initializes floating quick cart button.
 */
function initFloatingCart() {
  const floatingBtn = document.getElementById('floatingCartBtn');
  if (!floatingBtn) return;

  floatingBtn.addEventListener('click', openCart);

  // Show only after scrolling down
  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      floatingBtn.classList.add('visible');
    } else {
      floatingBtn.classList.remove('visible');
    }
  }, { passive: true });
}

/**
 * Initializes mobile hamburger toggle and menu overlay behavior.
 */
function initMobileNav() {
  const hamburger = document.getElementById('hamburgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  if (!hamburger || !mobileNav) return;

  function toggleMobileMenu() {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  // Close mobile nav when clicking any link inside it
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close if window resized past mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Smooth scrolling with sticky header offset for internal links.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
