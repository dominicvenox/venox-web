const instances = new WeakMap();

export function mount(root = document) {
  instances.get(root)?.();
  const page = root.matches?.('[data-recipe="pinned-story"]') ? root : root.querySelector('[data-recipe="pinned-story"]');
  if (!page) return () => {};
  const story = page.querySelector('.story');
  const stage = page.querySelector('[data-stage]');
  const wheel = page.querySelector('[data-wheel]');
  const label = page.querySelector('[data-stage-label]');
  const steps = [...page.querySelectorAll('[data-step]')];
  const toggle = page.querySelector('[data-motion]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 801px)');
  const wheelStyle = wheel.getAttribute('style'), originalLabel = label.textContent;
  let active = false, visible = true, frame = 0, disposed = false;
  function reset() {
    wheelStyle === null ? wheel.removeAttribute('style') : wheel.setAttribute('style', wheelStyle);
    delete stage.dataset.progress;
    steps.forEach(step => { delete step.dataset.current; });
    label.textContent = originalLabel;
  }
  function paint() {
    frame = 0;
    if (disposed || !active || !visible || document.hidden) return;
    const rect = story.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, story.offsetHeight - innerHeight)));
    wheel.style.transform = `rotate(${-240 * progress}deg)`;
    stage.dataset.progress = progress.toFixed(3);
    let nearest = 0, distance = Infinity;
    steps.forEach((step, index) => {
      const bounds = step.getBoundingClientRect();
      const d = Math.abs(bounds.top + bounds.height / 2 - innerHeight / 2);
      if (d < distance) { distance = d; nearest = index; }
    });
    steps.forEach((step, index) => step.toggleAttribute('data-current', index === nearest));
    label.textContent = ['01 / Keep', '02 / Separate', '03 / Return'][nearest];
  }
  function schedule() { if (!disposed && active && visible && !document.hidden && !frame) frame = requestAnimationFrame(paint); }
  function configure() {
    if (disposed) return;
    cancelAnimationFrame(frame); frame = 0;
    active = toggle.checked && !reduced.matches && desktop.matches;
    reset(); page.toggleAttribute('data-enhanced', active);
    if (active) { page.dataset.enhanced = 'true'; schedule(); }
  }
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) schedule(); }, { rootMargin: '100px' });
  intersection.observe(story);
  const resize = new ResizeObserver(schedule); resize.observe(story);
  page.dataset.mounted = 'true';
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', configure, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', configure); desktop.addEventListener('change', configure); toggle.addEventListener('change', configure);
  configure();
  function destroy() {
    if (disposed) return; disposed = true; active = false;
    cancelAnimationFrame(frame); intersection.disconnect(); resize.disconnect();
    removeEventListener('scroll', schedule); removeEventListener('resize', configure); document.removeEventListener('visibilitychange', schedule);
    reduced.removeEventListener('change', configure); desktop.removeEventListener('change', configure); toggle.removeEventListener('change', configure);
    reset(); delete page.dataset.enhanced; delete page.dataset.mounted; instances.delete(root);
  }
  instances.set(root, destroy); return destroy;
}
