const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const themeButton = $('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let themePreference;
try { themePreference = localStorage.getItem('blacknico-theme'); } catch {}
function updateThemeLabel() {
  themeButton?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换浅色模式' : '切换深色模式');
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1d211e' : '#f7f6f2');
  updateThemeLabel();
}
updateThemeLabel();
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  themePreference = theme;
  applyTheme(theme);
  try { localStorage.setItem('blacknico-theme', theme); } catch {}
});
systemTheme.addEventListener('change', event => {
  if (!['light', 'dark'].includes(themePreference)) applyTheme(event.matches ? 'dark' : 'light');
});
window.addEventListener('storage', event => {
  if (event.key === 'blacknico-theme' || event.key === null) {
    themePreference = event.newValue;
    applyTheme(['light', 'dark'].includes(themePreference) ? themePreference : (systemTheme.matches ? 'dark' : 'light'));
  }
});

const mobileMenu = $('.mobile-menu');
const siteHeader = $('#site-header');
const headerNav = $('#header-nav');
mobileMenu?.addEventListener('click', event => {
  const open = siteHeader.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  if (open && event.detail === 0) headerNav.querySelector('a')?.focus();
});
function closeMenu() {
  siteHeader?.classList.remove('open');
  mobileMenu?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('aria-label', '打开导航');
}
$$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
siteHeader?.addEventListener('focusout', event => {
  if (!siteHeader.contains(event.relatedTarget)) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && siteHeader?.classList.contains('open')) {
    closeMenu();
    mobileMenu?.focus();
  }
  if (event.key === 'ArrowDown' && event.target === mobileMenu) {
    event.preventDefault();
    if (!siteHeader.classList.contains('open')) mobileMenu.click();
    headerNav.querySelector('a')?.focus();
  }
});
window.matchMedia('(max-width: 900px)').addEventListener('change', closeMenu);

if (document.body.dataset.page === 'home') {
  const sections = [$('#sites'), $('#featured'), $('#writing'), $('#about')].filter(Boolean);
  let navFrame = 0;
  function updateNavigation() {
    navFrame = 0;
    const marker = siteHeader.getBoundingClientRect().height + 48;
    const section = sections.findLast(section => section.getBoundingClientRect().top <= marker);
    const current = section?.id === 'featured' ? 'projects' : section?.id === 'about' ? 'home' : section?.id || 'home';
    $$('.nav-link').forEach(link => {
      const active = link.dataset.nav === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  function scheduleNavigation() {
    if (!navFrame) navFrame = requestAnimationFrame(updateNavigation);
  }
  window.addEventListener('scroll', scheduleNavigation, { passive: true });
  window.addEventListener('resize', scheduleNavigation);
  window.addEventListener('pageshow', scheduleNavigation);
  document.fonts.ready.then(scheduleNavigation);
  updateNavigation();
}

if ($('#project-search')) {
  const input = $('#project-search');
  let category = 'all';
  const cards = $$('[data-project]');
  const validCategories = $$('[data-filter]').map(button => button.dataset.filter);
  let urlTimer;
  function saveFilterUrl() {
    const params = new URLSearchParams(location.search);
    if (category !== 'all') params.set('category', category); else params.delete('category');
    if (input.value.trim()) params.set('q', input.value.trim()); else params.delete('q');
    const url = location.pathname + (params.size ? `?${params}` : '') + location.hash;
    try { history.replaceState(null, '', url); } catch { /* 筛选仍然可用。 */ }
  }
  function filterProjects(updateUrl = true) {
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const card of cards) {
      card.hidden = !((category === 'all' || card.dataset.category === category) && (!query || card.dataset.search.includes(query)));
      if (!card.hidden) visible++;
    }
    $$('[data-filter]').forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('#result-count').textContent = `${visible} 个项目`;
    $('#empty-state').hidden = visible > 0;
    if (updateUrl) {
      clearTimeout(urlTimer);
      urlTimer = setTimeout(saveFilterUrl, 150);
    }
  }
  function restoreFilters() {
    clearTimeout(urlTimer);
    const params = new URLSearchParams(location.search);
    category = validCategories.includes(params.get('category')) ? params.get('category') : 'all';
    input.value = params.get('q') || '';
    filterProjects(false);
  }
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; filterProjects(); }));
  input.addEventListener('input', () => filterProjects());
  input.addEventListener('change', () => { clearTimeout(urlTimer); saveFilterUrl(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); input.value = ''; filterProjects(); }
  });
  $('#reset-filters').addEventListener('click', () => { category = 'all'; input.value = ''; filterProjects(); input.focus(); });
  window.addEventListener('popstate', restoreFilters);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
      event.preventDefault(); input.focus();
    }
  });
  restoreFilters();
}

let toastTimer;
const copyTimers = new WeakMap();
async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* 使用兼容复制作为后备。 */ }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;left:-9999px;top:0;';
  const previous = document.activeElement;
  document.body.append(textarea);
  textarea.select();
  let succeeded = false;
  try { succeeded = document.execCommand('copy'); }
  finally { textarea.remove(); previous?.focus({ preventScroll: true }); }
  if (!succeeded) throw new Error('copy failed');
}
$$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const toast = $('#copy-toast');
  const label = button.getAttribute('aria-label');
  const originalLabel = button.dataset.copyLabel || label;
  button.dataset.copyLabel = originalLabel;
  clearTimeout(copyTimers.get(button));
  const restoreFocus = document.activeElement === button;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  try {
    await copyText(button.dataset.copy);
    button.classList.add('copied');
    button.querySelector('span').textContent = '已复制';
    button.setAttribute('aria-label', `已复制 ${button.dataset.copy}`);
    toast.textContent = `邀请码 ${button.dataset.copy} 已复制`;
    copyTimers.set(button, setTimeout(() => { button.classList.remove('copied'); button.querySelector('span').textContent = '复制'; button.setAttribute('aria-label', originalLabel); }, 2200));
  } catch {
    button.classList.remove('copied');
    button.querySelector('span').textContent = '复制';
    button.setAttribute('aria-label', originalLabel);
    const code = button.closest('.code-row').querySelector('code');
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    toast.textContent = '自动复制未成功，请选中邀请码手动复制。';
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    if (restoreFocus) button.focus({ preventScroll: true });
  }
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}));
