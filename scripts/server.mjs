import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSitemap } from '../src/seo.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicRoot = resolve(root, 'public');
const portArg = process.argv.indexOf('--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 4377);
const host = process.env.HOST || '127.0.0.1';
const mime = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return; }
    const normalized = path.replace(/\/index\.html$/, '/');
    if (path === '/sitemap.xml') {
      response.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : renderSitemap());
      return;
    }
    if (normalized !== path) {
      response.writeHead(301, { Location: normalized + new URL(request.url, 'http://localhost').search });
      response.end();
      return;
    }
    const route = { '/': 'home', '/projects/': 'projects', '/invite/': 'invite', '/404.html': '404' }[normalized];
    if (['/projects', '/invite'].includes(path)) { response.writeHead(301, { Location: path + '/' + new URL(request.url, 'http://localhost').search }); response.end(); return; }
    if (route) {
      // 修改渲染模板后刷新页面即可；数据与图标模块修改后重启服务。
      const templatePath = resolve(root, 'src/render.mjs');
      const version = (await stat(templatePath)).mtimeMs;
      const { renderPage } = await import(`../src/render.mjs?v=${version}`);
      response.writeHead(route === '404' ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : renderPage(route));
      return;
    }
    const file = resolve(publicRoot, '.' + path);
    if (!file.startsWith(publicRoot + sep)) { response.writeHead(404); response.end(); return; }
    try {
      const bytes = await readFile(file);
      response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch {
      const { renderPage } = await import('../src/render.mjs');
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : renderPage('404'));
    }
  } catch (error) {
    console.error(error);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('页面暂时无法加载，请刷新后重试。');
  }
});
server.listen(port, host, () => console.log(`BlackNico 本地预览：http://${host}:${port}/`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
