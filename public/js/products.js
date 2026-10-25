/**
 * Model Makes - Product Catalog & Gallery Controller
 * Loads products from JSON, handles filtering, dynamic card rendering, inline gallery carousels, and lightbox integration.
 */

import { addToCart, updateQty, formatCurrency, getCart } from './cart.js';
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
        <p style="font-size: 1.2rem;">No models found in this category.</p>
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

      // Product details (finish, size, weight)
      const specsHtml = `
        <div class="card-specs">
          ${product.finish ? `<span class="spec" title="Finish">${product.finish}</span>` : ''}
          ${product.dimensions ? `<span class="spec" title="Dimensions">${product.dimensions}</span>` : ''}
          ${product.weight ? `<span class="spec" title="Weight">${product.weight}</span>` : ''}
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
              <span class="badge badge-bulk" title="10+ items get 10% off, 20+ get 20% off">Bulk 10-20% Off</span>
            </div>
            <button class="media-expand" aria-label="View media" title="Zoom In">&#x26F6;</button>
          </div>
          <div class="card-body">
            <div class="card-rating">
              <span class="rating-stars">★★★★★</span>
              <span class="rating-val">4.9</span>
              <span class="rating-badge">Verified</span>
            </div>
            <h3 class="card-title">${product.name}</h3>
            <p class="card-desc">${product.description}</p>
            ${specsHtml}
            <div class="card-footer">
              <div class="card-price">
                <span class="price">${formatCurrency(product.price)}</span>
                ${hasDiscount ? `<span class="mrp"><s>${formatCurrency(product.mrp)}</s></span>` : ''}
                ${hasDiscount ? `<span class="discount">-${discountPct}%</span>` : ''}
              </div>
              <div class="card-action-wrap" data-id="${product.id}">
                ${cartItem ? `
                  <div class="card-stepper" data-id="${product.id}">
                    <button class="stepper-btn card-dec" data-id="${product.id}" aria-label="Decrease quantity">&minus;</button>
                    <span class="stepper-val">${cartItem.qty}</span>
                    <button class="stepper-btn card-inc" data-id="${product.id}" aria-label="Increase quantity">&plus;</button>
                  </div>
                ` : `
                  <button class="btn btn-add" data-id="${product.id}">
                    <svg class="btn-cart-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Add
                  </button>
                `}
              </div>
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
          caption: `${product.name}${product.finish ? ' - ' + product.finish : ''}${product.dimensions ? ' // ' + product.dimensions : ''}`
        }));

        if (product.video) {
          mediaItems.push({
            type: 'video',
            src: product.video,
            alt: `${product.name} Video Preview`,
            caption: `${product.name} - 360° Video Showcase`
          });
        }

        openLightbox(mediaItems, currentSlide);
      });
    }
  });

  bindCardActionButtons(products);
}

/**
 * Binds Add to Cart and Stepper (+/-) buttons.
 * @param {Array} products
 */
function bindCardActionButtons(products) {
  document.querySelectorAll('.btn-add').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const pid = btn.dataset.id;
      const product = products.find((p) => p.id === pid);
      if (product) addToCart(product);
    };
  });

  document.querySelectorAll('.card-inc').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      updateQty(btn.dataset.id, 1);
    };
  });

  document.querySelectorAll('.card-dec').forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      updateQty(btn.dataset.id, -1);
    };
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

  // Re-render button actions when cart updates
  window.addEventListener('cart-updated', () => {
    const currentCart = getCart();

    document.querySelectorAll('.card-action-wrap').forEach((wrap) => {
      const pid = wrap.dataset.id;
      const cartItem = currentCart.find((i) => i.id === pid);

      if (cartItem) {
        wrap.innerHTML = `
          <div class="card-stepper" data-id="${pid}">
            <button class="stepper-btn card-dec" data-id="${pid}" aria-label="Decrease quantity">&minus;</button>
            <span class="stepper-val">${cartItem.qty}</span>
            <button class="stepper-btn card-inc" data-id="${pid}" aria-label="Increase quantity">&plus;</button>
          </div>
        `;
      } else {
        wrap.innerHTML = `
          <button class="btn btn-add" data-id="${pid}">
            <svg class="btn-cart-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add
          </button>
        `;
      }
    });

    bindCardActionButtons(products);
  });
}
