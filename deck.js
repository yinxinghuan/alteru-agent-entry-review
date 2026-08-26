(() => {
  const sections = [...document.querySelectorAll('.slide')];
  const label = document.querySelector('#section-label');
  const index = document.querySelector('#section-index');
  const total = document.querySelector('#section-total');
  const progress = document.querySelector('#deck-progress-bar');
  const previous = document.querySelector('#previous-section');
  const next = document.querySelector('#next-section');
  let active = 0;

  const update = (nextIndex) => {
    active = Math.max(0, Math.min(nextIndex, sections.length - 1));
    label.textContent = sections[active].dataset.label || `Section ${active + 1}`;
    index.textContent = String(active + 1).padStart(2, '0');
    total.textContent = String(sections.length).padStart(2, '0');
    progress.style.width = `${((active + 1) / sections.length) * 100}%`;
    previous.disabled = active === 0;
    next.disabled = active === sections.length - 1;
  };

  const go = (nextIndex) => {
    const target = Math.max(0, Math.min(nextIndex, sections.length - 1));
    sections[target].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) update(sections.indexOf(visible.target));
  }, { threshold: [0.35, 0.6] });

  sections.forEach((section) => observer.observe(section));
  previous.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || ['A', 'BUTTON'].includes(document.activeElement?.tagName)) return;
    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); go(active + 1); }
    if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); go(active - 1); }
    if (event.key === 'Home') { event.preventDefault(); go(0); }
    if (event.key === 'End') { event.preventDefault(); go(sections.length - 1); }
  });
  update(0);
})();
