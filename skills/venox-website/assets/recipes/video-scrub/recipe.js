const instances = new WeakMap();

export function mount(root = document) {
  instances.get(root)?.();
  const page = root.matches?.('[data-recipe="video-scrub"]') ? root : root.querySelector('[data-recipe="video-scrub"]');
  if (!page) return () => {};
  const film = page.querySelector('.film'), stage = page.querySelector('[data-stage]');
  const video = page.querySelector('[data-video]'), file = page.querySelector('[data-file]');
  const toggle = page.querySelector('[data-motion]'), status = page.querySelector('[data-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), desktop = matchMedia('(min-width: 768px)');
  const originalStatus = status.textContent, originalSource = video.getAttribute('src');
  let source = '', ownedURL = '', failedSource = '', failureMessage = '', inputError = '', active = false, visible = true, disposed = false;
  let frame = 0, throttle = 0, seekDeadline = 0, lastSeek = -Infinity, desired = 0;
  const permitted = () => toggle.checked && !reduced.matches && desktop.matches;
  function cancelWork() {
    cancelAnimationFrame(frame); clearTimeout(throttle); clearTimeout(seekDeadline);
    frame = 0; throttle = 0; seekDeadline = 0;
  }
  function still(message) {
    active = false; cancelWork(); video.pause();
    delete page.dataset.enhanced; delete stage.dataset.videoReady; delete stage.dataset.progress;
    status.textContent = message;
  }
  function fail(message) {
    failedSource = source; failureMessage = message;
    still(message); stage.dataset.videoState = 'error';
  }
  function releaseMedia() {
    video.pause(); video.removeAttribute('src'); video.load();
  }
  function configure() {
    if (disposed) return;
    if (!source) { still(inputError || originalStatus); stage.dataset.videoState = inputError ? 'error' : 'idle'; return; }
    if (!permitted()) {
      still('Static composition active. Your selected clip is kept for desktop motion mode.');
      stage.dataset.videoState = 'static';
      if (video.hasAttribute('src')) releaseMedia();
      return;
    }
    if (failedSource === source) { still(failureMessage); stage.dataset.videoState = 'error'; return; }
    if (video.getAttribute('src') !== source) {
      still('Loading the selected local clip. The complete poster remains visible.');
      stage.dataset.videoState = 'loading';
      video.src = source; video.load();
    } else if (video.readyState >= 2) ready();
  }
  function ready() {
    if (disposed || !permitted() || !source || video.getAttribute('src') !== source || failedSource === source) return;
    if (!Number.isFinite(video.duration) || video.duration <= 0) { fail('This clip has no usable duration. Choose another MP4 or WebM; the poster remains available.'); return; }
    active = true; page.dataset.enhanced = 'true'; stage.dataset.videoReady = 'true'; stage.dataset.videoState = 'ready';
    status.textContent = 'Clip ready. Scroll through the image to inspect its movement. Audio stays off.';
    schedule();
  }
  function paint() {
    frame = 0;
    if (disposed || !active || !visible || document.hidden) return;
    const bounds = film.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, film.offsetHeight - stage.offsetHeight)));
    stage.dataset.progress = progress.toFixed(3);
    desired = Math.min(Math.max(0, video.duration - .04), progress * video.duration);
    if (video.seeking) {
      if (!seekDeadline) seekDeadline = setTimeout(() => fail('The browser could not finish seeking this clip. Choose a smaller clip; the poster remains available.'), 2000);
      return;
    }
    if (Math.abs(video.currentTime - desired) < .04) return;
    const elapsed = performance.now() - lastSeek;
    if (elapsed < 80) {
      if (!throttle) throttle = setTimeout(() => { throttle = 0; schedule(); }, 80 - elapsed);
      return;
    }
    lastSeek = performance.now();
    try {
      video.currentTime = desired;
      clearTimeout(seekDeadline);
      seekDeadline = setTimeout(() => fail('The browser could not finish seeking this clip. The still composition is available; try a smaller clip with frequent keyframes.'), 2000);
    } catch { fail('This clip cannot be scrubbed in this browser. The still composition remains available.'); }
  }
  function schedule() { if (!disposed && active && visible && !document.hidden && !frame) frame = requestAnimationFrame(paint); }
  function seeked() { clearTimeout(seekDeadline); seekDeadline = 0; if (active) schedule(); }
  function loadError() { if (source && permitted() && video.hasAttribute('src')) fail('The selected clip could not be decoded. Choose a compatible MP4 or WebM; the poster remains available.'); }
  function selectFile() {
    const selected = file.files?.[0];
    if (!selected) return;
    if (!(/\.(mp4|webm)$/i.test(selected.name) || ['video/mp4', 'video/webm'].includes(selected.type))) {
      status.textContent = 'Choose an MP4 or WebM video file.'; return;
    }
    still('Preparing your selected clip.'); releaseMedia();
    if (ownedURL) URL.revokeObjectURL(ownedURL);
    ownedURL = URL.createObjectURL(selected); source = ownedURL; failedSource = ''; inputError = ''; lastSeek = -Infinity;
    configure();
  }
  function visibility() { if (document.hidden) cancelWork(); else schedule(); }
  // Demo fixture only: reject protocol-relative, remote, blob and data URLs.
  const query = new URLSearchParams(location.search).get('video');
  if (query) {
    try {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(query)) throw new Error('Local path required');
      const candidate = new URL(query, location.href);
      if (candidate.origin !== location.origin || !['http:', 'https:'].includes(candidate.protocol)) throw new Error('Same origin required');
      source = candidate.href;
    } catch { inputError = 'The demo video parameter must be a same-origin local path.'; }
  }
  const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) schedule(); else cancelWork(); }, { rootMargin: '150px' });
  intersection.observe(film);
  const resize = new ResizeObserver(schedule); resize.observe(film);
  page.dataset.mounted = 'true';
  video.addEventListener('loadeddata', ready); video.addEventListener('seeked', seeked); video.addEventListener('error', loadError);
  file.addEventListener('change', selectFile); toggle.addEventListener('change', configure);
  reduced.addEventListener('change', configure); desktop.addEventListener('change', configure);
  addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', configure, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  configure();
  function destroy() {
    if (disposed) return; disposed = true;
    active = false; cancelWork(); intersection.disconnect(); resize.disconnect();
    video.removeEventListener('loadeddata', ready); video.removeEventListener('seeked', seeked); video.removeEventListener('error', loadError);
    file.removeEventListener('change', selectFile); toggle.removeEventListener('change', configure);
    reduced.removeEventListener('change', configure); desktop.removeEventListener('change', configure);
    removeEventListener('scroll', schedule); removeEventListener('resize', configure); document.removeEventListener('visibilitychange', visibility);
    releaseMedia(); if (ownedURL) URL.revokeObjectURL(ownedURL);
    if (originalSource !== null) { video.setAttribute('src', originalSource); video.load(); }
    status.textContent = originalStatus; file.value = '';
    delete page.dataset.mounted; delete page.dataset.enhanced;
    delete stage.dataset.progress; delete stage.dataset.videoState; delete stage.dataset.videoReady;
    instances.delete(root);
  }
  instances.set(root, destroy); return destroy;
}
