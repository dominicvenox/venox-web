import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createPreviewServer } from '../scripts/serve.mjs';

const recipes = ['layered-hero', 'pinned-story', 'horizontal-gallery', 'video-scrub'];
const viewports = [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 360, height: 640 }];
let server, browser, origin;

before(async () => {
  server = createPreviewServer(fileURLToPath(new URL('../', import.meta.url)));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});
after(async () => {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

function address(recipe, query = '') {
  return `${origin}/skills/venox-website/assets/recipes/${recipe}/index.html${query}`;
}

async function pageFor(t, options = {}) {
  const context = await browser.newContext({ viewport: viewports[0], ...options });
  t.after(() => context.close());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  return { page, errors };
}

async function settled(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.waitForTimeout(100);
}

async function overflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const recipe of recipes) {
  test(`${recipe}: responsive document, anchors and keyboard entry`, async t => {
    for (const viewport of viewports) {
      const { page, errors } = await pageFor(t, { viewport });
      await page.goto(address(recipe));
      await page.waitForFunction(() => Boolean(window.venoxRecipe));
      await settled(page);
      assert.ok(await page.locator('h1').isVisible());
      assert.ok(await overflow(page) <= 1, `${recipe} overflows at ${viewport.width}`);
      const missingAnchors = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
        .filter(a => a.hash.length > 1 && !document.getElementById(decodeURIComponent(a.hash.slice(1))))
        .map(a => a.hash));
      assert.deepEqual(missingAnchors, []);
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('skip')), true);
      const focus = await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width }; });
      assert.ok(focus.top >= 0 && focus.left >= 0 && focus.width > 0);
      for (const progress of [0.5, 1, 0.25, 0]) {
        await page.evaluate(p => scrollTo(0, p * (document.documentElement.scrollHeight - innerHeight)), progress);
        await settled(page);
        assert.ok(await overflow(page) <= 1, `scroll overflow ${recipe}/${viewport.width}/${progress}`);
      }
      assert.deepEqual(errors, []);
    }
  });

  test(`${recipe}: content and links survive without JavaScript`, async t => {
    const { page } = await pageFor(t, { javaScriptEnabled: false, viewport: viewports[2] });
    await page.goto(address(recipe));
    assert.ok(await page.locator('h1').isVisible());
    assert.ok(await page.locator('main').innerText().then(text => text.length > 300));
    assert.equal(await page.locator('[data-enhanced]').count(), 0);
    assert.ok(await overflow(page) <= 1);
    await page.locator('a[href^="#"]').first().focus();
    await page.keyboard.press('Enter');
    assert.ok(page.url().includes('#'));
  });

  test(`${recipe}: live reduced motion, resize, cleanup and repeated mount`, async t => {
    const { page, errors } = await pageFor(t);
    await page.addInitScript(() => {
      const records = [];
      const monitored = new Set(['scroll', 'resize', 'visibilitychange', 'change', 'focusin', 'keydown', 'click', 'loadeddata', 'seeked', 'error']);
      const add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
      EventTarget.prototype.addEventListener = function(type, callback, options) {
        const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
        // Count recipe-owned subscriptions, not Playwright's injected listeners.
        const owned = new Error().stack.includes('/assets/recipes/');
        if (owned && monitored.has(type) && !records.some(r => r.target === this && r.type === type && r.callback === callback && r.capture === capture)) records.push({ target: this, type, callback, capture });
        return add.call(this, type, callback, options);
      };
      EventTarget.prototype.removeEventListener = function(type, callback, options) {
        const capture = typeof options === 'boolean' ? options : Boolean(options?.capture);
        const i = records.findIndex(r => r.target === this && r.type === type && r.callback === callback && r.capture === capture);
        if (i !== -1) records.splice(i, 1);
        return remove.call(this, type, callback, options);
      };
      window.recipeListenerCount = () => records.length;
    });
    await page.goto(address(recipe));
    await page.waitForFunction(() => Boolean(window.venoxRecipe));
    await settled(page);
    const count = await page.evaluate(() => window.recipeListenerCount());
    assert.ok(count > 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settled(page);
    assert.equal(await page.locator('[data-enhanced]').count(), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize(viewports[2]);
    await settled(page);
    assert.equal(await page.locator('[data-enhanced]').count(), 0);
    assert.ok(await overflow(page) <= 1);
    await page.setViewportSize(viewports[0]);
    await settled(page);
    for (let n = 0; n < 3; n++) {
      await page.evaluate(() => window.venoxRecipe.destroy());
      await page.evaluate(() => { dispatchEvent(new Event('resize')); dispatchEvent(new Event('scroll')); });
      await settled(page);
      assert.equal(await page.evaluate(() => window.recipeListenerCount()), 0, 'listeners remain after destroy');
      assert.equal(await page.locator('[data-mounted], [data-enhanced], [data-progress]').count(), 0);
      await page.evaluate(() => window.venoxRecipe.mount(document));
      await settled(page);
      assert.equal(await page.evaluate(() => window.recipeListenerCount()), count, 'listeners accumulate on remount');
    }
    assert.deepEqual(errors, []);
  });
}

test('horizontal gallery keeps keyboard destinations through layout updates at both sizes', async t => {
  for (const viewport of [viewports[0], viewports[2]]) {
    const { page, errors } = await pageFor(t, { viewport });
    await page.goto(address('horizontal-gallery'));
    await page.waitForFunction(() => Boolean(window.venoxRecipe));
    await settled(page);
    const rail = page.locator('[data-viewport]');
    await rail.focus();
    await page.keyboard.press('End');
    const waitForCard = index => page.waitForFunction(index => {
      const rail = document.querySelector('[data-viewport]').getBoundingClientRect();
      const card = [...document.querySelectorAll('.object')].at(index).getBoundingClientRect();
      return card.left >= rail.left - 2 && card.right <= rail.right + 2;
    }, index, { timeout: 3000 });
    await waitForCard(-1);
    // ResizeObserver and window resize can reconfigure an already scrolled gallery.
    // Its temporary layout must not clamp the document scroll back to the middle.
    await page.evaluate(() => dispatchEvent(new Event('resize')));
    await waitForCard(-1);
    await page.setViewportSize({ width: viewport.width, height: viewport.height - 40 });
    await settled(page);
    await waitForCard(-1);
    await page.keyboard.press('Home');
    await waitForCard(0);
    assert.ok(await overflow(page) <= 1);
    assert.deepEqual(errors, []);
  }
});

test('scroll progress follows forward and reverse input in each non-video recipe', async t => {
  for (const [recipe, selector] of [['layered-hero', '.hero'], ['pinned-story', '.story'], ['horizontal-gallery', '.gallery']]) {
    const { page } = await pageFor(t);
    await page.goto(address(recipe));
    await page.waitForFunction(() => Boolean(window.venoxRecipe));
    await settled(page);
    const progress = [];
    for (const fraction of [.2, .75, .3]) {
      await page.evaluate(({ selector, fraction }) => {
        const region = document.querySelector(selector), stage = region.querySelector('[data-stage]');
        const travel = region.offsetHeight - (selector === '.story' ? innerHeight : stage.offsetHeight);
        scrollTo(0, region.getBoundingClientRect().top + scrollY + Math.max(1, travel) * fraction);
      }, { selector, fraction });
      await settled(page);
      progress.push(Number(await page.locator('[data-stage]').getAttribute('data-progress')));
    }
    assert.ok(progress[1] > progress[0] + .15 && progress[2] < progress[1] - .15, `${recipe}: ${progress}`);
  }
});

test('video scrubs actual supplied media forward and backward and releases it for reduced motion', async t => {
  const { page, errors } = await pageFor(t);
  await page.goto(address('video-scrub', '?video=/tests/fixtures/scrub.mp4'));
  await page.waitForSelector('[data-video-ready]', { timeout: 10000 });
  const times = [];
  for (const fraction of [.2, .8, .3]) {
    await page.evaluate(fraction => {
      const film = document.querySelector('.film'), stage = document.querySelector('[data-stage]');
      scrollTo(0, film.getBoundingClientRect().top + scrollY + (film.offsetHeight - stage.offsetHeight) * fraction);
    }, fraction);
    await page.waitForFunction(fraction => { const v = document.querySelector('video'); return !v.seeking && Math.abs(v.currentTime - v.duration * fraction) < .15; }, fraction, { timeout: 5000 });
    times.push(await page.locator('video').evaluate(v => v.currentTime));
  }
  assert.ok(times[1] > times[0] && times[2] < times[1]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settled(page);
  assert.equal(await page.locator('[data-video]').getAttribute('src'), null);
  assert.equal(await page.locator('[data-stage]').getAttribute('data-video-state'), 'static');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForSelector('[data-video-ready]');
  await page.evaluate(() => window.venoxRecipe.destroy());
  assert.equal(await page.locator('[data-video]').getAttribute('src'), null);
  assert.deepEqual(errors, []);
});

test('missing video keeps the poster and an actionable error; phones do not fetch video', async t => {
  const { page } = await pageFor(t);
  await page.goto(address('video-scrub', '?video=/tests/fixtures/missing.mp4'));
  await page.waitForFunction(() => document.querySelector('[data-stage]').dataset.videoState === 'error');
  assert.equal(await page.locator('[data-video-ready]').count(), 0);
  assert.match(await page.locator('[data-status]').innerText(), /poster|still/i);
  const failureMessage = await page.locator('[data-status]').innerText();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.querySelector('[data-stage]').dataset.videoState === 'static');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForFunction(() => document.querySelector('[data-stage]').dataset.videoState === 'error');
  assert.equal(await page.locator('[data-status]').innerText(), failureMessage);
  const { page: mobile } = await pageFor(t, { viewport: viewports[1] });
  const mediaRequests = [];
  mobile.on('request', request => { if (new URL(request.url()).pathname === '/tests/fixtures/scrub.mp4') mediaRequests.push(request.url()); });
  await mobile.goto(address('video-scrub', '?video=/tests/fixtures/scrub.mp4'));
  await mobile.waitForFunction(() => Boolean(window.venoxRecipe));
  await settled(mobile);
  assert.deepEqual(mediaRequests, []);
  assert.equal(await mobile.locator('[data-stage]').getAttribute('data-video-state'), 'static');
});
