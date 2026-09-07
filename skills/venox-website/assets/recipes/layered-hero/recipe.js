const instances = new WeakMap();

/** Mount one scene. Returned cleanup is safe to call repeatedly. */
export function mount(root = document) {
  instances.get(root)?.();
  const page = root.matches?.('[data-recipe="layered-hero"]') ? root : root.querySelector('[data-recipe="layered-hero"]');
  if (!page) return () => {};
  const hero = page.querySelector('.hero');
  const stage = page.querySelector('[data-stage]');
  const layers = [...page.querySelectorAll('[data-plane]')];
  const toggle = page.querySelector('[data-motion]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 768px)');
  const original = layers.map(element => [element, element.getAttribute('style')]);
  let frame = 0, active = false, visible = true, disposed = false;
  const restore = () => original.forEach(([element, style]) => style === null ? element.removeAttribute('style') : element.setAttribute('style', style));
  function paint() {
    frame = 0;
    if (disposed || !active || !visible || document.hidden) return;
    const rect = hero.getBoundingClientRect();
    const travel = Math.max(1, hero.offsetHeight - stage.offsetHeight);
    const progress = Math.max(0, Math.min(1, -rect.top / travel));
    stage.dataset.progress = progress.toFixed(3);
    for (const layer of layers) {
      const name = layer.dataset.plane;
      // Ground and shelter share the same transform and ground contact pivot.
      const rate = { sky: 2, ridge: 9, ground: 23, subject: 23, near: 42 }[name];
      const scale = { sky: 1.015, ridge: 1.035, ground: 1.075, subject: 1.075, near: 1.13 }[name];
      layer.style.transform = `translateY(${-progress * rate}px) scale(${1 + progress * (scale - 1)})`;
    }
  }
  function schedule() { if (!disposed && !frame && active && visible && !document.hidden) frame = requestAnimationFrame(paint); }
  function configure() {
    if (disposed) return;
    active = toggle.checked && !reduced.matches && desktop.matches;
    cancelAnimationFrame(frame); frame = 0;
    restore(); delete stage.dataset.progress;
    hero.toggleAttribute('data-active', active);
    page.toggleAttribute('data-enhanced', active);
    if (active) { page.dataset.enhanced = 'true'; schedule(); }
  }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) schedule(); }, { rootMargin: '150px' });
  observer.observe(hero);
  const resize = new ResizeObserver(schedule); resize.observe(hero);
  page.dataset.mounted = 'true';
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', configure, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', configure); desktop.addEventListener('change', configure);
  toggle.addEventListener('change', configure);
  configure();
  function destroy() {
    if (disposed) return; disposed = true; active = false;
    cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect();
    removeEventListener('scroll', schedule); removeEventListener('resize', configure);
    document.removeEventListener('visibilitychange', schedule);
    reduced.removeEventListener('change', configure); desktop.removeEventListener('change', configure);
    toggle.removeEventListener('change', configure);
    restore(); delete stage.dataset.progress; delete hero.dataset.active;
    delete page.dataset.mounted; delete page.dataset.enhanced;
    instances.delete(root);
  }
  instances.set(root, destroy);
  return destroy;
}
