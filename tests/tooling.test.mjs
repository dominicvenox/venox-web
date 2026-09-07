import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { unzipSync } from 'fflate';
import { validateSkill } from '../scripts/validate.mjs';
import { packSkill } from '../scripts/pack.mjs';
import { validateCaptureConfig, captureSite } from '../scripts/capture.mjs';
import { createPreviewServer } from '../scripts/serve.mjs';

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'venox-tools-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const root = path.join(directory, 'venox-website');
  await mkdir(path.join(root, 'agents'), { recursive: true });
  await mkdir(path.join(root, 'references'));
  await writeFile(path.join(root, 'SKILL.md'), '---\nname: venox-website\ndescription: Create and improve websites.\nlicense: MIT\n---\n# Venox\nRead [design](references/design.md).\n');
  await writeFile(path.join(root, 'agents/openai.yaml'), 'interface:\n  display_name: Venox Website\n  short_description: Build thoughtful websites\n  default_prompt: Use $venox-website to build a website.\npolicy:\n  allow_implicit_invocation: true\n');
  await writeFile(path.join(root, 'references/design.md'), '# Design\nUse real content.\n');
  for (const name of ['LICENSE']) await writeFile(path.join(root, name), 'Original test fixture.\n');
  return { root, directory };
}

test('portable metadata and local reference validation accept a complete skill', async t => {
  const { root } = await fixture(t);
  const result = await validateSkill(root);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(result.name, 'venox-website');
  assert.equal(result.files.length, 4);
});

test('validator rejects broken references and encoded package traversal', async t => {
  const { root, directory } = await fixture(t);
  await writeFile(path.join(directory, 'outside.md'), 'Private fixture');
  await writeFile(path.join(root, 'references/design.md'), '[missing](missing.md)\n[escape](../../outside.md)\n[encoded](%2e%2e/%2e%2e/outside.md)\n');
  const result = await validateSkill(root);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(error => error.includes('Missing linked resource')));
  assert.equal(result.errors.filter(error => error.includes('escapes')).length, 2);
});

test('validator rejects relative import failures and duplicate YAML keys', async t => {
  const { root } = await fixture(t);
  await writeFile(path.join(root, 'example.js'), "import './absent.js';\n");
  assert.ok((await validateSkill(root)).errors.some(error => error.includes('absent.js')));
  await writeFile(path.join(root, 'agents/openai.yaml'), 'interface: {}\ninterface: {}\n');
  assert.ok((await validateSkill(root)).errors.some(error => error.includes('unique')));
});

test('validator rejects symlinks, scaffold markers, and non-string descriptions', async t => {
  const { root, directory } = await fixture(t);
  await writeFile(path.join(root, 'references/design.md'), 'TODO: finish design\n');
  const skill = await readFile(path.join(root, 'SKILL.md'), 'utf8');
  await writeFile(path.join(root, 'SKILL.md'), skill.replace('description: Create and improve websites.', 'description: [invalid]'));
  const invalid = await validateSkill(root);
  assert.ok(invalid.errors.some(error => error.includes('scaffold')));
  assert.ok(invalid.errors.some(error => error.includes('Description')));
  await symlink(directory, path.join(root, 'escape'));
  assert.ok((await validateSkill(root)).errors.some(error => error.includes('Symlinks')));
});

test('pack creates exactly one skill root and refuses overwriting and unexpected files', async t => {
  const { root, directory } = await fixture(t);
  const outputFile = path.join(directory, 'skill.zip');
  const packed = await packSkill({ skillDirectory: root, outputFile });
  const archive = unzipSync(new Uint8Array(await readFile(outputFile)));
  assert.equal(packed.files, 4);
  assert.deepEqual(Object.keys(archive).sort(), [
    'venox-website/LICENSE', 'venox-website/SKILL.md',
    'venox-website/agents/openai.yaml', 'venox-website/references/design.md',
  ]);
  await assert.rejects(packSkill({ skillDirectory: root, outputFile }), /EEXIST/);
  await writeFile(path.join(root, '.env'), 'PRIVATE_FIXTURE=value\n');
  await assert.rejects(packSkill({ skillDirectory: root, outputFile: path.join(directory, 'other.zip') }), /sensitive/);
});

test('capture config has independent defaults and rejects unsafe or ambiguous fields', () => {
  const config = validateCaptureConfig();
  assert.deepEqual(config.viewports.map(view => [view.width, view.height]), [[1440, 900], [390, 844], [360, 640]]);
  config.routes.push('/another');
  assert.deepEqual(validateCaptureConfig().routes, ['/']);
  for (const invalid of [
    { routes: ['//example.com'] }, { routes: ['/\\example.com'] }, { routes: [] },
    { evaluate: 'alert(1)' }, { reducedMotion: 'false' },
    { viewports: [{ name: '../escape', width: 390, height: 844 }] },
    { viewports: [{ name: 'mobile', width: 0, height: 844 }] },
    { positions: [{ name: 'start', progress: NaN }] },
    { positions: [{ name: 'start', progress: 0 }, { name: 'start', progress: 1 }] },
  ]) assert.throws(() => validateCaptureConfig(invalid));
  assert.deepEqual(validateCaptureConfig({ positions: [{ name: 'end', progress: 1 }, { name: 'start', progress: 0 }] }).positions.map(position => position.progress), [1, 0]);
});

test('capture emits a report on browser launch failure and rejects credential URLs before launching', async t => {
  const { directory } = await fixture(t);
  const result = await captureSite({ url: 'http://localhost:4173', outputDirectory: directory, browserType: { launch() { throw new Error('Fixture browser unavailable'); } } });
  assert.equal(result.exitCode, 1);
  assert.equal(result.report.screenshotSucceeded, false);
  assert.equal(result.report.status, 'operational-failure');
  assert.match((JSON.parse(await readFile(result.reportFile, 'utf8'))).operationalErrors[0].error, /Fixture browser unavailable/);
  await assert.rejects(captureSite({ url: 'http://user:password@localhost', outputDirectory: directory }), /credentials/);
});

test('preview server has MIME, media ranges, and contained read-only routing', async t => {
  const { root, directory } = await fixture(t);
  await writeFile(path.join(root, 'index.html'), '<h1>Fixture</h1>');
  await mkdir(path.join(root, 'nested'));
  await writeFile(path.join(root, 'nested/index.html'), '<h1>Nested fixture</h1>');
  await writeFile(path.join(root, 'video.mp4'), '0123456789');
  await writeFile(path.join(directory, 'outside.txt'), 'must not be served');
  await symlink(path.join(directory, 'outside.txt'), path.join(root, 'outside.txt'));
  const server = createPreviewServer(root);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const document = await fetch(url);
  assert.equal(document.status, 200);
  assert.match(document.headers.get('content-type'), /^text\/html/);
  assert.equal(await document.text(), '<h1>Fixture</h1>');
  const redirect = await fetch(`${url}/nested?view=one`, { redirect: 'manual' });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get('location'), '/nested/?view=one');
  assert.equal(await (await fetch(`${url}/nested`)).text(), '<h1>Nested fixture</h1>');
  const range = await fetch(`${url}/video.mp4`, { headers: { Range: 'bytes=2-5' } });
  assert.equal(range.status, 206);
  assert.equal(await range.text(), '2345');
  assert.equal((await fetch(`${url}/outside.txt`)).status, 404);
  assert.equal((await fetch(`${url}/%2e%2e%2foutside.txt`)).status, 404);
  assert.equal((await fetch(url, { method: 'POST' })).status, 405);
});

test('Chromium capture separates screenshot success from overflow, HTTP, and runtime findings', async t => {
  const { directory } = await fixture(t);
  const server = createServer((request, response) => {
    if (request.url === '/missing.png') { response.writeHead(404); response.end(); return; }
    if (request.url === '/favicon.ico') { response.writeHead(204); response.end(); return; }
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end('<!doctype html><html><head><link rel="icon" href="data:,"></head><body style="margin:0"><h1>Capture fixture</h1><div style="height:1600px;width:800px">Wide content</div><img src="/missing.png" alt="Missing fixture"><script>console.error("Fixture console error");setTimeout(()=>{throw new Error("Fixture runtime error")},10)</script></body></html>');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const result = await captureSite({
    url: `http://127.0.0.1:${server.address().port}/nested/page?variant=one`, outputDirectory: directory,
    config: { viewports: [{ name: 'mobile', width: 390, height: 844 }], positions: [{ name: 'end', progress: 1 }, { name: 'start', progress: 0 }], reducedMotion: true },
  });
  assert.equal(result.exitCode, 2, JSON.stringify(result.report.operationalErrors));
  assert.equal(result.report.visits[0].url, `http://127.0.0.1:${server.address().port}/nested/page?variant=one`);
  assert.equal(result.report.screenshotSucceeded, true);
  assert.ok(result.report.captures.every(shot => shot.measurements.horizontalOverflow > 1));
  assert.ok(result.report.captures[0].measurements.scrollY > 0);
  assert.equal(result.report.captures[1].measurements.scrollY, 0);
  assert.ok(result.report.visits[0].httpErrors.some(error => error.status === 404));
  assert.ok(result.report.visits[0].consoleErrors.some(error => error.text.includes('Fixture console error')));
  assert.ok(result.report.visits[0].pageErrors.some(error => error.includes('Fixture runtime error')));
  const screenshot = await readFile(path.join(result.runDirectory, result.report.captures[0].screenshot));
  assert.equal(screenshot.subarray(1, 4).toString(), 'PNG');
  assert.ok(result.report.untested.some(item => item.includes('Accessibility')));
});
