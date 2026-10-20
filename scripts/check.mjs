import assert from 'node:assert/strict';
import { stat, readFile } from 'node:fs/promises';
import { renderPage, projects } from '../src/render.mjs';
import github from '../src/data/github.json' with { type: 'json' };
import { referrals, websites, articles } from '../src/data/site.mjs';
import articleLinks from '../src/data/article-links.json' with { type: 'json' };

assert.equal(projects.length, github.repos.length);
assert.equal(new Set(projects.map(project => project.name)).size, projects.length);
assert.ok(projects.every(project => project.description && project.tags.length));
assert.ok(projects.every(project => !project.fork || project.category === 'forks'));
assert.ok(articles.every(article => articleLinks.some(link => link.title === article.title && link.url !== article.url)));
assert.ok((await stat(new URL('../public/images/social-card.png', import.meta.url))).isFile());
assert.deepEqual(referrals.map(r => r.url), [
  'https://binance.com/join?ref=SRXT5KUM',
  'https://okx.com/join/A999998',
  'https://web3.okx.com/ul/joindex?ref=1234567',
  'https://web3.binance.com/referral?ref=RP3AEJ2M'
]);
assert.deepEqual(referrals.flatMap(r => r.codes.map(c => c.value)), ['SRXT5KUM', '416378774', 'A999998', '1234567', 'RP3AEJ2M']);
for (const page of ['home', 'projects', 'invite', '404']) {
  const html = renderPage(page);
  assert.ok(html.includes('<h1'));
  assert.ok(!html.includes('undefined'));
  assert.ok(!html.includes('http://'));
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `Duplicate IDs: ${page}`);
  for (const match of html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
    const path = match[1];
    if (['/', '/projects/', '/invite/', '/404.html'].includes(path)) continue;
    assert.ok((await stat(new URL(`../public${path}`, import.meta.url))).isFile(), `Missing asset ${path}`);
  }
}
const invite = renderPage('invite');
for (const referral of referrals) {
  assert.ok(invite.includes(referral.url.replaceAll('&', '&amp;')));
  for (const code of referral.codes) assert.ok(invite.includes(`data-copy="${code.value}"`));
}
const home = renderPage('home');
for (const website of websites) assert.ok(home.includes(website.url));
console.log(`通过：${projects.length} 个公开项目、${websites.length} 个子站入口、3 篇真实文章、4 个邀请链接与 5 个邀请码，页面与素材完整。`);
