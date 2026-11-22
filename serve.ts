// Ember Court — a tiny static server for local play-testing.
// Serves game/ at http://localhost:8080 so the game can be opened in a
// desktop browser. Node 22 standard library only; run with `node serve.ts`.

import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, 'game');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer((request, response) => {
  const path = request.url === '/' ? '/index.html' : (request.url ?? '/index.html').split('?')[0];
  const file = join(root, path);
  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end('forbidden');
    return;
  }
  response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).on('error', () => {
    response.writeHead(404);
    response.end('not found');
  }).pipe(response);
});

server.listen(8080, () => {
  console.log('Ember Court at http://localhost:8080');
});
