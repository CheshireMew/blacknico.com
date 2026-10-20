import { mkdir, writeFile, cp } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from '../src/render.mjs';
import { pages, renderSitemap } from '../src/seo.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
await mkdir(output, { recursive: true });
await cp(resolve(root, 'public'), output, { recursive: true });
const documents = Object.entries(pages).map(([name, page]) => [page.path.slice(1) + 'index.html', name]);
for (const [file, page] of [...documents, ['404.html', '404']]) {
  const target = resolve(output, file);
  await mkdir(resolve(target, '..'), { recursive: true });
  await writeFile(target, renderPage(page));
}
await writeFile(resolve(output, 'sitemap.xml'), renderSitemap());
console.log('已生成 dist/ 静态网站（无需应用服务器或数据库）。');
