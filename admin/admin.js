/**
 * MODEL MAKES - LOCAL ADMIN PANEL CONTROLLER
 * Comprehensive CRUD, Media Management, Import/Export, and Manifest engine.
 * Self-contained vanilla JS for local file:// or local dev server operation.
 */

// ==========================================================================
// 1. STATE & CONSTANTS
// ==========================================================================

const STORAGE_KEY = 'model_makes_products_data';

// Master in-memory product collection
let products = [];

// Form editing state
let currentEditingId = null;
let isSlugAutoLocked = true;
let currentFormImages = []; // Array of { path: string, previewUrl?: string, file?: File }
let selectedTags = new Set();

// Default seed catalog if neither server nor local storage has data
const DEFAULT_SAMPLE_CATALOG = [
  {
    "id": "dragon-figurine",
    "name": "Dragon Figurine",
    "category": "figurines",
    "description": "Majestic display dragon featuring high-relief textured scales and sweeping wings. Hand-finished and sealed with a protective satin coat, with a weighted base designed for secure desk or shelf display.",
    "price": 1200,
    "mrp": 1500,
    "currency": "INR",
    "images": [
      "assets/images/dragon-figurine-1.jpg"
    ],
    "video": "",
    "gif": "",
    "tags": ["bestseller", "new"],
    "finish": "Hand-Detailed Satin",
    "dimensions": "15 × 8 × 10 cm",
    "weight": "185g",
    "features": "Ready to Display",
    "inStock": true,
    "featured": true,
    "createdAt": "2026-10-17T18:30:00+05:30",
    "updatedAt": "2026-10-17T18:30:00+05:30"
  },
  {
    "id": "articulated-octopus",
    "name": "Articulated Octopus",
    "category": "figurines",
    "description": "Tactile, fully poseable octopus featuring 8 fluid multi-jointed tentacles that drape naturally. Finished in a dual-color silk sheen that glints dynamically under light.",
    "price": 800,
    "mrp": null,
    "currency": "INR",
    "images": [
      "assets/images/articulated-octopus-1.jpg"
    ],
    "video": "",
    "gif": "",
    "tags": ["bestseller"],
    "finish": "Silky Dual-Tone Sheen",
    "dimensions": "12 × 12 × 5 cm",
    "weight": "110g",
    "features": "Poseable Multi-Jointed",
    "inStock": true,
    "featured": false,
    "createdAt": "2026-10-17T18:35:00+05:30",
    "updatedAt": "2026-10-17T18:35:00+05:30"
  },
  {
    "id": "phone-stand",
    "name": "Ergonomic Phone Stand",
    "category": "gadgets",
    "description": "Dual-angle desktop phone stand optimized for video calls and hands-free media viewing. Features discreet cable cutout and anti-slip pads.",
    "price": 450,
    "mrp": 600,
    "currency": "INR",
    "images": [
      "assets/images/phone-stand-1.jpg"
    ],
    "video": "",
    "gif": "",
    "tags": ["bestseller"],
    "finish": "Matte Anti-Scratch",
    "dimensions": "9 × 7 × 10 cm",
    "weight": "95g",
    "features": "Cable Pass-Through",
    "inStock": true,
    "featured": true,
    "createdAt": "2026-10-17T18:40:00+05:30",
    "updatedAt": "2026-10-17T18:40:00+05:30"
  },
  {
    "id": "iron-man-helmet",
    "name": "Wearable Cyber Helmet",
    "category": "cosplay",
    "description": "Full-scale 1:1 wearable helmet with magnetic faceplate closure, tinted optical visor, and breathable interior foam padding. Finished in metallic crimson and brass gold.",
    "price": 3500,
    "mrp": 4500,
    "currency": "INR",
    "images": [
      "assets/images/iron-man-helmet-1.jpg"
    ],
    "video": "",
    "gif": "",
    "tags": ["custom", "bestseller"],
    "finish": "Metallic Lacquer & Gold",
    "dimensions": "30 × 22 × 26 cm",
    "weight": "680g",
    "features": "Padded Interior & Visor",
    "inStock": true,
    "featured": true,
    "createdAt": "2026-10-17T18:45:00+05:30",
    "updatedAt": "2026-10-17T18:45:00+05:30"
  }
];

// ==========================================================================
// 2. INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initDataLoad();
});

/**
 * Attempt to load data in order:
 * 1. Local dev server fetch ('../public/data/products.json')
 * 2. LocalStorage cache
 * 3. Fallback to default sample catalog
 */
async function initDataLoad() {
  let loaded = false;

  // 1. Try local server fetch (works if running via http://localhost or similar dev server)
  try {
    const res = await fetch('../public/data/products.json', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        products = data;
        saveToLocalStorage(false);
        showToast(`Loaded ${products.length} products from public/data/products.json`, 'info');
        loaded = true;
      }
    }
  } catch (err) {
    // Expected when running file:// protocol due to browser security
    console.info('Direct fetch unavailable or blocked by CORS (normal in file:// mode). Using local storage.');
  }

  // 2. If not fetched, check localStorage
  if (!loaded) {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          products = parsed;
          showToast(`Loaded ${products.length} cached products from local storage`, 'info');
          loaded = true;
        }
      } catch (e) {
        console.warn('Failed parsing local storage cache', e);
      }
    }
  }

  // 3. Fallback to sample data
  if (!loaded) {
    products = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_CATALOG));
    saveToLocalStorage(false);
    showToast('Loaded sample 3D-print catalog. You can edit, import, or export anytime.', 'info');
  }

  renderProductList();
  renderStats();
  renderMediaManifest();
  updateLiveJsonPreview();
}

// ==========================================================================
// 3. EVENT LISTENERS SETUP
// ==========================================================================

function initEventListeners() {
  // Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab-btn');
  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Notice Banner Dismiss
  const btnDismiss = document.getElementById('btn-dismiss-notice');
  if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
      document.getElementById('notice-banner').classList.add('hidden');
    });
  }

  // Search & Filter Inputs
  const searchInput = document.getElementById('input-search');
  if (searchInput) searchInput.addEventListener('input', () => renderProductList());

  const categoryFilter = document.getElementById('select-filter-category');
  if (categoryFilter) categoryFilter.addEventListener('change', () => renderProductList());

  const stockFilter = document.getElementById('select-filter-stock');
  if (stockFilter) stockFilter.addEventListener('change', () => renderProductList());

  const sortSelect = document.getElementById('select-sort');
  if (sortSelect) sortSelect.addEventListener('change', () => renderProductList());

  // Quick Action Header Buttons
  document.getElementById('btn-quick-import').addEventListener('click', () => {
    switchTab('data');
    document.getElementById('textarea-json-import').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('textarea-json-import').focus();
  });

  document.getElementById('btn-quick-export').addEventListener('click', exportJSON);

  // Add Product Button
  document.getElementById('btn-open-add-modal').addEventListener('click', () => openForm());
  document.getElementById('btn-empty-add').addEventListener('click', () => openForm());

  // Modal Cancel & Close
  document.getElementById('btn-modal-close').addEventListener('click', closeForm);
  document.getElementById('btn-modal-cancel').addEventListener('click', closeForm);
  document.getElementById('btn-modal-save').addEventListener('click', handleFormSubmit);

  // Auto-slugify on name change
  const formName = document.getElementById('form-name');
  const formSlug = document.getElementById('form-slug');
  const btnSlugLock = document.getElementById('btn-slug-lock');

  formName.addEventListener('input', () => {
    if (isSlugAutoLocked) {
      formSlug.value = generateSlug(formName.value);
    }
  });

  btnSlugLock.addEventListener('click', () => {
    isSlugAutoLocked = !isSlugAutoLocked;
    btnSlugLock.textContent = isSlugAutoLocked ? '🔒' : '🔓';
    btnSlugLock.title = isSlugAutoLocked ? 'Slug is auto-synced with name' : 'Slug is manual';
    formSlug.readOnly = isSlugAutoLocked;
  });

  // In-stock & Featured status labels update
  document.getElementById('form-instock').addEventListener('change', (e) => {
    document.getElementById('label-instock-status').textContent = e.target.checked ? 'In Stock' : 'Out of Stock';
  });
  document.getElementById('form-featured').addEventListener('change', (e) => {
    document.getElementById('label-featured-status').textContent = e.target.checked ? 'Featured ⭐' : 'Regular';
  });

  // Tag selector pills in Form
  const tagPills = document.querySelectorAll('.tag-select-pill');
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tag = pill.getAttribute('data-tag');
      if (selectedTags.has(tag)) {
        selectedTags.delete(tag);
        pill.classList.remove('active');
      } else {
        selectedTags.add(tag);
        pill.classList.add('active');
      }
    });
  });

  // Custom Tag Add button
  document.getElementById('btn-add-custom-tag').addEventListener('click', addCustomTag);
  document.getElementById('input-custom-tag').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  });

  // Image Selection (Multiple)
  const imageFilesInput = document.getElementById('input-image-files');
  imageFilesInput.addEventListener('change', handleImageFilesSelected);

  // Manual Image Path Adder
  document.getElementById('btn-add-manual-image').addEventListener('click', () => {
    const input = document.getElementById('input-manual-image-path');
    const path = input.value.trim();
    if (path) {
      currentFormImages.push({ path: path });
      input.value = '';
      renderFormImages();
    }
  });

  // GIF File selection
  document.getElementById('input-gif-file').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const slug = document.getElementById('form-slug').value || 'product';
      const cleanExt = file.name.split('.').pop() || 'gif';
      document.getElementById('form-gif').value = `assets/images/${slug}-spin.${cleanExt}`;
      showToast(`Assigned GIF path. Remember to copy "${file.name}" to public/assets/images/`, 'info');
    }
  });

  // Video File selection
  document.getElementById('input-video-file').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const slug = document.getElementById('form-slug').value || 'product';
      const cleanExt = file.name.split('.').pop() || 'mp4';
      document.getElementById('form-video').value = `assets/videos/${slug}-360.${cleanExt}`;
      showToast(`Assigned Video path. Remember to copy "${file.name}" to public/assets/videos/`, 'info');
    }
  });

  // Data Management: File Drag & Drop
  const dropZone = document.getElementById('json-drop-zone');
  const fileInput = document.getElementById('input-json-file');

  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleJsonFile(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleJsonFile(e.target.files[0]);
    }
  });

  // Data Management Buttons
  document.getElementById('btn-parse-json-import').addEventListener('click', handleJsonTextImport);
  document.getElementById('btn-try-fetch-server').addEventListener('click', handleFetchFromServer);
  document.getElementById('btn-download-json').addEventListener('click', exportJSON);
  document.getElementById('btn-copy-raw-json').addEventListener('click', handleCopyRawJson);
  document.getElementById('btn-load-sample-data').addEventListener('click', () => {
    showConfirm('Reset Catalog', 'Are you sure you want to reset the catalog to sample products? Any unsaved edits will be overwritten.', () => {
      products = JSON.parse(JSON.stringify(DEFAULT_SAMPLE_CATALOG));
      saveToLocalStorage();
      renderProductList();
      renderStats();
      renderMediaManifest();
      updateLiveJsonPreview();
      showToast('Catalog reset to sample 3D models', 'success');
    });
  });

  document.getElementById('btn-clear-all-data').addEventListener('click', () => {
    showConfirm('Clear All Products', 'Are you sure you want to delete ALL products from your local catalog? This cannot be undone.', () => {
      products = [];
      saveToLocalStorage();
      renderProductList();
      renderStats();
      renderMediaManifest();
      updateLiveJsonPreview();
      showToast('All products deleted', 'error');
    });
  });

  // Manifest Action Buttons
  document.getElementById('btn-copy-manifest-list').addEventListener('click', copyManifestPaths);
  document.getElementById('btn-copy-powershell-cmd').addEventListener('click', copyPowerShellScript);

  // Close modal on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeForm();
      closeConfirm();
    }
  });
}

// ==========================================================================
// 4. TAB NAVIGATION
// ==========================================================================

function switchTab(tabId) {
  const tabs = document.querySelectorAll('.nav-tab-btn');
  tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tabId));

  document.getElementById('view-products').style.display = tabId === 'products' ? 'block' : 'none';
  document.getElementById('view-manifest').style.display = tabId === 'manifest' ? 'block' : 'none';
  document.getElementById('view-data').style.display = tabId === 'data' ? 'block' : 'none';

  if (tabId === 'manifest') renderMediaManifest();
  if (tabId === 'data') updateLiveJsonPreview();
}

// ==========================================================================
// 5. CRUD OPERATIONS
// ==========================================================================

/**
 * Add a new product to the collection
 */
function addProduct(formData) {
  const now = new Date().toISOString();
  const newProduct = {
    ...formData,
    currency: 'INR',
    createdAt: now,
    updatedAt: now
  };

  products.unshift(newProduct);
  saveToLocalStorage();
  renderProductList();
  renderStats();
  renderMediaManifest();
  updateLiveJsonPreview();
  showToast(`Product "${newProduct.name}" created successfully!`, 'success');
}

/**
 * Edit an existing product in the collection
 */
function editProduct(id, formData) {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    showToast(`Error: Product with ID ${id} not found`, 'error');
    return;
  }

  const existing = products[index];
  const updatedProduct = {
    ...existing,
    ...formData,
    currency: 'INR',
    updatedAt: new Date().toISOString()
  };

  products[index] = updatedProduct;
  saveToLocalStorage();
  renderProductList();
  renderStats();
  renderMediaManifest();
  updateLiveJsonPreview();
  showToast(`Product "${updatedProduct.name}" updated!`, 'success');
}

/**
 * Delete a product with confirmation
 */
function deleteProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  showConfirm(
    'Delete Product',
    `Are you sure you want to delete "${product.name}" (${product.id})? This will remove it from the catalog.`,
    () => {
      products = products.filter(p => p.id !== id);
      saveToLocalStorage();
      renderProductList();
      renderStats();
      renderMediaManifest();
      updateLiveJsonPreview();
      showToast(`Deleted "${product.name}"`, 'error');
    }
  );
}

/**
 * Duplicate a product
 */
function duplicateProduct(id) {
  const original = products.find(p => p.id === id);
  if (!original) return;

  const newSlug = generateUniqueSlug(original.id + '-copy');
  const now = new Date().toISOString();
  const copy = {
    ...JSON.parse(JSON.stringify(original)),
    id: newSlug,
    name: `${original.name} (Copy)`,
    createdAt: now,
    updatedAt: now
  };

  products.unshift(copy);
  saveToLocalStorage();
  renderProductList();
  renderStats();
  renderMediaManifest();
  updateLiveJsonPreview();
  showToast(`Duplicated into "${copy.name}"`, 'info');
}

// ==========================================================================
// 6. FORM HANDLING & MODAL
// ==========================================================================

/**
 * Open Modal in either Add or Edit mode
 */
function openForm(product = null) {
  const modalBackdrop = document.getElementById('product-modal-backdrop');
  const modalTitleText = document.getElementById('modal-title-text');
  const modalTitleIcon = document.getElementById('modal-title-icon');
  const btnSlugLock = document.getElementById('btn-slug-lock');
  const formSlug = document.getElementById('form-slug');

  // Clear previous validation styling
  clearValidationErrors();

  if (product) {
    // Edit Mode
    currentEditingId = product.id;
    modalTitleText.textContent = `Edit Product: ${product.name}`;
    modalTitleIcon.textContent = '✏️';

    document.getElementById('form-name').value = product.name || '';
    formSlug.value = product.id || '';
    formSlug.readOnly = true;
    isSlugAutoLocked = false;
    btnSlugLock.textContent = '🔒';
    btnSlugLock.title = 'Slug is locked in edit mode to preserve links';

    document.getElementById('form-category').value = product.category || 'figurines';
    document.getElementById('form-description').value = product.description || '';
    document.getElementById('form-price').value = product.price !== undefined ? product.price : '';
    document.getElementById('form-mrp').value = product.mrp !== undefined && product.mrp !== null ? product.mrp : '';
    
    document.getElementById('form-instock').checked = product.inStock !== false;
    document.getElementById('label-instock-status').textContent = product.inStock !== false ? 'In Stock' : 'Out of Stock';

    document.getElementById('form-featured').checked = !!product.featured;
    document.getElementById('label-featured-status').textContent = product.featured ? 'Featured ⭐' : 'Regular';

    document.getElementById('form-finish').value = product.finish || product.material || '';
    document.getElementById('form-dimensions').value = product.dimensions || '';
    document.getElementById('form-weight').value = product.weight || '';
    document.getElementById('form-features').value = product.features || '';
    
    document.getElementById('form-gif').value = product.gif || '';
    document.getElementById('form-video').value = product.video || '';

    // Load Tags
    selectedTags.clear();
    (product.tags || []).forEach(t => selectedTags.add(t));
    syncTagsUI();

    // Load Images
    currentFormImages = (product.images || []).map(imgPath => ({
      path: imgPath,
      previewUrl: imgPath.startsWith('http') || imgPath.startsWith('data:') ? imgPath : `../public/${imgPath}`
    }));
    renderFormImages();

  } else {
    // Add Mode
    currentEditingId = null;
    modalTitleText.textContent = 'Add New Finished Model';
    modalTitleIcon.textContent = '➕';

    document.getElementById('form-name').value = '';
    formSlug.value = '';
    formSlug.readOnly = true;
    isSlugAutoLocked = true;
    btnSlugLock.textContent = '🔒';
    btnSlugLock.title = 'Slug is auto-synced with name';

    document.getElementById('form-category').value = 'figurines';
    document.getElementById('form-description').value = '';
    document.getElementById('form-price').value = '';
    document.getElementById('form-mrp').value = '';

    document.getElementById('form-instock').checked = true;
    document.getElementById('label-instock-status').textContent = 'In Stock';

    document.getElementById('form-featured').checked = false;
    document.getElementById('label-featured-status').textContent = 'Regular';

    document.getElementById('form-finish').value = 'Hand-Detailed Satin';
    document.getElementById('form-dimensions').value = '';
    document.getElementById('form-weight').value = '';
    document.getElementById('form-features').value = 'Ready to Display';

    document.getElementById('form-gif').value = '';
    document.getElementById('form-video').value = '';

    selectedTags.clear();
    syncTagsUI();

    currentFormImages = [];
    renderFormImages();
  }

  modalBackdrop.classList.add('active');
  document.getElementById('form-name').focus();
}

/**
 * Close modal dialog
 */
function closeForm() {
  document.getElementById('product-modal-backdrop').classList.remove('active');
  currentEditingId = null;
}

/**
 * Validate and submit the form
 */
function handleFormSubmit(e) {
  if (e) e.preventDefault();
  clearValidationErrors();

  const name = document.getElementById('form-name').value.trim();
  const slugInput = document.getElementById('form-slug').value.trim();
  const category = document.getElementById('form-category').value;
  const description = document.getElementById('form-description').value.trim();
  const priceVal = document.getElementById('form-price').value.trim();
  const mrpVal = document.getElementById('form-mrp').value.trim();
  const inStock = document.getElementById('form-instock').checked;
  const featured = document.getElementById('form-featured').checked;
  const finish = document.getElementById('form-finish').value.trim();
  const dimensions = document.getElementById('form-dimensions').value.trim();
  const weight = document.getElementById('form-weight').value.trim();
  const features = document.getElementById('form-features').value.trim();
  const gif = document.getElementById('form-gif').value.trim();
  const video = document.getElementById('form-video').value.trim();

  let hasError = false;

  // Validation: Name
  if (!name) {
    document.getElementById('form-name').classList.add('is-invalid');
    document.getElementById('error-name').style.display = 'block';
    hasError = true;
  }

  // Validation: Slug
  const finalSlug = slugInput || generateSlug(name);
  if (!finalSlug) {
    document.getElementById('form-slug').classList.add('is-invalid');
    document.getElementById('error-slug').textContent = 'Slug is required';
    document.getElementById('error-slug').style.display = 'block';
    hasError = true;
  } else {
    // Check slug collision
    const existing = products.find(p => p.id === finalSlug);
    if (existing && existing.id !== currentEditingId) {
      document.getElementById('form-slug').classList.add('is-invalid');
      document.getElementById('error-slug').textContent = 'A product with this Slug/ID already exists';
      document.getElementById('error-slug').style.display = 'block';
      hasError = true;
    }
  }

  // Validation: Price
  const priceNum = parseFloat(priceVal);
  if (!priceVal || isNaN(priceNum) || priceNum < 0) {
    document.getElementById('form-price').classList.add('is-invalid');
    document.getElementById('error-price').style.display = 'block';
    hasError = true;
  }

  if (hasError) {
    showToast('Please fix required fields highlighted in red', 'error');
    return;
  }

  // Extract images paths
  const images = currentFormImages.map(img => img.path);

  // If no image provided, assign default pattern for convenience
  if (images.length === 0) {
    images.push(`assets/images/${finalSlug}-1.svg`);
  }

  const formData = {
    id: finalSlug,
    name,
    category,
    description,
    price: Math.round(priceNum),
    mrp: mrpVal ? Math.round(parseFloat(mrpVal)) : null,
    finish: finish || 'Hand-Detailed Satin',
    dimensions: dimensions || '',
    weight: weight || '',
    features: features || 'Ready to Display',
    inStock,
    featured,
    tags: Array.from(selectedTags),
    images,
    gif: gif || '',
    video: video || ''
  };

  if (currentEditingId) {
    editProduct(currentEditingId, formData);
  } else {
    addProduct(formData);
  }

  closeForm();
}

function clearValidationErrors() {
  document.getElementById('form-name').classList.remove('is-invalid');
  document.getElementById('error-name').style.display = 'none';
  document.getElementById('form-slug').classList.remove('is-invalid');
  document.getElementById('error-slug').style.display = 'none';
  document.getElementById('form-price').classList.remove('is-invalid');
  document.getElementById('error-price').style.display = 'none';
}

// ==========================================================================
// 7. TAGS MANAGEMENT
// ==========================================================================

function syncTagsUI() {
  const pills = document.querySelectorAll('.tag-select-pill');
  pills.forEach(pill => {
    const tag = pill.getAttribute('data-tag');
    pill.classList.toggle('active', selectedTags.has(tag));
  });

  // Re-render any custom tags dynamically added
  const container = document.getElementById('tags-selector-container');
  const existingCustom = container.querySelectorAll('.tag-select-pill[data-custom="true"]');
  existingCustom.forEach(el => el.remove());

  const standard = ['new', 'bestseller', 'limited', 'custom'];
  const customWrapper = container.querySelector('.custom-tag-input-wrap');

  selectedTags.forEach(tag => {
    if (!standard.includes(tag)) {
      const pill = document.createElement('span');
      pill.className = 'tag-select-pill active';
      pill.setAttribute('data-tag', tag);
      pill.setAttribute('data-custom', 'true');
      pill.innerHTML = `🏷️ ${escapeHtml(tag)} <span style="margin-left:4px; font-weight:bold;">&times;</span>`;
      pill.addEventListener('click', () => {
        selectedTags.delete(tag);
        syncTagsUI();
      });
      container.insertBefore(pill, customWrapper);
    }
  });
}

function addCustomTag() {
  const input = document.getElementById('input-custom-tag');
  const val = input.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (val) {
    selectedTags.add(val);
    input.value = '';
    syncTagsUI();
  }
}

// ==========================================================================
// 8. MEDIA MANAGEMENT IN FORM
// ==========================================================================

function handleImageFilesSelected(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  const currentSlug = document.getElementById('form-slug').value || 'product';
  const startIndex = currentFormImages.length;

  files.forEach((file, idx) => {
    const fileIndex = startIndex + idx + 1;
    const generatedPath = `assets/images/${currentSlug}-${fileIndex}.webp`;

    const reader = new FileReader();
    reader.onload = (event) => {
      currentFormImages.push({
        path: generatedPath,
        previewUrl: event.target.result,
        file: file
      });
      renderFormImages();
    };
    reader.readAsDataURL(file);
  });

  showToast(`Added ${files.length} image(s). Paths auto-generated. Remember to copy files to public/assets/images/!`, 'info');
  e.target.value = ''; // Reset file input
}

function renderFormImages() {
  const grid = document.getElementById('images-preview-grid');
  const countBadge = document.getElementById('images-count-badge');
  grid.innerHTML = '';
  countBadge.textContent = `${currentFormImages.length} image${currentFormImages.length === 1 ? '' : 's'}`;

  if (currentFormImages.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; border: 1px dashed var(--border); border-radius: var(--radius-sm);">
        No images yet. Select files or add manual paths.
      </div>
    `;
    return;
  }

  currentFormImages.forEach((imgObj, idx) => {
    const card = document.createElement('div');
    card.className = 'image-preview-card';

    const isCover = idx === 0;
    const previewSrc = imgObj.previewUrl || (imgObj.path.startsWith('http') ? imgObj.path : `../public/${imgObj.path}`);

    card.innerHTML = `
      ${isCover ? '<div class="cover-badge">Cover</div>' : ''}
      <img src="${escapeHtml(previewSrc)}" class="image-preview-thumb" alt="Preview ${idx + 1}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'95\\' height=\\'95\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%236B6B80\\' stroke-width=\\'1.5\\'%3E%3Crect width=\\'18\\' height=\\'18\\' x=\\'3\\' y=\\'3\\' rx=\\'2\\'/ %3E%3Ccircle cx=\\'9\\' cy=\\'9\\' r=\\'2\\'/ %3E%3Cpath d=\\'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\\'/ %3E%3C/svg%3E';">
      <div class="image-preview-meta">
        <div class="image-preview-path" title="${escapeHtml(imgObj.path)}">${escapeHtml(imgObj.path)}</div>
      </div>
      <div class="image-card-actions">
        <button type="button" class="btn-media-tool" data-action="left" title="Move earlier" ${idx === 0 ? 'disabled' : ''}>◀</button>
        <button type="button" class="btn-media-tool" data-action="cover" title="Make Cover" ${isCover ? 'disabled' : ''}>⭐</button>
        <button type="button" class="btn-media-tool" data-action="right" title="Move later" ${idx === currentFormImages.length - 1 ? 'disabled' : ''}>▶</button>
        <button type="button" class="btn-media-tool danger" data-action="delete" title="Remove">&times;</button>
      </div>
    `;

    // Action handlers for reordering and deletion
    card.querySelector('[data-action="left"]')?.addEventListener('click', () => {
      if (idx > 0) {
        const temp = currentFormImages[idx];
        currentFormImages[idx] = currentFormImages[idx - 1];
        currentFormImages[idx - 1] = temp;
        renderFormImages();
      }
    });

    card.querySelector('[data-action="right"]')?.addEventListener('click', () => {
      if (idx < currentFormImages.length - 1) {
        const temp = currentFormImages[idx];
        currentFormImages[idx] = currentFormImages[idx + 1];
        currentFormImages[idx + 1] = temp;
        renderFormImages();
      }
    });

    card.querySelector('[data-action="cover"]')?.addEventListener('click', () => {
      const selected = currentFormImages.splice(idx, 1)[0];
      currentFormImages.unshift(selected);
      renderFormImages();
    });

    card.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      currentFormImages.splice(idx, 1);
      renderFormImages();
    });

    grid.appendChild(card);
  });
}

// ==========================================================================
// 9. LIST RENDERING & FILTERS
// ==========================================================================

function renderProductList() {
  const tbody = document.getElementById('products-table-body');
  const emptyState = document.getElementById('table-empty-state');
  const table = document.getElementById('products-table');

  const searchTerm = (document.getElementById('input-search')?.value || '').toLowerCase().trim();
  const categoryFilter = document.getElementById('select-filter-category')?.value || 'all';
  const stockFilter = document.getElementById('select-filter-stock')?.value || 'all';
  const sortBy = document.getElementById('select-sort')?.value || 'newest';

  // Filter
  let filtered = products.filter(p => {
    // Search match (name, id, tags, finish)
    if (searchTerm) {
      const nameMatch = (p.name || '').toLowerCase().includes(searchTerm);
      const idMatch = (p.id || '').toLowerCase().includes(searchTerm);
      const tagMatch = (p.tags || []).some(t => t.toLowerCase().includes(searchTerm));
      const finishMatch = (p.finish || '').toLowerCase().includes(searchTerm);
      if (!nameMatch && !idMatch && !tagMatch && !finishMatch) return false;
    }

    // Category match
    if (categoryFilter !== 'all' && p.category !== categoryFilter) {
      return false;
    }

    // Stock match
    if (stockFilter === 'inStock' && p.inStock === false) return false;
    if (stockFilter === 'outOfStock' && p.inStock !== false) return false;

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'updated':
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      default:
        return 0;
    }
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    table.style.display = 'none';
    emptyState.style.display = 'flex';
  } else {
    table.style.display = 'table';
    emptyState.style.display = 'none';

    filtered.forEach(p => {
      const tr = document.createElement('tr');

      // Thumbnail handling
      const firstImage = (p.images && p.images.length > 0) ? p.images[0] : '';
      const imgSrc = firstImage.startsWith('http') || firstImage.startsWith('data:') 
        ? firstImage 
        : `../public/${firstImage}`;

      // Price Formatting
      const formattedPrice = formatCurrency(p.price);
      const formattedMrp = p.mrp ? formatCurrency(p.mrp) : '';

      // Tags rendering
      const tagsHtml = (p.tags || []).map(t => {
        let tagClass = 'tag-pill';
        if (t === 'bestseller') tagClass += ' tag-bestseller';
        if (t === 'new') tagClass += ' tag-new';
        return `<span class="${tagClass}">${escapeHtml(t)}</span>`;
      }).join('');

      tr.innerHTML = `
        <td>
          <div class="product-thumb-wrap">
            <img src="${escapeHtml(imgSrc)}" class="product-thumb-img" alt="${escapeHtml(p.name)}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'54\\' height=\\'54\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%236B6B80\\' stroke-width=\\'1.5\\'%3E%3Cpath d=\\'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\\'/ %3E%3C/svg%3E';">
          </div>
        </td>
        <td>
          <div class="product-meta">
            <div class="product-title">
              <span>${escapeHtml(p.name)}</span>
              ${p.featured ? '<span class="badge-featured" title="Featured Showcase">⭐</span>' : ''}
            </div>
            <div class="product-slug">${escapeHtml(p.id)}</div>
          </div>
        </td>
        <td>
          <span class="badge badge-category" data-cat="${escapeHtml(p.category)}">${escapeHtml(formatCategoryName(p.category))}</span>
        </td>
        <td>
          <div class="price-display">
            <span class="price-current">${formattedPrice}</span>
            ${formattedMrp ? `<span class="price-mrp">${formattedMrp}</span>` : ''}
          </div>
        </td>
        <td style="color: var(--text-secondary); font-size: 0.8rem;">
          <div>${escapeHtml(p.finish || 'Hand-Finished')}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(p.dimensions || '—')}</div>
        </td>
        <td>
          <span class="badge-stock ${p.inStock !== false ? 'in-stock' : 'out-stock'}">
            ${p.inStock !== false ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td>
          <div class="tags-cell">
            ${tagsHtml || '<span style="color:var(--text-muted); font-size:0.75rem;">—</span>'}
          </div>
        </td>
        <td>
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="btn-action" data-action="edit" title="Edit Product">✏️ Edit</button>
            <button class="btn-action" data-action="dup" title="Duplicate">📑</button>
            <button class="btn-action action-delete" data-action="delete" title="Delete">🗑️</button>
          </div>
        </td>
      `;

      // Row Button Listeners
      tr.querySelector('[data-action="edit"]').addEventListener('click', () => openForm(p));
      tr.querySelector('[data-action="dup"]').addEventListener('click', () => duplicateProduct(p.id));
      tr.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProduct(p.id));

      tbody.appendChild(tr);
    });
  }

  // Update header badge
  document.getElementById('product-count-badge').textContent = `${products.length} Products`;
}

// ==========================================================================
// 10. STATS ROW
// ==========================================================================

function renderStats() {
  const total = products.length;
  const inStock = products.filter(p => p.inStock !== false).length;
  const featured = products.filter(p => !!p.featured).length;

  // Total referenced assets
  const assetsSet = new Set();
  products.forEach(p => {
    (p.images || []).forEach(img => assetsSet.add(img));
    if (p.gif) assetsSet.add(p.gif);
    if (p.video) assetsSet.add(p.video);
  });

  document.getElementById('stat-total-products').textContent = total;
  document.getElementById('stat-instock-products').textContent = inStock;
  document.getElementById('stat-featured-products').textContent = featured;
  document.getElementById('stat-media-assets').textContent = assetsSet.size;
}

// ==========================================================================
// 11. MEDIA MANIFEST
// ==========================================================================

function renderMediaManifest() {
  const grid = document.getElementById('manifest-grid');
  const summary = document.getElementById('manifest-summary-stats');
  if (!grid) return;

  grid.innerHTML = '';

  // Aggregate media paths
  const manifestMap = new Map(); // path -> { type, usedIn: [] }

  products.forEach(p => {
    (p.images || []).forEach(img => {
      if (!img) return;
      if (!manifestMap.has(img)) manifestMap.set(img, { type: 'image', usedIn: [] });
      manifestMap.get(img).usedIn.push(p.name);
    });

    if (p.gif) {
      if (!manifestMap.has(p.gif)) manifestMap.set(p.gif, { type: 'gif', usedIn: [] });
      manifestMap.get(p.gif).usedIn.push(p.name);
    }

    if (p.video) {
      if (!manifestMap.has(p.video)) manifestMap.set(p.video, { type: 'video', usedIn: [] });
      manifestMap.get(p.video).usedIn.push(p.name);
    }
  });

  let imageCount = 0;
  let gifCount = 0;
  let videoCount = 0;

  manifestMap.forEach(info => {
    if (info.type === 'image') imageCount++;
    if (info.type === 'gif') gifCount++;
    if (info.type === 'video') videoCount++;
  });

  summary.innerHTML = `
    Found <strong>${manifestMap.size} unique media files</strong> referenced across ${products.length} products:
    <span style="color:var(--accent);">🖼️ ${imageCount} Images</span> &bull; 
    <span style="color:#FBBF24;">🎞️ ${gifCount} Turntable GIFs</span> &bull; 
    <span style="color:#C084FC;">🎥 ${videoCount} 360° Videos</span>
  `;

  if (manifestMap.size === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-secondary); border-radius: var(--radius-md); border: 1px solid var(--border);">
        No media assets referenced in the current catalog.
      </div>
    `;
    return;
  }

  // Render cards sorted by path
  const sortedPaths = Array.from(manifestMap.keys()).sort();

  sortedPaths.forEach(path => {
    const item = manifestMap.get(path);
    const card = document.createElement('div');
    card.className = 'manifest-item-card';

    let icon = '🖼️';
    if (item.type === 'gif') icon = '🎞️';
    if (item.type === 'video') icon = '🎥';

    card.innerHTML = `
      <div class="manifest-item-info">
        <div class="manifest-type-icon">${icon}</div>
        <div class="manifest-file-details">
          <div class="manifest-file-path" title="${escapeHtml(path)}">${escapeHtml(path)}</div>
          <div class="manifest-product-name">Used in: ${escapeHtml(item.usedIn.join(', '))}</div>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm" title="Copy relative path to clipboard">Copy</button>
    `;

    card.querySelector('button').addEventListener('click', () => {
      copyToClipboard(path, `Copied "${path}" to clipboard`);
    });

    grid.appendChild(card);
  });
}

function copyManifestPaths() {
  const paths = [];
  products.forEach(p => {
    (p.images || []).forEach(img => { if (img && !paths.includes(img)) paths.push(img); });
    if (p.gif && !paths.includes(p.gif)) paths.push(p.gif);
    if (p.video && !paths.includes(p.video)) paths.push(p.video);
  });

  if (paths.length === 0) {
    showToast('No media paths to copy', 'info');
    return;
  }

  copyToClipboard(paths.sort().join('\n'), `Copied ${paths.length} file paths to clipboard`);
}

function copyPowerShellScript() {
  const images = [];
  const videos = [];

  products.forEach(p => {
    (p.images || []).forEach(img => { if (img && !images.includes(img)) images.push(img); });
    if (p.gif && !images.includes(p.gif)) images.push(p.gif);
    if (p.video && !videos.includes(p.video)) videos.push(p.video);
  });

  const psScript = `# PowerShell helper: Create required asset folders for Node 'n' Nozzle
New-Item -ItemType Directory -Force -Path "public/assets/images", "public/assets/videos"

Write-Host "Target asset folders verified." -ForegroundColor Cyan
# Total referenced images: ${images.length}
# Total referenced videos: ${videos.length}
`;

  copyToClipboard(psScript, 'PowerShell helper script copied to clipboard!');
}

// ==========================================================================
// 12. IMPORT & EXPORT
// ==========================================================================

/**
 * Parse and load products from JSON string
 */
function loadFromJSON(jsonString, isMerge = false) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('JSON root must be an array of product objects');
    }

    // Validate and normalize product items
    const validated = parsed.map((item, idx) => {
      if (!item.name) throw new Error(`Product at index ${idx} is missing required field: name`);
      const id = item.id || generateSlug(item.name);
      return {
        id,
        name: item.name,
        category: item.category || 'figurines',
        description: item.description || '',
        price: Number(item.price) || 0,
        mrp: item.mrp ? Number(item.mrp) : null,
        currency: item.currency || 'INR',
        images: Array.isArray(item.images) ? item.images : [],
        video: item.video || '',
        gif: item.gif || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        finish: item.finish || item.material || 'Hand-Detailed Satin',
        dimensions: item.dimensions || '',
        weight: item.weight || '',
        features: item.features || 'Ready to Display',
        inStock: item.inStock !== false,
        featured: !!item.featured,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString()
      };
    });

    if (isMerge) {
      // Merge by ID: existing gets updated, new gets appended
      validated.forEach(item => {
        const existingIdx = products.findIndex(p => p.id === item.id);
        if (existingIdx !== -1) {
          products[existingIdx] = item;
        } else {
          products.push(item);
        }
      });
      showToast(`Merged ${validated.length} products into existing catalog`, 'success');
    } else {
      products = validated;
      showToast(`Successfully imported ${validated.length} products!`, 'success');
    }

    saveToLocalStorage();
    renderProductList();
    renderStats();
    renderMediaManifest();
    updateLiveJsonPreview();
    return true;

  } catch (err) {
    showToast(`Import Error: ${err.message}`, 'error');
    console.error('Import Error', err);
    return false;
  }
}

/**
 * Handle File Upload for products.json
 */
function handleJsonFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    document.getElementById('textarea-json-import').value = content;
    const isMerge = document.getElementById('check-import-merge').checked;
    loadFromJSON(content, isMerge);
  };
  reader.onerror = () => showToast('Failed to read file', 'error');
  reader.readAsText(file);
}

/**
 * Handle Paste Text Import
 */
function handleJsonTextImport() {
  const textarea = document.getElementById('textarea-json-import');
  const text = textarea.value.trim();
  if (!text) {
    showToast('Please paste valid JSON array first', 'error');
    return;
  }
  const isMerge = document.getElementById('check-import-merge').checked;
  loadFromJSON(text, isMerge);
}

/**
 * Attempt to fetch from local server
 */
async function handleFetchFromServer() {
  try {
    const res = await fetch('../public/data/products.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const text = await res.text();
    document.getElementById('textarea-json-import').value = text;
    const isMerge = document.getElementById('check-import-merge').checked;
    loadFromJSON(text, isMerge);
  } catch (err) {
    showToast(`Fetch failed: ${err.message}. If running via file://, please upload/paste the file instead.`, 'error');
  }
}

/**
 * Export current products as downloadable products.json file
 */
function exportJSON() {
  const jsonString = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'products.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('Downloaded products.json! Copy it into public/data/products.json', 'success');
}

/**
 * Copy raw JSON to clipboard
 */
function handleCopyRawJson() {
  const jsonString = JSON.stringify(products, null, 2);
  copyToClipboard(jsonString, 'Raw products.json copied to clipboard');
}

/**
 * Update JSON live output preview
 */
function updateLiveJsonPreview() {
  const preview = document.getElementById('textarea-json-preview');
  const sizeInd = document.getElementById('json-size-indicator');
  if (!preview) return;

  const jsonString = JSON.stringify(products, null, 2);
  preview.value = jsonString;

  const bytes = new Blob([jsonString]).size;
  if (bytes > 1024) {
    sizeInd.textContent = `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    sizeInd.textContent = `${bytes} bytes`;
  }
}

// ==========================================================================
// 13. STORAGE & CONFIRMATION HELPERS
// ==========================================================================

function saveToLocalStorage(showIndicator = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    const dot = document.getElementById('sync-dot');
    if (dot) {
      dot.className = 'status-dot synced';
      dot.title = 'Saved to browser local storage';
    }
  } catch (err) {
    console.warn('LocalStorage error', err);
  }
}

/**
 * Modal Confirmation Dialog
 */
function showConfirm(title, message, onProceed) {
  const modal = document.getElementById('confirm-modal-backdrop');
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;

  const btnProceed = document.getElementById('btn-confirm-proceed');
  const btnCancel = document.getElementById('btn-confirm-cancel');
  const btnClose = document.getElementById('btn-confirm-close');

  const cleanup = () => {
    modal.classList.remove('active');
    btnProceed.onclick = null;
    btnCancel.onclick = null;
    btnClose.onclick = null;
  };

  btnProceed.onclick = () => {
    cleanup();
    if (typeof onProceed === 'function') onProceed();
  };

  btnCancel.onclick = cleanup;
  btnClose.onclick = cleanup;

  modal.classList.add('active');
}

function closeConfirm() {
  document.getElementById('confirm-modal-backdrop').classList.remove('active');
}

/**
 * Toast Notification Dispatcher
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==========================================================================
// 14. UTILITY FUNCTIONS
// ==========================================================================

/**
 * Clean slugify string: lowercase, alphanum and hyphens only
 */
function generateSlug(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
}

function generateUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (products.some(p => p.id === slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

/**
 * Format number into INR currency string e.g. ₹1,200
 */
function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/**
 * Format category identifier into human readable label
 */
function formatCategoryName(cat) {
  const map = {
    'figurines': 'Figurines',
    'gadgets': 'Gadgets',
    'home-decor': 'Home Decor',
    'cosplay': 'Cosplay'
  };
  return map[cat] || cat;
}

/**
 * Copy text to clipboard with fallback
 */
function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMsg, 'success'))
      .catch(() => fallbackCopy(text, successMsg));
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg, 'success');
  } catch (err) {
    showToast('Failed to copy text', 'error');
  }
  document.body.removeChild(textArea);
}

/**
 * Escape HTML to prevent XSS in rendering
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
