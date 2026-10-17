/**
 * Model Makes - Cart Controller
 * Handles persistent shopping cart, drawer rendering, quantities, and WhatsApp checkout generation.
 */

const CART_KEY = 'mm-cart';
const WHATSAPP_NUMBER = '919999999999';

/**
 * Retrieves the current cart array from localStorage.
 * @returns {Array<{id: string, name: string, price: number, image: string, qty: number}>}
 */
export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
    return [];
  }
}

/**
 * Persists the cart array to localStorage and broadcasts the update.
 * @param {Array} cart
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
  dispatchCartUpdated();
}

/**
 * Dispatches a custom 'cart-updated' window event.
 */
export function dispatchCartUpdated() {
  const totals = getCartTotal();
  const event = new CustomEvent('cart-updated', {
    detail: {
      cart: getCart(),
      totalCount: totals.count,
      totalAmount: totals.amount
    }
  });
  window.dispatchEvent(event);
}

/**
 * Calculates total item count and currency amount in the cart.
 * @returns {{count: number, amount: number}}
 */
export function getCartTotal() {
  const cart = getCart();
  return cart.reduce(
    (acc, item) => {
      acc.count += item.qty;
      acc.amount += item.price * item.qty;
      return acc;
    },
    { count: 0, amount: 0 }
  );
}

/**
 * Adds a product to the cart or increments its quantity.
 * @param {Object} product - Product data object
 */
export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '',
      qty: 1
    });
  }

  saveCart(cart);
  showToast(`Added "${product.name}" to cart! 🛍️`);
}

/**
 * Removes an item from the cart by its ID.
 * @param {string} productId
 */
export function removeFromCart(productId) {
  let cart = getCart();
  const target = cart.find((i) => i.id === productId);
  cart = cart.filter((item) => item.id !== productId);
  saveCart(cart);

  if (target) {
    showToast(`Removed "${target.name}" from cart`);
  }
}

/**
 * Modifies an item's quantity by delta (+1 or -1). Removes if resulting quantity <= 0.
 * @param {string} productId
 * @param {number} delta
 */
export function updateQty(productId, delta) {
  let cart = getCart();
  const item = cart.find((i) => i.id === productId);

  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== productId);
  }

  saveCart(cart);
}

/**
 * Formats a number to Indian Rupee (INR) currency format.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Generates the WhatsApp checkout URL with a neatly formatted shopping list.
 * @returns {string}
 */
export function generateWhatsAppOrderUrl() {
  const cart = getCart();
  const { count, amount } = getCartTotal();

  if (cart.length === 0) return '#';

  let msg = `Hi Node 'n' Nozzle! ✨\nI'd like to place an order for the following model${count > 1 ? 's' : ''}:\n\n`;

  cart.forEach((item, index) => {
    msg += `${index + 1}. *${item.name}* × ${item.qty} (${formatCurrency(item.price * item.qty)})\n`;
  });

  msg += `\n*Total Amount:* ${formatCurrency(amount)}\n`;
  msg += `*Items:* ${count}\n\n`;
  msg += `Please confirm availability, production lead time, and payment details. Thank you!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/**
 * Renders the cart drawer items and summary.
 */
export function renderCartDrawer() {
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  const cartFooter = document.querySelector('.cart-footer');

  if (!cartItemsEl) return;

  const cart = getCart();
  const { amount } = getCartTotal();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <p class="empty-cart-text">Your cart is empty</p>
        <button class="btn btn-outline" id="cartBrowseBtn">Browse Collection</button>
      </div>
    `;

    if (cartTotalEl) cartTotalEl.textContent = formatCurrency(0);
    if (cartFooter) cartFooter.style.display = 'none';

    const browseBtn = document.getElementById('cartBrowseBtn');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        closeCart();
        const shopSec = document.getElementById('shop');
        if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
      });
    }
    return;
  }

  if (cartFooter) cartFooter.style.display = 'flex';

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="line-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="line-thumb" onerror="this.src='assets/images/logo-icon.svg'">
        <div class="line-info">
          <h4 class="line-title">${item.name}</h4>
          <span class="line-price">${formatCurrency(item.price)}</span>
        </div>
        <div class="line-actions">
          <div class="line-qty-ctrls">
            <button class="line-qty-btn dec-qty" data-id="${item.id}" aria-label="Decrease quantity">&minus;</button>
            <span class="line-qty-text">${item.qty}</span>
            <button class="line-qty-btn inc-qty" data-id="${item.id}" aria-label="Increase quantity">&plus;</button>
          </div>
          <button class="line-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `
    )
    .join('');

  if (cartTotalEl) {
    cartTotalEl.textContent = formatCurrency(amount);
  }

  if (checkoutBtn) {
    checkoutBtn.href = generateWhatsAppOrderUrl();
    checkoutBtn.setAttribute('target', '_blank');
    checkoutBtn.setAttribute('rel', 'noopener noreferrer');
  }

  // Bind line item events
  cartItemsEl.querySelectorAll('.inc-qty').forEach((btn) => {
    btn.addEventListener('click', () => updateQty(btn.dataset.id, 1));
  });

  cartItemsEl.querySelectorAll('.dec-qty').forEach((btn) => {
    btn.addEventListener('click', () => updateQty(btn.dataset.id, -1));
  });

  cartItemsEl.querySelectorAll('.line-remove').forEach((btn) => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

/**
 * Opens the sliding cart drawer.
 */
export function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    renderCartDrawer();
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Closes the cart drawer.
 */
export function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

/**
 * Displays a non-intrusive floating toast notification.
 * @param {string} message
 */
let toastTimeout;
export function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerHTML = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/**
 * Updates the cart badge count in the header.
 */
export function updateCartBadge() {
  const countBadge = document.getElementById('cartCount');
  if (!countBadge) return;

  const { count } = getCartTotal();
  countBadge.textContent = count;
  countBadge.style.display = count > 0 ? 'flex' : 'none';

  // Quick bump animation
  countBadge.classList.add('bump');
  setTimeout(() => countBadge.classList.remove('bump'), 200);
}

/**
 * Sets up listeners for cart drawer toggle and updates.
 */
export function initCart() {
  const cartBtn = document.getElementById('cartBtn');
  const closeBtn = document.getElementById('cartCloseBtn');
  const overlay = document.getElementById('cartOverlay');

  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCart);
  }

  if (overlay) {
    overlay.addEventListener('click', closeCart);
  }

  // Update badge and drawer when cart updates
  window.addEventListener('cart-updated', () => {
    updateCartBadge();
    const drawer = document.getElementById('cartDrawer');
    if (drawer && drawer.classList.contains('open')) {
      renderCartDrawer();
    }
  });

  // Initial badge update
  updateCartBadge();
}
