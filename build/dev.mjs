// Jednostavan lokalni server: `npm run dev` služi src/, `npm run preview` služi dist/.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, normalize, resolve } from 'node:path';

const root = process.argv.includes('--dist') ? 'dist' : 'src';
const port = Number(process.env.PORT) || 5180;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = resolve(root, '.' + normalize(path.endsWith('/') ? path + 'index.html' : path));
  try {
    if (!file.startsWith(resolve(root))) throw new Error('outside root');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, () => console.log(`→ http://localhost:${port}  (${root}/)`));
