import { mkdir, writeFile, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from '../src/render.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
await mkdir(output, { recursive: true });
await cp(resolve(root, 'public'), output, { recursive: true });
for (const [file, page] of [['index.html', 'home'], ['projects/index.html', 'projects'], ['invite/index.html', 'invite'], ['404.html', '404']]) {
  const target = resolve(output, file);
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, renderPage(page));
}
console.log('已生成 dist/ 静态网站（无需应用服务器或数据库）。');
