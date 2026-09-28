const oracleFrame = document.querySelector('#oracle-frame');
const themeToggle = document.querySelector('.theme-toggle');
let currentTheme = 'light';
try { currentTheme = localStorage.getItem('portfolio-theme') === 'dark' ? 'dark' : 'light'; } catch {}
const syncOracleTheme = () => {
  const root = oracleFrame?.contentDocument?.querySelector('#oracle-theme');
  if (!root) return;
  root.classList.toggle('light-theme', currentTheme === 'light');
  root.classList.toggle('dark-theme', currentTheme === 'dark');
  root.ownerDocument.documentElement.style.colorScheme = currentTheme;
  root.ownerDocument.body.style.background = currentTheme === 'dark' ? '#101010' : '#f7f5ef';
};
const applyTheme = () => {
  const dark = currentTheme === 'dark';
  document.documentElement.dataset.theme = currentTheme;
  themeToggle.textContent = dark ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
  themeToggle.setAttribute('aria-pressed', String(dark));
  document.querySelector('meta[name="theme-color"]').content = dark ? '#101010' : '#f7f5ef';
  syncOracleTheme();
};
themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('portfolio-theme', currentTheme); } catch {}
  applyTheme();
});
applyTheme();
if (oracleFrame) {
  let oracleObserver;
  const fitOracle = () => {
    const root = oracleFrame.contentDocument?.querySelector('#oracle-theme');
    if (!root) return;
    syncOracleTheme();
    oracleObserver?.disconnect();
    const resize = () => { oracleFrame.style.height = `${Math.ceil(root.getBoundingClientRect().height) + 2}px`; };
    oracleObserver = new ResizeObserver(resize);
    oracleObserver.observe(root);
    resize();
  };
  oracleFrame.addEventListener('load', fitOracle);
  fitOracle();
}

document.querySelectorAll('.gallery').forEach((gallery, index) => {
  const project = gallery.closest('.project');
  project.classList.add('is-expanded');
  gallery.id = `case-gallery-${index}`;
  gallery.addEventListener('wheel', event => {
    if (event.ctrlKey || gallery.scrollWidth <= gallery.clientWidth) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    gallery.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery.clientWidth : 1);
  }, {passive:false});
  gallery.addEventListener('keydown', event => {
    if (event.target !== gallery || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const step = gallery.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).gap);
    const left = event.key === 'Home' ? 0 : event.key === 'End' ? gallery.scrollWidth : gallery.scrollLeft + (event.key === 'ArrowRight' ? step : -step);
    gallery.scrollTo({left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
});




// Full-screen image viewer; native dialog handles focus trapping and Escape.
const imageViewer = document.createElement('dialog');
imageViewer.className = 'image-viewer';
imageViewer.setAttribute('aria-label', 'Просмотр изображения кейса');
const viewerImage = document.createElement('div');
viewerImage.className = 'viewer-image';
const closeViewer = document.createElement('button');
closeViewer.type = 'button';
closeViewer.className = 'viewer-close';
closeViewer.textContent = '×';
closeViewer.setAttribute('aria-label', 'Закрыть изображение');
imageViewer.append(viewerImage, closeViewer);
document.body.append(imageViewer);
imageViewer.addEventListener('dragstart', event => event.preventDefault());
imageViewer.addEventListener('selectstart', event => event.preventDefault());
let viewerTrigger = null;
let previousOverflow = '';
const openImage = card => {
  window.getSelection()?.removeAllRanges();
  viewerTrigger = card;
  const enlarged = card.cloneNode(true);
  enlarged.removeAttribute('tabindex');
  enlarged.removeAttribute('role');
  enlarged.removeAttribute('aria-haspopup');
  enlarged.classList.add('viewer-card');
  if (enlarged.tagName === 'IMG') enlarged.loading = 'eager';
  enlarged.querySelectorAll('img').forEach(img => {img.loading = 'eager';});
  viewerImage.replaceChildren(enlarged);
  const videos = enlarged.tagName === 'VIDEO' ? [enlarged] : [...enlarged.querySelectorAll('video')];
  videos.forEach(video => {video.muted = true; video.play().catch(() => {});});
  previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  imageViewer.showModal();
  closeViewer.focus();
};
closeViewer.addEventListener('click', () => imageViewer.close());
imageViewer.addEventListener('click', event => {
  if (event.target === imageViewer) imageViewer.close();
});
imageViewer.addEventListener('close', () => {
  document.documentElement.style.overflow = previousOverflow;
  viewerTrigger?.focus({preventScroll:true});
  viewerImage.querySelectorAll('video').forEach(video => video.pause());
  viewerImage.replaceChildren();
});
document.querySelectorAll('.gallery > .card').forEach(card => {
  card.draggable = false;
  card.querySelectorAll('img,video').forEach(media => {media.draggable = false;});
  card.addEventListener('dragstart', event => event.preventDefault());
  card.addEventListener('selectstart', event => event.preventDefault());
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-haspopup', 'dialog');
  card.setAttribute('aria-label', `Открыть на весь экран: ${card.alt || card.getAttribute("aria-label") || card.querySelector(".card-label,h2")?.textContent || "Карточка кейса"}`);
  let start = null;
  let swiped = false;
  card.addEventListener('pointerdown', event => {
    start = {x:event.clientX,y:event.clientY,scroll:card.parentElement.scrollLeft};
    swiped = false;
  });
  card.addEventListener('pointermove', event => {
    if (start && Math.hypot(event.clientX-start.x,event.clientY-start.y)>10) swiped = true;
  });
  card.addEventListener('pointercancel', () => {swiped = true;});
  card.addEventListener('click', () => {
    if (!swiped && (!start || Math.abs(card.parentElement.scrollLeft-start.scroll)<10)) openImage(card);
    start = null;
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openImage(card);
    }
  });
});



