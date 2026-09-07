const instances = new WeakMap();

export function mount(root = document) {
  instances.get(root)?.();
  const page = root.matches?.('[data-recipe="horizontal-gallery"]') ? root : root.querySelector('[data-recipe="horizontal-gallery"]');
  if (!page) return () => {};
  const gallery = page.querySelector('.gallery'), stage = page.querySelector('[data-stage]');
  const viewport = page.querySelector('[data-viewport]'), track = page.querySelector('[data-track]');
  const cards = [...page.querySelectorAll('.object')];
  const previous = page.querySelector('[data-prev]'), next = page.querySelector('[data-next]');
  const toggle = page.querySelector('[data-motion]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), desktop = matchMedia('(min-width: 768px)');
  const originals = [gallery, track].map(element => [element, element.getAttribute('style')]);
  const originalScroll = viewport.scrollLeft;
  let active = false, frame = 0, distance = 0, travel = 0, current = 0, visible = true, disposed = false;
  const restore = () => originals.forEach(([element, style]) => style === null ? element.removeAttribute('style') : element.setAttribute('style', style));
  function updateButtons(offset) {
    previous.disabled = offset <= 1;
    next.disabled = offset >= distance - 1;
  }
  function paint() {
    frame = 0;
    if (disposed || !active || !visible || document.hidden) return;
    const bounds = gallery.getBoundingClientRect();
    current = Math.max(0, Math.min(1, -bounds.top / Math.max(1, travel)));
    track.style.transform = `translateX(${-distance * current}px)`;
    stage.dataset.progress = current.toFixed(3);
    updateButtons(distance * current);
  }
  function schedule() { if (!disposed && active && visible && !document.hidden && !frame) frame = requestAnimationFrame(paint); }
  function configure() {
    if (disposed) return;
    cancelAnimationFrame(frame); frame = 0;
    restore(); delete stage.dataset.progress; delete page.dataset.enhanced;
    distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
    active = toggle.checked && !reduced.matches && desktop.matches && distance > 1;
    if (active) {
      viewport.scrollLeft = 0;
      page.dataset.enhanced = 'true';
      travel = distance;
      gallery.style.height = `${Math.ceil(stage.offsetHeight + travel)}px`;
      schedule();
    } else { current = 0; updateButtons(viewport.scrollLeft); }
  }
  function moveTo(offset) {
    const x = Math.max(0, Math.min(distance, offset));
    if (active) {
      const top = gallery.getBoundingClientRect().top + scrollY;
      scrollTo({ top: top + x / Math.max(1, distance) * travel, behavior: 'instant' });
      paint();
    } else viewport.scrollTo({ left: x, behavior: 'instant' });
  }
  function move(direction) {
    const offset = active ? current * distance : viewport.scrollLeft;
    const stride = cards[0].offsetWidth + parseFloat(getComputedStyle(track).gap);
    moveTo(offset + direction * stride);
  }
  const goPrevious = () => move(-1), goNext = () => move(1);
  function keyboard(event) {
    if (event.target !== viewport) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') moveTo(event.key === 'Home' ? 0 : distance);
    else move(event.key === 'ArrowRight' ? 1 : -1);
  }
  function focus(event) {
    if (!active) return;
    const card = event.target.closest('.object');
    if (!card) return;
    // Focus may make even overflow:hidden containers scroll internally.
    // In enhanced mode the document scroll is the only gallery position.
    viewport.scrollLeft = 0;
    const bounds = event.target.getBoundingClientRect(), region = viewport.getBoundingClientRect();
    if (bounds.left < region.left || bounds.right > region.right) moveTo(card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2);
  }
  function nativeScroll() {
    if (!active) updateButtons(viewport.scrollLeft);
    else if (viewport.scrollLeft !== 0) { viewport.scrollLeft = 0; schedule(); }
  }
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) schedule(); }, { rootMargin: '100px' });
  intersection.observe(gallery);
  const resize = new ResizeObserver(configure); resize.observe(viewport);
  page.dataset.mounted = 'true';
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', configure, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  viewport.addEventListener('scroll', nativeScroll, { passive: true }); viewport.addEventListener('keydown', keyboard); viewport.addEventListener('focusin', focus);
  previous.addEventListener('click', goPrevious); next.addEventListener('click', goNext);
  reduced.addEventListener('change', configure); desktop.addEventListener('change', configure); toggle.addEventListener('change', configure);
  configure();
  function destroy() {
    if (disposed) return; disposed = true; active = false;
    cancelAnimationFrame(frame); intersection.disconnect(); resize.disconnect();
    removeEventListener('scroll', schedule); removeEventListener('resize', configure); document.removeEventListener('visibilitychange', schedule);
    viewport.removeEventListener('scroll', nativeScroll); viewport.removeEventListener('keydown', keyboard); viewport.removeEventListener('focusin', focus);
    previous.removeEventListener('click', goPrevious); next.removeEventListener('click', goNext);
    reduced.removeEventListener('change', configure); desktop.removeEventListener('change', configure); toggle.removeEventListener('change', configure);
    restore(); previous.disabled = false; next.disabled = false; viewport.scrollLeft = originalScroll;
    delete stage.dataset.progress; delete page.dataset.mounted; delete page.dataset.enhanced; instances.delete(root);
  }
  instances.set(root, destroy); return destroy;
}
