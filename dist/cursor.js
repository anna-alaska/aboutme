(() => {
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let last = 0;
  const sparks = new Set();
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !fine.matches || reduced.matches || event.buttons) return;
    const now = performance.now();
    if (now - last < 65 || sparks.size >= 12) return;
    last = now;
    const spark = document.createElement('span');
    spark.className = 'cursor-spark';
    spark.textContent = '✦';
    spark.setAttribute('aria-hidden','true');
    spark.style.left = `${event.clientX + (Math.random()-.5)*20}px`;
    spark.style.top = `${event.clientY + (Math.random()-.5)*20}px`;
    spark.style.fontSize = `${8 + Math.random()*7}px`;
    spark.style.setProperty('--dx',`${(Math.random()-.5)*24}px`);
    spark.style.setProperty('--dy',`${10+Math.random()*15}px`);
    (document.querySelector('dialog[open]') || document.body).append(spark);
    sparks.add(spark);
    setTimeout(() => {spark.remove();sparks.delete(spark);},700);
  },{passive:true});
  const clear = () => {sparks.forEach(s=>s.remove());sparks.clear();};
  window.addEventListener('blur',clear);
  document.addEventListener('pointerleave',clear);
})();
