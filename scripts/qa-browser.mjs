import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'D:/Tools/npm-global/node_modules/playwright');
const evidence = process.env.QA_DIR || 'D:/Tools/blacknico-site-qa';
await mkdir(evidence, { recursive: true });
const base = process.env.BASE_URL || 'http://127.0.0.1:4377';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${evidence}/home-desktop.png`, fullPage: true });
  assert.equal(await page.locator('.site-card').count(), 5);
  assert.ok(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)));
  await page.getByRole('button', { name: '切换深色模式' }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.screenshot({ path: `${evidence}/home-dark.png`, fullPage: true });
  await page.getByRole('button', { name: '切换浅色模式' }).click();
  await page.goto(`${base}/projects/`, { waitUntil: 'networkidle' });
  const total = await page.locator('[data-project]').count();
  assert.equal(total, 39);
  await page.locator('[data-filter="skills"]').click();
  assert.ok((await page.locator('[data-project]:visible').count()) > 0);
  assert.ok(await page.locator('[data-project]:visible').evaluateAll(cards => cards.every(card => card.dataset.category === 'skills')));
  await page.locator('[data-filter="all"]').click();
  await page.getByRole('searchbox').fill('PuppetLoom');
  assert.equal(await page.locator('[data-project]:visible').count(), 1);
  await page.getByRole('searchbox').fill('never-found-blacknico');
  assert.ok(await page.locator('#empty-state').isVisible());
  await page.locator('#reset-filters').click();
  assert.equal(await page.locator('[data-project]:visible').count(), total);
  await page.goto(`${base}/projects/?category=forks`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-project]:visible').count(), 2);
  await page.goto(`${base}/projects/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${evidence}/projects-desktop.png`, fullPage: true });
  await page.goto(`${base}/invite/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-copy]').count(), 5);
  for (const button of await page.locator('[data-copy]').all()) {
    const value = await button.getAttribute('data-copy');
    await button.click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), value);
  }
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo({ top: 0, behavior: 'instant' }); });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${evidence}/invite-desktop.png`, fullPage: true });
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['/', '/projects/', '/invite/']) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow: ${path} @ ${width}`);
      if (width === 390) await page.screenshot({ path: `${evidence}/${path === '/' ? 'home' : path.replaceAll('/', '')}-mobile.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '打开导航' }).click();
  assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'true');
  await page.locator('.main-nav').getByRole('link', { name: '邀请福利' }).click();
  await page.waitForURL('**/invite/');
  assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'false');
  assert.equal(errors.length, 0, errors.join('\n'));
  const report = { passed: true, projects: total, pages: ['/', '/projects/', '/invite/'], viewportWidths: [1440, 768, 390, 320], copyButtons: 5, consoleErrors: errors, screenshots: evidence };
  await writeFile(`${evidence}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
