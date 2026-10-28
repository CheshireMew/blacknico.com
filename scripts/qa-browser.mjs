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
const viewports = [1440, 1100, 901, 900, 768, 700, 390, 320];
async function capture(name) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' });
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    document.activeElement?.blur();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: `${evidence}/${name}.png`, fullPage: true, animations: 'disabled' });
}
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await capture('home-desktop');
  assert.equal(await page.locator('.hero img').count(), 0, '首页不应再由大插画占据首屏');
  const featuredTop = (await page.locator('.project-visual').first().boundingBox()).y;
  assert.ok(featuredTop < 700, `精选作品应该更早出现：${featuredTop}`);
  assert.equal(await page.locator('.site-card').count(), 5);
  assert.ok(await page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)));
  await page.getByRole('button', { name: '切换深色模式' }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await capture('home-dark');
  await page.getByRole('button', { name: '切换浅色模式' }).click();
  await page.goto(`${base}/projects/`, { waitUntil: 'networkidle' });
  const total = await page.locator('[data-project]').count();
  assert.equal(total, 39);
  await page.keyboard.press('/');
  assert.ok(await page.getByRole('searchbox').evaluate(input => input === document.activeElement));
  await page.locator('[data-filter="skills"]').click();
  assert.ok((await page.locator('[data-project]:visible').count()) > 0);
  assert.ok(await page.locator('[data-project]:visible').evaluateAll(cards => cards.every(card => card.dataset.category === 'skills')));
  await page.locator('[data-filter="all"]').click();
  await page.getByRole('searchbox').fill('PuppetLoom');
  assert.equal(await page.locator('[data-project]:visible').count(), 1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-project]:visible').count(), total);
  await page.getByRole('searchbox').fill('never-found-blacknico');
  assert.ok(await page.locator('#empty-state').isVisible());
  await page.locator('#reset-filters').click();
  assert.equal(await page.locator('[data-project]:visible').count(), total);
  await page.goto(`${base}/projects/?category=forks`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-project]:visible').count(), 2);
  await page.goto(`${base}/projects/?source=home#main`, { waitUntil: 'networkidle' });
  await page.getByRole('searchbox').fill('书籍');
  await page.waitForFunction(() => new URLSearchParams(location.search).get('q') === '书籍');
  assert.equal(new URL(page.url()).searchParams.get('source'), 'home');
  assert.equal(new URL(page.url()).hash, '#main');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.getByRole('searchbox').inputValue(), '书籍');
  await page.goto(`${base}/projects/`, { waitUntil: 'networkidle' });
  await capture('projects-desktop');
  await page.goto(`${base}/invite/`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('[data-copy]').count(), 5);
  for (const button of await page.locator('[data-copy]').all()) {
    const originalLabel = await button.getAttribute('aria-label');
    const value = await button.getAttribute('data-copy');
    await button.click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), value);
    assert.ok(await button.evaluate(control => control === document.activeElement));
    await page.waitForFunction(({ value, label }) => document.querySelector(`[data-copy="${value}"]`).getAttribute('aria-label') === label, { value, label: originalLabel });
  }
  await page.evaluate(() => document.querySelector('#copy-toast').classList.remove('show'));
  await capture('invite-desktop');
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['/', '/projects/', '/invite/']) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow: ${path} @ ${width}`);
      const tooSmall = await page.locator('button:visible, .icon-button:visible, .project-out:visible').evaluateAll(controls => controls.filter(control => { const rect = control.getBoundingClientRect(); return rect.width < 44 || rect.height < 44; }).map(control => control.getAttribute('aria-label') || control.textContent));
      assert.deepEqual(tooSmall, [], `Small controls: ${path} @ ${width}`);
      if (width === 390) await capture(`${path === '/' ? 'home' : path.replaceAll('/', '')}-mobile`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.locator('.mobile-menu').focus();
  await page.keyboard.press('Enter');
  assert.ok(await page.locator('.nav-link').first().evaluate(link => link === document.activeElement));
  await page.keyboard.press('Escape');
  assert.ok(await page.locator('.mobile-menu').evaluate(button => button === document.activeElement));
  assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: '打开导航' }).click();
  assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'true');
  await page.locator('.main-nav').getByRole('link', { name: '邀请福利' }).click();
  await page.waitForURL('**/invite/');
  assert.equal(await page.locator('.mobile-menu').getAttribute('aria-expanded'), 'false');
  await page.goto(base, { waitUntil: 'networkidle' });
  for (const [section, active] of [['sites', 'sites'], ['featured', 'projects'], ['writing', 'writing']]) {
    await page.evaluate(id => { const top = document.getElementById(id).getBoundingClientRect().top + scrollY - 96; window.scrollTo({ top, behavior: 'instant' }); }, section);
    await page.waitForFunction(id => document.querySelector(`[data-nav="${id}"]`).getAttribute('aria-current') === 'location', active);
  }

  const automatic = await browser.newContext({ colorScheme: 'dark' });
  const themePage = await automatic.newPage();
  await themePage.goto(base);
  assert.equal(await themePage.locator('html').getAttribute('data-theme'), 'dark');
  await themePage.emulateMedia({ colorScheme: 'light' });
  await themePage.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await themePage.getByRole('button', { name: '切换深色模式' }).click();
  await themePage.reload();
  assert.equal(await themePage.locator('html').getAttribute('data-theme'), 'dark');
  await automatic.close();

  const limited = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  await limited.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new Error('storage blocked'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new Error('storage blocked'); } });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('clipboard blocked')) } });
    document.execCommand = () => false;
  });
  const limitedPage = await limited.newPage();
  limitedPage.on('pageerror', error => errors.push(error.message));
  await limitedPage.goto(`${base}/invite/`);
  await limitedPage.getByRole('button', { name: '切换浅色模式' }).click();
  const copy = limitedPage.locator('[data-copy]').first();
  await copy.click();
  await limitedPage.waitForFunction(() => document.querySelector('#copy-toast').textContent.includes('手动复制'));
  assert.equal(await limitedPage.evaluate(() => getSelection().toString()), 'SRXT5KUM');
  assert.equal(await copy.isEnabled(), true);
  assert.ok(await copy.evaluate(control => control === document.activeElement));
  assert.equal(await limitedPage.locator('textarea').count(), 0);
  await limited.close();

  const noScript = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plainPage = await noScript.newPage();
  await plainPage.goto(base);
  assert.ok(await plainPage.locator('.nav-link').first().isVisible());
  await plainPage.locator('.main-nav').getByRole('link', { name: '作品', exact: true }).click();
  assert.equal(await plainPage.locator('[data-project]:visible').count(), total);
  assert.equal(await plainPage.locator('.project-toolbar').isVisible(), false);
  await noScript.close();
  assert.equal(errors.length, 0, errors.join('\n'));
  const report = { passed: true, projects: total, pages: ['/', '/projects/', '/invite/'], viewportWidths: viewports, featuredTop, copyButtons: 5, systemTheme: true, keyboardNavigation: true, clipboardFailure: true, blockedStorage: true, noJavaScript: true, consoleErrors: errors, screenshots: evidence };
  await writeFile(`${evidence}/report.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
