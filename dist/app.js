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
  const cards = [...gallery.children].slice(1);
  gallery.id = `case-gallery-${index}`;
  gallery.setAttribute('aria-label', project.querySelector('.caption')?.textContent || 'Материалы кейса');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'case-toggle';
  toggle.textContent = 'Развернуть кейс →';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', gallery.id);
  cards.forEach(card => { card.hidden = true; });
  const toggleRow = document.createElement('div');
  toggleRow.className = 'case-toggle-row';
  toggleRow.append(toggle);
  project.append(toggleRow);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? '← Свернуть кейс' : 'Развернуть кейс →';
    project.classList.toggle('is-expanded', expanded);
    cards.forEach(card => { card.hidden = !expanded; });
    if (!expanded) gallery.scrollLeft = 0;
    toggle.focus({preventScroll:true});
  });
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



