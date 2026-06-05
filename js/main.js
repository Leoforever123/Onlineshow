/* ============================================================
   Main application bootstrap
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('landing')) {
    initLanding();
  }

  if (document.getElementById('book')) {
    buildFlipBook();
    initPageFlip();
  }

  if (document.getElementById('galleryWall')) {
    buildGallery();
    initCollageLayout();
    initLightbox();
    initGalleryObserver();
    initGalleryPan();
  }
});

/* ============================================================
   LANDING PAGE — full-screen intro, dismiss on any key or click
   ============================================================ */
function initLanding() {
  let dismissed = false;
  let canDismiss = false;
  const el = document.getElementById('landing');

  if (window.location.hash === '#flipbook-section') {
    el.remove();
    return;
  }

  /* Brief delay prevents accidental trigger on page load */
  setTimeout(() => { canDismiss = true; }, 350);

  function dismiss() {
    if (dismissed || !canDismiss) return;
    dismissed = true;
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 950);
  }

  document.addEventListener('keydown', dismiss);
  document.getElementById('landing').addEventListener('click', dismiss);
}

/* ============================================================
   FLIP BOOK — page element factories
   ============================================================ */

/**
 * Split "标题：正文" into [title, body].
 * Returns ["", caption] if there is no colon separator.
 */
function splitCaption(caption) {
  const idx = caption.indexOf('：');
  if (idx === -1) return ['', caption];
  return [caption.slice(0, idx), caption.slice(idx + 1)];
}

function createSectionPage(section) {
  const numCN = { commercial: '一', human: '二', horses: '三' };
  const cn = numCN[section.id];

  const el = document.createElement('div');
  el.className = 'page page-section';
  el.innerHTML = `
    <div class="section-inner">
      <div class="section-bg-num">${cn}</div>
      <div class="section-content">
        <span class="section-tag">第 ${cn} 章</span>
        <h2 class="section-title">${section.title}</h2>
        <p class="section-subtitle">${section.subtitle}</p>
        <div class="section-divider-line"></div>
        <p class="section-desc">${section.description}</p>
      </div>
    </div>`;
  return el;
}

function createPhotoPage(section, photo, idx) {
  const [title, body] = splitCaption(photo.caption);
  const src = `${section.dir}/${photo.file}`;

  const el = document.createElement('div');
  el.className = 'page page-photo';
  el.innerHTML = `
    <div class="photo-inner">
      <img class="photo-img" src="${src}" alt="${title}" loading="lazy">
      <div class="photo-caption">
        ${title ? `<span class="caption-title">${title}</span>` : ''}
        <span class="caption-body">${body}</span>
      </div>
      <span class="photo-index">${idx + 1} / 10</span>
    </div>`;
  return el;
}

/**
 * Visual "breath" page inserted after the last photo of each section
 * (except the final section), ensuring the next section title always
 * opens cleanly on the left side of a new spread.
 */
function createTransitionPage() {
  const el = document.createElement('div');
  el.className = 'page page-transition';
  el.innerHTML = `<div class="transition-inner"><span class="transition-mark">· · ·</span></div>`;
  return el;
}

function createBackCoverPage() {
  const el = document.createElement('div');
  el.className = 'page page-cover page-back-cover';
  el.innerHTML = `
    <div class="back-cover-inner">
      <div class="cover-deco"></div>
      <p class="back-cover-text">影集已阅</p>
      <div class="cover-deco"></div>
      <button class="enter-gallery-btn" onclick="goToGallery()">进入影片墙</button>
    </div>`;
  return el;
}

/**
 * Populate #book with all pages.
 *
 * Page sequence (36 total):
 *   [0]       Section 1 intro  "商业价值"
 *   [1–10]    Commercial photos 1–10
 *   [11]      Transition page  ← breath between sections
 *   [12]      Section 2 intro  "互动与羁绊"
 *   [13–22]   Human photos 1–10
 *   [23]      Transition page
 *   [24]      Section 3 intro  "马场众生"
 *   [25–34]   Horses photos 1–10
 *   [35]      Back cover
 *
 * StPageFlip double-page spreads: (0,1)(2,3)…
 * With transition pages, sections always open on the left of a fresh spread.
 */
function buildFlipBook() {
  const book = document.getElementById('book');
  const frag = document.createDocumentFragment();

  SECTIONS.forEach((section, idx) => {
    frag.appendChild(createSectionPage(section));
    section.photos.forEach((photo, i) => {
      frag.appendChild(createPhotoPage(section, photo, i));
    });
    /* Insert transition page after every section except the last */
    if (idx < SECTIONS.length - 1) {
      frag.appendChild(createTransitionPage());
    }
  });

  frag.appendChild(createBackCoverPage());
  book.appendChild(frag);
}

/* ============================================================
   FLIP BOOK — StPageFlip initialisation
   ============================================================ */
let pageFlipInstance = null;

function initPageFlip() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isPortrait = vw < 700;

  let pageW, pageH;
  if (isPortrait) {
    pageW = Math.floor(Math.min(vw * 0.84, 360));
    pageH = Math.floor(pageW * 1.44);
  } else {
    pageH = Math.floor(Math.min(vh * 0.76, 680));
    pageW = Math.floor(pageH * 0.68);
  }

  pageFlipInstance = new St.PageFlip(document.getElementById('book'), {
    width:               pageW,
    height:              pageH,
    size:                'fixed',
    drawShadow:          true,
    flippingTime:        900,
    showCover:           false,
    usePortrait:         isPortrait,
    startZIndex:         0,
    autoSize:            true,
    maxShadowOpacity:    0.5,
    mobileScrollSupport: false,
    swipeDistance:       30,
  });

  pageFlipInstance.loadFromHTML(document.querySelectorAll('#book .page'));

  const total = pageFlipInstance.getPageCount();
  updatePageNum(1, total);

  /* Page change callback */
  pageFlipInstance.on('flip', (e) => {
    const current = e.data + 1;
    updatePageNum(current, total);

    /* Reveal "enter gallery" button when near the end */
    if (current >= total - 4) {
      document.getElementById('enterBtn').classList.add('visible');
    }
  });

  /* Keyboard navigation — ignore when lightbox is open */
  document.addEventListener('keydown', (e) => {
    if (document.body.classList.contains('glightbox-open')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      pageFlipInstance.flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      pageFlipInstance.flipPrev();
    }
  });

  document.getElementById('prevBtn').addEventListener('click', () => {
    pageFlipInstance.flipPrev();
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    pageFlipInstance.flipNext();
  });
}

function updatePageNum(current, total) {
  document.getElementById('pageNum').textContent = `${current} · ${total}`;
}

/* ============================================================
   GALLERY WALL — DOM construction
   ============================================================ */
function buildGallery() {
  const wall = document.getElementById('galleryWall');
  let photoIndex = 0;

  SECTIONS.forEach((section) => {
    section.photos.forEach((photo) => {
      photoIndex += 1;
      const [title, desc] = splitCaption(photo.caption);
      const src = `${section.dir}/${photo.file}`;

      const link = document.createElement('a');
      link.className = `collage-item collage-item-${photoIndex} glightbox`;
      link.href = src;
      link.dataset.section = section.id;
      link.setAttribute('data-gallery', 'horse-collage');
      link.setAttribute('data-title', title);
      link.setAttribute('data-description', desc);
      link.setAttribute('data-alt', title);

      link.innerHTML = `
        <img src="${src}" alt="${title}" loading="lazy">
        <span class="collage-label">${title}</span>`;

      wall.appendChild(link);
    });
  });
}

const COLLAGE_ROTATIONS = [-2.4, 1.8, -1.2, 2.2, -1.7, 1.3, -2, 1.6, -1.5, 2.4];

/**
 * Lay photos out with a justified gallery algorithm so rows are balanced
 * and rectangles never overlap while still keeping a loose collage feel.
 */
function initCollageLayout() {
  const viewport = document.getElementById('galleryViewport');
  const wall = document.getElementById('galleryWall');
  if (!viewport || !wall) return;

  const items = Array.from(wall.querySelectorAll('.collage-item'));
  const images = items.map((item) => item.querySelector('img'));
  let resizeTimer = null;

  Promise.all(images.map(waitForImage)).then(() => {
    layoutCollage(viewport, wall, items);
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => layoutCollage(viewport, wall, items), 160);
    });
  });
}

/**
 * Resolve once an image has dimensions available for aspect-ratio layout.
 */
function waitForImage(img) {
  if (img.complete && img.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', resolve, { once: true });
  });
}

/**
 * Compute row breaks and item rectangles using the same core idea as
 * Flickr-style justified galleries: collect images until a row can fill
 * the available width near the target height, then scale that whole row.
 */
function layoutCollage(viewport, wall, items) {
  const isMobile = window.innerWidth <= 860;
  const viewportW = viewport.clientWidth || window.innerWidth;
  const viewportH = viewport.clientHeight || window.innerHeight;
  const canvasW = isMobile
    ? Math.max(980, viewportW * 2.3)
    : Math.max(1600, viewportW * 1.65);
  const gap = isMobile ? 16 : 24;
  const padX = isMobile ? 28 : 78;
  const padTop = isMobile ? 118 : 138;
  const padBottom = isMobile ? 56 : 96;
  const rowJitter = isMobile ? 0 : 20;
  const targetH = isMobile
    ? Math.max(126, Math.min(168, viewportH * 0.19))
    : Math.max(205, Math.min(285, viewportH * 0.29));
  const maxRowH = targetH * (isMobile ? 1.12 : 1.18);
  const availableW = canvasW - padX * 2;
  const rows = [];
  let row = [];
  let ratioSum = 0;

  items.forEach((item) => {
    const img = item.querySelector('img');
    const ratio = img.naturalWidth && img.naturalHeight
      ? img.naturalWidth / img.naturalHeight
      : 4 / 3;

    row.push({ item, ratio });
    ratioSum += ratio;

    const rowH = (availableW - gap * (row.length - 1)) / ratioSum;
    if (row.length >= 3 && rowH <= targetH) {
      rows.push({ items: row, height: Math.min(rowH, maxRowH), justified: true });
      row = [];
      ratioSum = 0;
    }
  });

  if (row.length && row.length < 3 && rows.length) {
    const previous = rows.pop();
    row = previous.items.concat(row);
    ratioSum = row.reduce((sum, { ratio }) => sum + ratio, 0);
  }

  if (row.length) {
    const looseH = Math.min(targetH * 0.96, maxRowH);
    const rowH = (availableW - gap * (row.length - 1)) / ratioSum;
    rows.push({
      items: row,
      height: row.length >= 4 ? Math.min(rowH, maxRowH) : looseH,
      justified: row.length >= 4,
    });
  }

  let y = padTop;
  rows.forEach((layoutRow, rowIndex) => {
    const rowItems = layoutRow.items;
    let h = layoutRow.height;
    let widths = rowItems.map(({ ratio }) => ratio * h);
    const rowW = widths.reduce((sum, width) => sum + width, 0) + gap * (rowItems.length - 1);

    if (layoutRow.justified) {
      const scale = availableW / rowW;
      h *= scale;
      widths = widths.map((width) => width * scale);
    }

    const rowWidth = widths.reduce((sum, width) => sum + width, 0) + gap * (rowItems.length - 1);
    let x = padX + (layoutRow.justified ? 0 : (availableW - rowWidth) / 2);
    const yOffset = rowIndex % 2 === 0 ? 0 : rowJitter;

    rowItems.forEach(({ item }, itemIndex) => {
      const globalIndex = items.indexOf(item);
      const rotation = COLLAGE_ROTATIONS[globalIndex % COLLAGE_ROTATIONS.length];
      const width = widths[itemIndex];

      item.style.left = `${x}px`;
      item.style.top = `${y + yOffset}px`;
      item.style.width = `${width}px`;
      item.style.height = `${h}px`;
      item.style.setProperty('--r', `${rotation}deg`);
      item.style.setProperty('--z', String((globalIndex % 5) + 1));

      x += width + gap;
    });

    y += h + gap + yOffset;
  });

  wall.style.width = `${canvasW}px`;
  wall.style.height = `${Math.max(y + padBottom, viewportH * (isMobile ? 1.5 : 1.85))}px`;
  wall.dispatchEvent(new CustomEvent('collage:layout'));
}

/* ============================================================
   LIGHTBOX — GLightbox
   ============================================================ */
function initLightbox() {
  GLightbox({
    touchNavigation: true,
    loop:            true,
    openEffect:      'fade',
    closeEffect:     'fade',
    descPosition:    'bottom',
  });
}

/* ============================================================
   GALLERY — entrance animation and edge panning
   ============================================================ */
function initGalleryObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.collage-item').forEach((el) => observer.observe(el));
}

function initGalleryPan() {
  const viewport = document.getElementById('galleryViewport');
  const wall = document.getElementById('galleryWall');
  if (!viewport || !wall || !window.matchMedia('(pointer: fine)').matches) return;

  let rafId = null;
  let targetX = 0;
  let targetY = 0;

  function updatePan() {
    const maxX = Math.max(0, wall.offsetWidth - viewport.clientWidth);
    const maxY = Math.max(0, wall.offsetHeight - viewport.clientHeight);
    wall.style.transform = `translate3d(${-targetX * maxX}px, ${-targetY * maxY}px, 0)`;
    rafId = null;
  }

  viewport.addEventListener('pointermove', (e) => {
    const rect = viewport.getBoundingClientRect();
    targetX = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    targetY = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));

    if (!rafId) {
      rafId = requestAnimationFrame(updatePan);
    }
  });

  wall.addEventListener('collage:layout', updatePan);
  updatePan();
}

/* ============================================================
   SCROLL helpers
   ============================================================ */
function goToGallery() {
  window.location.href = 'gallery.html';
}

function scrollToFlipbook() {
  window.location.href = 'index.html#flipbook-section';
}
