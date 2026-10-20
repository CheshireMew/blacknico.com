const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const themeButton = $('.theme-toggle');
function updateThemeLabel() {
  themeButton?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换浅色模式' : '切换深色模式');
}
updateThemeLabel();
themeButton?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('blacknico-theme', theme); } catch {}
  updateThemeLabel();
});

const mobileMenu = $('.mobile-menu');
mobileMenu?.addEventListener('click', () => {
  const open = $('#sidebar').classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(open));
  mobileMenu.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
});
function closeMenu() {
  $('#sidebar').classList.remove('open');
  mobileMenu?.setAttribute('aria-expanded', 'false');
  mobileMenu?.setAttribute('aria-label', '打开导航');
}
$$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.sidebar')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

if (document.body.dataset.page === 'home') {
  const sections = [$('#sites'), $('#writing')].filter(Boolean);
  const observer = new IntersectionObserver(() => {
    const section = sections.find(section => { const rect = section.getBoundingClientRect(); return rect.top < window.innerHeight * .45 && rect.bottom > window.innerHeight * .25; });
    const current = section?.id || 'home';
    $$('.nav-link').forEach(link => {
      const active = link.dataset.nav === current;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }, { threshold: [0, .2, .5, .8, 1] });
  sections.forEach(section => observer.observe(section));
}

if ($('#project-search')) {
  const input = $('#project-search');
  let category = 'all';
  const cards = $$('[data-project]');
  const validCategories = $$('[data-filter]').map(button => button.dataset.filter);
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
      const params = new URLSearchParams();
      if (category !== 'all') params.set('category', category);
      if (query) params.set('q', input.value.trim());
      history.replaceState(null, '', location.pathname + (params.size ? `?${params}` : ''));
    }
  }
  function restoreFilters() {
    const params = new URLSearchParams(location.search);
    category = validCategories.includes(params.get('category')) ? params.get('category') : 'all';
    input.value = params.get('q') || '';
    filterProjects(false);
  }
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; filterProjects(); }));
  input.addEventListener('input', () => filterProjects());
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
  const succeeded = document.execCommand('copy');
  textarea.remove();
  previous?.focus();
  if (!succeeded) throw new Error('copy failed');
}
$$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const toast = $('#copy-toast');
  try {
    await copyText(button.dataset.copy);
    button.classList.add('copied');
    button.querySelector('span').textContent = '已复制';
    button.setAttribute('aria-label', `已复制 ${button.dataset.copy}`);
    toast.textContent = `邀请码 ${button.dataset.copy} 已复制`;
    setTimeout(() => { button.classList.remove('copied'); button.querySelector('span').textContent = '复制'; button.setAttribute('aria-label', `复制邀请码 ${button.dataset.copy}`); }, 2200);
  } catch {
    toast.textContent = '自动复制未成功，请选中邀请码手动复制。';
  }
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}));
