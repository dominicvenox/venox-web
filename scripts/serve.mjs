#!/usr/bin/env node
import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inside } from './lib/package.mjs';

const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.png': 'image/png', '.json': 'application/json' };

export function createPreviewServer(directory) {
  const root = path.resolve(directory);
  return createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
      const requestedURL = new URL(request.url, 'http://localhost');
      const pathname = decodeURIComponent(requestedURL.pathname);
      if (pathname.includes('\\') || pathname.includes('\0')) throw new Error('Invalid path');
      let target = path.resolve(root, `.${pathname}`);
      if (!inside(root, target)) throw new Error('Path escapes preview directory');
      if ((await stat(target)).isDirectory()) {
        if (!pathname.endsWith('/')) {
          response.writeHead(308, { Location: `${requestedURL.pathname}/${requestedURL.search}` });
          response.end();
          return;
        }
        target = path.join(target, 'index.html');
      }
      if (!inside(await realpath(root), await realpath(target))) throw new Error('Symlink escapes preview directory');
      const bytes = await readFile(target);
      const headers = { 'Content-Type': mimeTypes[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' };
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]);
        const end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
        if (start >= bytes.length || start > end) { response.writeHead(416, { 'Content-Range': `bytes */${bytes.length}` }); response.end(); return; }
        response.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${bytes.length}` });
        response.end(request.method === 'HEAD' ? undefined : bytes.subarray(start, end + 1));
      } else {
        response.writeHead(200, { ...headers, 'Content-Length': bytes.length });
        response.end(request.method === 'HEAD' ? undefined : bytes);
      }
    } catch { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Not found'); }
  });
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes('--help')) { console.log('Usage: node scripts/serve.mjs [--port 4173]\nServes the canonical skill recipes on http://127.0.0.1:<port>.'); return; }
  let port = 4173;
  for (let i = 0; i < args.length; i++) {
    if (args[i] !== '--port' || !/^\d+$/.test(args[i + 1] || '')) throw new Error(`Unknown or incomplete argument: ${args[i]}`);
    port = Number(args[++i]);
    if (port < 1 || port > 65535) throw new Error('Port must be 1–65535.');
  }
  const root = fileURLToPath(new URL('../skills/venox-website/assets/recipes/', import.meta.url));
  const server = createPreviewServer(root);
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Recipe preview: http://127.0.0.1:${port}/layered-hero/`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close());
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
