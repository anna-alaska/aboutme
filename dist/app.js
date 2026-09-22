document.querySelectorAll('.gallery').forEach(gallery => {
  let drag = null;
  gallery.addEventListener('keydown', event => {
    if (event.target !== gallery || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const step = gallery.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(gallery).gap);
    const left = event.key === 'Home' ? 0 : event.key === 'End' ? gallery.scrollWidth : gallery.scrollLeft + (event.key === 'ArrowRight' ? step : -step);
    gallery.scrollTo({left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  gallery.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = {x:event.clientX, left:gallery.scrollLeft};
    gallery.setPointerCapture(event.pointerId);
    gallery.classList.add('is-dragging');
  });
  gallery.addEventListener('pointermove', event => {
    if (drag) gallery.scrollLeft = drag.left - (event.clientX - drag.x);
  });
  const end = () => {drag = null; gallery.classList.remove('is-dragging');};
  gallery.addEventListener('pointerup', end);
  gallery.addEventListener('pointercancel', end);
  gallery.addEventListener('lostpointercapture', end);
  gallery.addEventListener('dragstart', event => event.preventDefault());
});
