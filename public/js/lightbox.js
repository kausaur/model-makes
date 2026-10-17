/**
 * Model Makes - Lightbox Controller
 * Fullscreen media viewer supporting images, videos, carousel navigation, and keyboard shortcuts.
 */

let mediaList = [];
let currentIndex = 0;
let isInitialized = false;

function ensureLightboxElements() {
  let lightbox = document.getElementById('lightbox');
  if (!lightbox) return null;

  let content = lightbox.querySelector('.lightbox-content');
  if (!content) {
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" id="lightboxClose" aria-label="Close Lightbox">&times;</button>
        <button class="lightbox-arrow prev" id="lightboxPrev" aria-label="Previous Media">&#8249;</button>
        <div class="lightbox-media-box" id="lightboxMediaBox"></div>
        <button class="lightbox-arrow next" id="lightboxNext" aria-label="Next Media">&#8250;</button>
        <div class="lightbox-caption" id="lightboxCaption"></div>
      </div>
    `;
  }
  return lightbox;
}

function renderActiveMedia() {
  const mediaBox = document.getElementById('lightboxMediaBox');
  const captionEl = document.getElementById('lightboxCaption');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (!mediaBox || mediaList.length === 0) return;

  const item = mediaList[currentIndex];
  mediaBox.innerHTML = '';

  if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.src;
    video.controls = true;
    video.autoplay = true;
    video.className = 'lightbox-media';
    video.setAttribute('playsinline', '');
    mediaBox.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt || "Node 'n' Nozzle Product Media";
    img.className = 'lightbox-media';
    mediaBox.appendChild(img);
  }

  if (captionEl) {
    captionEl.textContent = item.caption || item.alt || '';
  }

  // Show or hide navigation arrows if only 1 item
  const hasMultiple = mediaList.length > 1;
  if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
  if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
}

function nextMedia() {
  if (mediaList.length <= 1) return;
  currentIndex = (currentIndex + 1) % mediaList.length;
  renderActiveMedia();
}

function prevMedia() {
  if (mediaList.length <= 1) return;
  currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
  renderActiveMedia();
}

function handleKeyDown(e) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !lightbox.classList.contains('open')) return;

  if (e.key === 'Escape') {
    closeLightbox();
  } else if (e.key === 'ArrowRight') {
    nextMedia();
  } else if (e.key === 'ArrowLeft') {
    prevMedia();
  }
}

function initLightboxEvents() {
  if (isInitialized) return;
  const lightbox = ensureLightboxElements();
  if (!lightbox) return;

  lightbox.addEventListener('click', (e) => {
    // If user clicks the background backdrop or the close button
    if (e.target === lightbox || e.target.closest('#lightboxClose')) {
      closeLightbox();
    }
  });

  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevMedia();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextMedia();
    });
  }

  window.addEventListener('keydown', handleKeyDown);
  isInitialized = true;
}

/**
 * Opens the lightbox modal with given media item or array of items.
 * @param {Object|Array} media - An object {type, src, alt, caption} or Array of them
 * @param {number} [startIndex=0] - Initial index to display
 */
export function openLightbox(media, startIndex = 0) {
  initLightboxEvents();
  const lightbox = ensureLightboxElements();
  if (!lightbox) return;

  if (Array.isArray(media)) {
    mediaList = media;
    currentIndex = Math.max(0, Math.min(startIndex, media.length - 1));
  } else if (media && typeof media === 'object') {
    mediaList = [media];
    currentIndex = 0;
  } else {
    return;
  }

  renderActiveMedia();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Closes the lightbox and pauses any playing video.
 */
export function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  // Pause video if playing
  const video = lightbox.querySelector('video');
  if (video) {
    video.pause();
  }

  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}
