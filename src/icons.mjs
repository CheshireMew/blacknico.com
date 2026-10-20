const paths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  pen: '<path d="m15 4 5 5M4 15 15 4a3.5 3.5 0 0 1 5 5L9 20l-6 1Z"/><path d="m4 15 5 5"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8H8a3 3 0 1 1 3-3Zm0 0h4a3 3 0 1 0-3-3Z"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  external: '<path d="M7 17 17 7M7 7h10v10"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  book: '<path d="M12 5C9 3 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Zm0 0v15"/>',
  bag: '<path d="M5 7h14l2 14H3ZM8 7V6a4 4 0 0 1 8 0v1"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-3c3.4-.4 7-1.6 7-7a5.5 5.5 0 0 0-1.5-3.8A5 5 0 0 0 19.4 1S18 1 15 2.5a13 13 0 0 0-6 0C6 1 4.6 1 4.6 1a5 5 0 0 0-.1 3.2A5.5 5.5 0 0 0 3 8c0 5.4 3.6 6.6 7 7a3.5 3.5 0 0 0-1 3v4"/>',
  x: '<path d="m4 3 16 18h-4L1 3Zm16 0L4 21"/>',
  telegram: '<path d="m22 3-4 18-6-5-4 4 1-7 9-6-11 5-5-2Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  moon: '<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  spark: '<path d="m12 2 2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7Z"/>',
  binance: '<path fill="currentColor" stroke="none" d="m12 1 4.2 4.2-2.5 2.5L12 6l-1.7 1.7-2.5-2.5ZM1 12l4.2-4.2 2.5 2.5L6 12l1.7 1.7-2.5 2.5Zm22 0-4.2 4.2-2.5-2.5L18 12l-1.7-1.7 2.5-2.5ZM12 23l-4.2-4.2 2.5-2.5L12 18l1.7-1.7 2.5 2.5Zm0-15 4 4-4 4-4-4Z"/>',
  okx: '<path fill="currentColor" stroke="none" d="M2 2h6v6H2zm14 0h6v6h-6zM9 9h6v6H9zM2 16h6v6H2zm14 0h6v6h-6z"/>'
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}
export const catMark = `<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M8 26 7 8l12 8a26 26 0 0 1 10 0l12-8-1 18c0 11-7 17-16 17S8 37 8 26Z" fill="currentColor"/><path d="m14 27 6 2m8 0 6-2" stroke="var(--paper,#f7f6f2)" stroke-width="2.8" stroke-linecap="round"/><path d="m22 34 2 2 2-2" stroke="var(--paper,#f7f6f2)" stroke-width="2" stroke-linecap="round"/></svg>`;
