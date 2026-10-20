import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { renderPage, projects } from '../src/render.mjs';
import { renderSitemap } from '../src/seo.mjs';

const expected = [
  ['home', 'https://blacknico.com/', 'ProfilePage'],
  ['projects', 'https://blacknico.com/projects/', 'CollectionPage'],
  ['invite', 'https://blacknico.com/invite/', 'WebPage']
];
const titles = [], descriptions = [];
const value = (html, attribute, name) => html.match(new RegExp(`<meta ${attribute}="${name}" content="([^"]+)"`))?.[1];
for (const [page, url, type] of expected) {
  const html = renderPage(page);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = value(html, 'name', 'description');
  assert.ok(title && title.includes('BlackNico'), `Missing useful title: ${page}`);
  assert.ok(description && description.length >= 40, `Missing useful description: ${page}`);
  titles.push(title); descriptions.push(description);
  assert.equal(value(html, 'property', 'og:title'), title);
  assert.equal(value(html, 'property', 'og:description'), description);
  assert.equal(value(html, 'name', 'twitter:title'), title);
  assert.equal(value(html, 'name', 'twitter:description'), description);
  assert.equal(value(html, 'property', 'og:url'), url);
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], url);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(!value(html, 'name', 'robots').includes('noindex'));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const graph = schema['@graph'];
  assert.equal(graph.filter(node => node['@type'] === type).length, 1);
  assert.equal(graph.filter(node => node['@type'] === 'ProfilePage').length, page === 'home' ? 1 : 0);
  const webpage = graph.find(node => node['@id'] === url + '#webpage');
  assert.equal(webpage.url, url);
  assert.equal(webpage.description, description);
  assert.ok(graph.some(node => node['@type'] === 'WebSite' && node.name === 'BlackNico'));
  assert.ok(graph.some(node => node['@type'] === 'Person' && node.name === '柴郡'));
  if (page !== 'home') {
    const breadcrumb = graph.find(node => node['@type'] === 'BreadcrumbList');
    assert.equal(breadcrumb.itemListElement[1].item, url);
  }
  if (page === 'projects') {
    assert.equal((html.match(/data-project /g) || []).length, projects.length);
    const list = graph.find(node => node['@type'] === 'ItemList');
    assert.equal(list.numberOfItems, projects.length);
    assert.equal(list.itemListElement.length, projects.length);
    assert.ok(list.itemListElement.every(row => row.item.codeRepository.startsWith('https://github.com/CheshireMew/')));
  }
}
assert.equal(new Set(titles).size, 3, 'Pages must have distinct titles');
assert.equal(new Set(descriptions).size, 3, 'Pages must have distinct descriptions');
const sitemap = renderSitemap();
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(locations, expected.map(row => row[1]));
assert.equal((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length, 3);
assert.ok(locations.every(url => !url.includes('404') && !url.includes('?') && !url.includes('www.')));
const robots = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8');
assert.ok(robots.includes('Sitemap: https://blacknico.com/sitemap.xml'));
assert.ok(!robots.includes('Disallow: /'));
const notFound = renderPage('404');
assert.ok(notFound.includes('noindex'));
assert.ok(!notFound.includes('rel="canonical"'));
assert.ok(!notFound.includes('application/ld+json'));
const invite = renderPage('invite');
assert.equal((invite.match(/rel="sponsored noopener noreferrer"/g) || []).length, 4);
assert.ok(invite.includes('30%'));
const html = renderPage('home');
assert.ok(html.includes('puppetloom.webp') && html.includes('mediaflow.webp'));
for (const name of ['puppetloom', 'mediaflow']) {
  const webp = await stat(new URL(`../public/images/projects/${name}.webp`, import.meta.url));
  const png = await stat(new URL(`../public/images/projects/${name}.png`, import.meta.url));
  assert.ok(webp.size < png.size * .2, `${name}: image reduction below 80%`);
}
console.log('SEO 检查通过：独立标题与简介、完整分享信息、页面结构化数据、39 个源码条目、三页站点地图、404 与优惠链接、轻量项目封面。');
