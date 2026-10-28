(() => {
  let preference;
  try { preference = localStorage.getItem('blacknico-theme'); } catch {}
  const theme = ['light', 'dark'].includes(preference)
    ? preference
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1d211e' : '#f7f6f2');
})();
