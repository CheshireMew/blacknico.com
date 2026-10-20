try {
  const theme = localStorage.getItem('blacknico-theme');
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark';
} catch { /* 存储不可用时保持默认的浅色主题。 */ }
