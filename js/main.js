/* ============================================================
   Main application bootstrap
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initLanding();
  buildFlipBook();
  buildGallery();
  initPageFlip();
  initLightbox();
  initGalleryObserver();
});

/* ============================================================
   LANDING PAGE — full-screen intro, dismiss on any key or click
   ============================================================ */
function initLanding() {
  let dismissed = false;
  let canDismiss = false;

  /* Brief delay prevents accidental trigger on page load */
  setTimeout(() => { canDismiss = true; }, 350);

  function dismiss() {
    if (dismissed || !canDismiss) return;
    dismissed = true;
    const el = document.getElementById('landing');
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

function createCoverPage() {
  const el = document.createElement('div');
  el.className = 'page page-cover';
  el.innerHTML = `
    <div class="cover-inner">
      <div class="cover-deco"></div>
      <h1 class="cover-main-title">马·影</h1>
      <p class="cover-sub">Equestrian Photography</p>
      <div class="cover-deco"></div>
      <p class="cover-meta">马场生活 · 影像纪实</p>
    </div>`;
  return el;
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
      <button class="enter-gallery-btn" onclick="scrollToGallery()">进入展馆</button>
    </div>`;
  return el;
}

/**
 * Populate #book with all pages.
 *
 * Page sequence (37 total):
 *   [0]       Cover
 *   [1]       Section 1 intro  "商业价值"
 *   [2–11]    Commercial photos 1–10
 *   [12]      Transition page  ← breath between sections
 *   [13]      Section 2 intro  "互动与羁绊"
 *   [14–23]   Human photos 1–10
 *   [24]      Transition page
 *   [25]      Section 3 intro  "马场众生"
 *   [26–35]   Horses photos 1–10
 *   [36]      Back cover
 *
 * StPageFlip double-page spreads (after cover): (1,2)(3,4)…
 * With transition pages, sections always open on the left of a fresh spread.
 */
function buildFlipBook() {
  const book = document.getElementById('book');
  const frag = document.createDocumentFragment();

  frag.appendChild(createCoverPage());

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
    showCover:           true,
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
  const numCN = { commercial: '一', human: '二', horses: '三' };

  SECTIONS.forEach((section) => {
    /* Cluster wrapper */
    const cluster = document.createElement('div');
    cluster.className = 'cluster';
    cluster.dataset.section = section.id;

    /* Cluster header */
    const header = document.createElement('div');
    header.className = 'cluster-header';
    header.innerHTML = `
      <span class="cluster-num">${numCN[section.id]}</span>
      <h3 class="cluster-title">${section.title}</h3>
      <p class="cluster-sub">${section.subtitle}</p>`;
    cluster.appendChild(header);

    /* Thumbnail grid */
    const grid = document.createElement('div');
    grid.className = 'cluster-grid';

    section.photos.forEach((photo) => {
      const [title, desc] = splitCaption(photo.caption);
      const src = `${section.dir}/${photo.file}`;

      const link = document.createElement('a');
      link.className = 'thumb-link glightbox';
      link.href = src;
      link.setAttribute('data-gallery', section.id);
      link.setAttribute('data-title', title);
      link.setAttribute('data-description', desc);
      link.setAttribute('data-alt', title);

      link.innerHTML = `
        <img src="${src}" alt="${title}" loading="lazy">
        <div class="thumb-overlay">
          <span class="thumb-label">${title}</span>
        </div>`;

      grid.appendChild(link);
    });

    cluster.appendChild(grid);
    wall.appendChild(cluster);
  });
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
   GALLERY — entrance animation via IntersectionObserver
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

  document.querySelectorAll('.cluster').forEach((el) => observer.observe(el));
}

/* ============================================================
   SCROLL helpers
   ============================================================ */
function scrollToGallery() {
  document.getElementById('gallery-section').scrollIntoView({
    behavior: 'smooth',
    block:    'start',
  });
}

function scrollToFlipbook() {
  document.getElementById('flipbook-section').scrollIntoView({
    behavior: 'smooth',
    block:    'start',
  });
}
