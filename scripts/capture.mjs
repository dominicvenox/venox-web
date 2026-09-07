#!/usr/bin/env node
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export const defaultConfig = Object.freeze({
  routes: ['/'],
  viewports: [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'small', width: 360, height: 640 },
  ],
  positions: [
    { name: 'start', progress: 0 }, { name: 'quarter', progress: 0.25 },
    { name: 'middle', progress: 0.5 }, { name: 'three-quarter', progress: 0.75 },
    { name: 'end', progress: 1 },
  ],
  reducedMotion: false,
});

function mapping(value, label, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`Unknown ${label} field: ${key}`);
}

export function validateCaptureConfig(input = {}) {
  mapping(input, 'config', ['routes', 'viewports', 'positions', 'reducedMotion']);
  const config = structuredClone({ ...defaultConfig, ...input });
  for (const [key, limit] of [['routes', 30], ['viewports', 10], ['positions', 30]]) {
    if (!Array.isArray(config[key]) || !config[key].length || config[key].length > limit) throw new Error(`${key} must be an array with 1–${limit} entries.`);
  }
  for (const route of config.routes) {
    if (typeof route !== 'string' || !route.startsWith('/') || route.startsWith('//') || /[\\\x00-\x20]/.test(route)) throw new Error('Routes must be origin-relative paths beginning with a single / and contain no spaces, controls, or backslashes.');
  }
  if (new Set(config.routes).size !== config.routes.length) throw new Error('Routes must be unique.');
  const checkName = (name, label) => {
    if (typeof name !== 'string' || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(name)) throw new Error(`${label} name must contain 1–64 lowercase letters, digits, underscores, or hyphens.`);
  };
  for (const viewport of config.viewports) {
    mapping(viewport, 'viewport', ['name', 'width', 'height']);
    checkName(viewport.name, 'Viewport');
    for (const key of ['width', 'height']) if (!Number.isInteger(viewport[key]) || viewport[key] < 240 || viewport[key] > 4096) throw new Error(`Viewport ${key} must be an integer from 240 through 4096.`);
  }
  for (const position of config.positions) {
    mapping(position, 'position', ['name', 'progress']);
    checkName(position.name, 'Position');
    if (typeof position.progress !== 'number' || !Number.isFinite(position.progress) || position.progress < 0 || position.progress > 1) throw new Error('Position progress must be a finite number from 0 through 1.');
  }
  for (const key of ['viewports', 'positions']) if (new Set(config[key].map(item => item.name)).size !== config[key].length) throw new Error(`${key} names must be unique.`);
  if (typeof config.reducedMotion !== 'boolean') throw new Error('reducedMotion must be a boolean.');
  return config;
}

function validateURL(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('--url must be an absolute HTTP or HTTPS URL.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('--url must use HTTP or HTTPS without embedded credentials.');
  return url;
}

export async function captureSite({ url, outputDirectory, config: input = {}, browserType = chromium }) {
  const baseURL = validateURL(url);
  // A direct page URL remains the target unless routes are explicitly supplied.
  const config = validateCaptureConfig({ ...input, routes: input.routes ?? [baseURL.pathname + baseURL.search + baseURL.hash] });
  if (typeof outputDirectory !== 'string' || !outputDirectory) throw new Error('--out is required.');
  await mkdir(path.resolve(outputDirectory), { recursive: true });
  const runDirectory = await mkdtemp(path.join(path.resolve(outputDirectory), 'capture-'));
  const report = {
    schemaVersion: 1, startedAt: new Date().toISOString(), url: baseURL.href, config,
    status: 'running', screenshotSucceeded: false, captures: [], visits: [], operationalErrors: [],
    methodology: 'Chromium navigation, bounded load/font readiness, scroll in configured order, two animation frames plus 120 ms settling, viewport screenshots. No clicks or form submissions.',
    untested: ['Keyboard and pointer interactions', 'Accessibility conformance and screen readers', 'Real-device behavior', 'Performance budgets and Core Web Vitals', 'Visual design quality', 'Animation timing and cleanup'],
  };
  let browser;
  try {
    browser = await browserType.launch();
    for (let routeIndex = 0; routeIndex < config.routes.length; routeIndex++) {
      const route = config.routes[routeIndex];
      const routeURL = new URL(route, baseURL.origin);
      if (routeURL.origin !== baseURL.origin) throw new Error(`Route changes the target origin: ${route}`);
      for (const viewport of config.viewports) {
        const visit = { route, viewport: viewport.name, url: routeURL.href, consoleErrors: [], pageErrors: [], failedRequests: [], httpErrors: [], readiness: {} };
        report.visits.push(visit);
        let context;
        try {
          context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, reducedMotion: config.reducedMotion ? 'reduce' : 'no-preference' });
          const page = await context.newPage();
          page.on('console', message => { if (message.type() === 'error') visit.consoleErrors.push({ text: message.text(), location: message.location() }); });
          page.on('pageerror', error => visit.pageErrors.push(error.message));
          page.on('requestfailed', request => visit.failedRequests.push({ url: request.url(), resourceType: request.resourceType(), error: request.failure()?.errorText || 'Unknown request failure' }));
          page.on('response', response => {
            const status = response.status();
            if ((status < 200 || status >= 300) && ![301, 302, 303, 304, 307, 308].includes(status)) visit.httpErrors.push({ url: response.url(), status, resourceType: response.request().resourceType() });
          });
          await page.goto(routeURL.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
          try { await page.waitForLoadState('load', { timeout: 5000 }); visit.readiness.load = true; }
          catch { visit.readiness.load = false; }
          visit.readiness.fonts = await page.evaluate(() => Promise.race([
            document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 2000)),
          ]));
          for (let positionIndex = 0; positionIndex < config.positions.length; positionIndex++) {
            const position = config.positions[positionIndex];
            const shot = { route, viewport: viewport.name, position: position.name, progress: position.progress, screenshotSucceeded: false };
            report.captures.push(shot);
            try {
              await page.evaluate(progress => {
                const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
                scrollTo({ top: maxScroll * progress, left: 0, behavior: 'instant' });
              }, position.progress);
              await page.evaluate(() => Promise.race([
                new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))),
                new Promise(resolve => setTimeout(resolve, 1000)),
              ]));
              await page.waitForTimeout(120);
              shot.measurements = await page.evaluate(() => {
                const root = document.documentElement;
                const horizontalOverflow = Math.max(0, root.scrollWidth - root.clientWidth);
                const overflowElements = horizontalOverflow <= 1 ? [] : [...document.querySelectorAll('body *')].map(element => {
                  const rect = element.getBoundingClientRect();
                  if (!rect.width || !rect.height || (rect.left >= -1 && rect.right <= root.clientWidth + 1)) return null;
                  return { element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${typeof element.className === 'string' ? '.' + element.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).join('.') : ''}`.replace(/\.$/, ''), left: rect.left, right: rect.right, width: rect.width };
                }).filter(Boolean).slice(0, 50);
                return { scrollX, scrollY, viewportWidth: innerWidth, viewportHeight: innerHeight, clientWidth: root.clientWidth, documentWidth: root.scrollWidth, documentHeight: root.scrollHeight, maxScrollY: Math.max(0, root.scrollHeight - innerHeight), horizontalOverflow, overflowElements };
              });
              shot.screenshot = `${String(routeIndex + 1).padStart(2, '0')}-${viewport.name}-${String(positionIndex + 1).padStart(2, '0')}-${position.name}.png`;
              const buffer = await page.screenshot({ fullPage: false, caret: 'hide', timeout: 10000 });
              await writeFile(path.join(runDirectory, shot.screenshot), buffer, { flag: 'wx' });
              shot.screenshotSucceeded = true;
            } catch (error) {
              shot.error = error.message;
              report.operationalErrors.push({ route, viewport: viewport.name, position: position.name, error: error.message });
            }
          }
          // Stop collecting before closing so intentional teardown does not appear as request failure.
          page.removeAllListeners('console'); page.removeAllListeners('pageerror'); page.removeAllListeners('requestfailed'); page.removeAllListeners('response');
        } catch (error) { report.operationalErrors.push({ route, viewport: viewport.name, error: error.message }); }
        finally { if (context) await context.close().catch(error => report.operationalErrors.push({ route, viewport: viewport.name, error: `Context cleanup: ${error.message}` })); }
      }
    }
  } catch (error) { report.operationalErrors.push({ error: error.message }); }
  finally { if (browser) await browser.close().catch(error => report.operationalErrors.push({ error: `Browser cleanup: ${error.message}` })); }
  report.finishedAt = new Date().toISOString();
  report.screenshotSucceeded = report.captures.length === config.routes.length * config.viewports.length * config.positions.length && report.captures.every(shot => shot.screenshotSucceeded);
  report.findingCount = report.visits.reduce((total, visit) => total + visit.consoleErrors.length + visit.pageErrors.length + visit.failedRequests.length + visit.httpErrors.length, 0)
    + report.captures.filter(shot => shot.measurements?.horizontalOverflow > 1).length;
  report.exitCode = report.operationalErrors.length || !report.screenshotSucceeded ? 1 : report.findingCount ? 2 : 0;
  report.status = report.exitCode === 1 ? 'operational-failure' : report.exitCode === 2 ? 'completed-with-findings' : 'completed';
  const reportFile = path.join(runDirectory, 'report.json');
  await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`, { flag: 'wx' });
  return { report, reportFile, runDirectory, exitCode: report.exitCode };
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) {
    console.log(`Usage: node scripts/capture.mjs --url URL --out DIR [--config FILE]\nCreates a fresh capture-* directory inside DIR. Explicit routes are origin-relative; otherwise captures the supplied URL path.\nConfig fields: routes, viewports [{name,width,height}], positions [{name,progress}], reducedMotion.\nNames use lowercase letters/digits/_/-. Positions run in supplied order; progress is 0..1.\nDefault viewports: 1440×900, 390×844, 360×640. Default progress: 0, .25, .5, .75, 1.\nExit 0: captures completed without observed findings; 2: completed with findings; 1: operational failure.\nUse an output directory outside your served website. Reports may include target URLs and browser messages.`);
    return 0;
  }
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--url', '--out', '--config'].includes(key) || !args[i + 1] || flags[key]) throw new Error(`Unknown, repeated, or incomplete argument: ${key}`);
    flags[key] = args[++i];
  }
  if (!flags['--url'] || !flags['--out']) throw new Error('--url and --out are required. See --help.');
  const config = flags['--config'] ? JSON.parse(await readFile(flags['--config'], 'utf8')) : {};
  const result = await captureSite({ url: flags['--url'], outputDirectory: flags['--out'], config });
  console.log(`${result.report.status}: ${result.reportFile}`);
  return result.exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => { process.exitCode = code; }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
