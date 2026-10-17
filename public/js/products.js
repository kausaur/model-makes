/**
 * Model Makes - Product Catalog & Gallery Controller
 * Loads products from JSON, handles filtering, dynamic card rendering, inline gallery carousels, and lightbox integration.
 */

import { addToCart, formatCurrency, getCart } from './cart.js';
import { openLightbox } from './lightbox.js';

let cachedProducts = [];

/**
 * Loads products from data/products.json
 * @returns {Promise<Array>}
 */
export async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.status} ${response.statusText}`);
    }
    cachedProducts = await response.json();
    return cachedProducts;
  } catch (error) {
    console.error('Error fetching products.json:', error);
    return [];
  }
}

/**
 * Renders product cards into #productGrid based on current filter.
 * @param {Array} products - List of product objects
 * @param {string} [filter='all'] - Category filter key
 */
export function renderProducts(products = cachedProducts, filter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const filtered = filter === 'all'
    ? products
    : products.filter((p) => p.category.toLowerCase() === filter.toLowerCase());

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
        <p style="font-size: 1.2rem;">No 3D models found in this category.</p>
        <button class="btn btn-outline" style="margin-top: 1rem;" onclick="document.querySelector('[data-filter=all]')?.click()">View All Models</button>
      </div>
    `;
    return;
  }

  const currentCart = getCart();

  grid.innerHTML = filtered
    .map((product) => {
      // Calculate discount percentage if MRP exists
      const hasDiscount = product.mrp && product.mrp > product.price;
      const discountPct = hasDiscount
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

      // Badges
      const isNew = product.tags && product.tags.includes('new');
      const isBestseller = product.tags && product.tags.includes('bestseller');

      // Gallery Images
      const images = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : ['assets/images/placeholder.svg'];

      const slidesHtml = images
        .map(
          (imgSrc, idx) => `
          <img 
            src="${imgSrc}" 
            alt="${product.name} - View ${idx + 1}" 
            loading="lazy" 
            class="gallery-img ${idx === 0 ? 'active' : ''}" 
            data-index="${idx}"
            onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'500\\' height=\\'500\\'><rect fill=\\'%231A1A2E\\' width=\\'500\\' height=\\'500\\'/><text x=\\'250\\' y=\\'260\\' font-size=\\'32\\' text-anchor=\\'middle\\' fill=\\'%2300D4FF\\'>3D Model View</text></svg>'"
          />
        `
        )
        .join('');

      const hasMultipleImages = images.length > 1;
      const dotsHtml = hasMultipleImages
        ? `<div class="gallery-dots">
            ${images.map((_, idx) => `<button class="gallery-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>`).join('')}
          </div>`
        : '';

      const arrowsHtml = hasMultipleImages
        ? `
          <button class="gallery-arrow prev" aria-label="Previous image">&#8249;</button>
          <button class="gallery-arrow next" aria-label="Next image">&#8250;</button>
        `
        : '';

      // Specs list
      const specsHtml = `
        <div class="card-specs">
          ${product.material ? `<span class="spec">${product.material}</span>` : ''}
          ${product.dimensions ? `<span class="spec">${product.dimensions}</span>` : ''}
          ${product.printTime ? `<span class="spec">${product.printTime}</span>` : ''}
        </div>
      `;

      // Check if already in cart for stepper display
      const cartItem = currentCart.find((item) => item.id === product.id);

      return `
        <article class="product-card" data-category="${product.category}" data-id="${product.id}">
          <div class="card-media">
            <div class="card-gallery">
              <div class="gallery-slides">
                ${slidesHtml}
              </div>
              ${dotsHtml}
              ${arrowsHtml}
            </div>
            <div class="card-tags">
              ${isNew ? '<span class="badge badge-new">New</span>' : ''}
              ${isBestseller ? '<span class="badge badge-bestseller">Bestseller</span>' : ''}
            </div>
            <button class="media-expand" aria-label="View media" title="View larger">&#x26F6;</button>
          </div>
          <div class="card-body">
            <h3 class="card-title">${product.name}</h3>
            <p class="card-desc">${product.description}</p>
            ${specsHtml}
            <div class="card-footer">
              <div class="card-price">
                <span class="price">${formatCurrency(product.price)}</span>
                ${hasDiscount ? `<span class="mrp"><s>${formatCurrency(product.mrp)}</s></span>` : ''}
                ${hasDiscount ? `<span class="discount">-${discountPct}%</span>` : ''}
              </div>
              <button class="btn btn-add" data-id="${product.id}">
                ${cartItem ? `In Cart (${cartItem.qty})` : 'Add to Cart'}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  attachCardEvents(filtered);
}

/**
 * Attaches event listeners to dynamically rendered product cards.
 * @param {Array} products
 */
function attachCardEvents(products) {
  const cards = document.querySelectorAll('.product-card');

  cards.forEach((card) => {
    const productId = card.dataset.id;
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    // Gallery carousel navigation
    const slides = card.querySelectorAll('.gallery-img');
    const dots = card.querySelectorAll('.gallery-dot');
    const prevBtn = card.querySelector('.gallery-arrow.prev');
    const nextBtn = card.querySelector('.gallery-arrow.next');
    let currentSlide = 0;

    function goToSlide(index) {
      if (slides.length <= 1) return;
      slides[currentSlide]?.classList.remove('active');
      dots[currentSlide]?.classList.remove('active');

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide]?.classList.add('active');
      dots[currentSlide]?.classList.add('active');
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        goToSlide(currentSlide + 1);
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetIdx = parseInt(dot.dataset.index, 10);
        goToSlide(targetIdx);
      });
    });

    // Lightbox expand button
    const expandBtn = card.querySelector('.media-expand');
    if (expandBtn) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mediaItems = (product.images || []).map((img, idx) => ({
          type: 'image',
          src: img,
          alt: `${product.name} (View ${idx + 1})`,
          caption: `${product.name} - ${product.material} // ${product.dimensions}`
        }));

        if (product.video) {
          mediaItems.push({
            type: 'video',
            src: product.video,
            alt: `${product.name} Video Preview`,
            caption: `${product.name} - 3D Printing Timelapse`
          });
        }

        openLightbox(mediaItems, currentSlide);
      });
    }

    // Add to Cart button
    const addBtn = card.querySelector('.btn-add');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        addToCart(product);
      });
    }
  });
}

/**
 * Initializes category filter tab click handlers.
 * @param {Array} products
 */
export function initFilters(products = cachedProducts) {
  const tabs = document.querySelectorAll('.filter-tabs .filter-btn');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter || 'all';
      renderProducts(products, filter);
    });
  });

  // Re-render button labels when cart updates
  window.addEventListener('cart-updated', () => {
    const activeTab = document.querySelector('.filter-tabs .filter-btn.active');
    const currentFilter = activeTab ? activeTab.dataset.filter : 'all';
    const currentCart = getCart();

    document.querySelectorAll('.product-card').forEach((card) => {
      const pid = card.dataset.id;
      const btn = card.querySelector('.btn-add');
      if (btn) {
        const item = currentCart.find((i) => i.id === pid);
        btn.textContent = item ? `In Cart (${item.qty})` : 'Add to Cart';
      }
    });
  });
}
