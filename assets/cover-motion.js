(() => {
  const preference = matchMedia('(prefers-reduced-motion: no-preference)');
  const nav = document.querySelector('.nav');
  const main = document.querySelector('main');
  const blocks = [...main.querySelectorAll([
    '.photo-cover', '.paper-details', '.timescale-layout > *', '.section-head',
    '.prose', '.figure', '.pipeline > article', '.stats > div', '.results-tabs',
    '.callout', '.rollouts', '.resources > article', '.citation'
  ].join(','))];
  let frame = 0;

  function paint() {
    frame = 0;
    const top = nav.getBoundingClientRect().bottom;
    const bottom = document.documentElement.clientHeight;
    const fadeDistance = Math.min(110, Math.max(56, (bottom - top) * 0.13));
    const values = blocks.map(block => {
      const rect = block.getBoundingClientRect();
      const distance = Math.min(bottom - rect.top, rect.bottom - top);
      const fraction = Math.min(1, Math.max(0, distance / fadeDistance));
      return (fraction * fraction * (3 - 2 * fraction)).toFixed(3);
    });
    blocks.forEach((block, i) => {
      if (block.style.getPropertyValue('--scroll-opacity') !== values[i]) {
        block.style.setProperty('--scroll-opacity', values[i]);
      }
    });
  }

  function schedule() {
    if (!frame && preference.matches) frame = requestAnimationFrame(paint);
  }

  const sizes = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  function applyPreference() {
    if (preference.matches) {
      blocks.forEach(block => { block.dataset.scrollFade = ''; });
      paint();
      window.addEventListener('scroll', schedule, {passive:true});
      window.addEventListener('resize', schedule);
      sizes?.observe(main);
    } else {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      sizes?.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
      blocks.forEach(block => {
        delete block.dataset.scrollFade;
        block.style.removeProperty('--scroll-opacity');
      });
    }
  }
  preference.addEventListener('change', applyPreference);
  applyPreference();
})();
