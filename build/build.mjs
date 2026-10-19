// Build: kopira src/ u dist/, minificira CSS/JS i dodaje hash u nazive (cache busting).
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';

const SRC = 'src';
const DIST = 'dist';

const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);

const minifyCss = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();

// JS se samo očisti od komentara na početku linija i praznih redova — sigurno bez parsera.
const tidyJs = (js) =>
  js
    .split('\n')
    .filter((l) => !/^\s*\/\//.test(l) && l.trim() !== '')
    .map((l) => l.trim())
    .join('\n');

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
await cp(SRC, DIST, { recursive: true });

let html = await readFile(join(DIST, 'index.html'), 'utf8');

for (const [file, transform] of [['css/style.css', minifyCss], ['js/main.js', tidyJs]]) {
  const out = transform(await readFile(join(DIST, file), 'utf8'));
  const hashed = file.replace(/(\.\w+)$/, `.${hash(out)}$1`);
  await writeFile(join(DIST, file), out);
  await rename(join(DIST, file), join(DIST, hashed));
  html = html.replace(`"${file}"`, `"${hashed}"`);
}

html = html.replace(/<!--(?!\[)[\s\S]*?-->/g, '').replace(/\n\s*\n+/g, '\n');
await writeFile(join(DIST, 'index.html'), html);

console.log('✓ dist/ spreman za objavu');
