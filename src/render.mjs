import github from './data/github.json' with { type: 'json' };
import articleLinks from './data/article-links.json' with { type: 'json' };
import { editorial, categories } from './data/editorial.mjs';
import { site, websites, articles, referrals } from './data/site.mjs';
import { icon, catMark } from './icons.mjs';
import { pages, renderSeoHead } from './seo.mjs';

export const projects = github.repos.map(repo => ({ ...repo, category: repo.fork ? 'forks' : 'apps', tags: [repo.language || '开源项目'], color: 'sage', ...editorial[repo.name] }));
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const ext = 'target="_blank" rel="noopener noreferrer"';
const external = (url, label, className = '') => `<a href="${escape(url)}" class="${className}" ${ext}>${label}</a>`;
const total = projects.length;
const count = category => projects.filter(p => p.category === category).length;
const sectionTitle = (title, action = '') => `<div class="section-heading"><h2>${title}</h2>${action}</div>`;
const more = (url, title) => `<a class="text-link" href="${url}">${title}${icon('arrow')}</a>`;

function siteHeader(page) {
  const nav = [
    ['home', '/', 'home', '首页'],
    ['sites', '/#sites', 'globe', '我的网站'],
    ['projects', '/projects/', 'grid', '作品'],
    ['writing', '/#writing', 'pen', '文章'],
    ['invite', '/invite/', 'gift', '邀请福利']
  ];
  return `<header class="site-header" id="site-header"><div class="header-inner">
    <a class="brand" href="/" aria-label="BlackNico 首页"><span class="brand-icon">${catMark}</span><span>blacknico<span class="brand-period">.</span></span></a>
    <nav class="main-nav" id="header-nav" aria-label="主导航">${nav.map(([id, url, symbol, label]) => `<a href="${url}" class="nav-link ${page === id ? 'active' : ''}" ${page === id ? 'aria-current="page"' : ''} data-nav="${id}">${icon(symbol)}<span>${label}</span></a>`).join('')}</nav>
    <div class="header-actions"><button type="button" class="theme-toggle icon-button" aria-label="切换深色模式">${icon('moon', 'moon-icon')}${icon('sun', 'sun-icon')}</button><button class="mobile-menu icon-button" type="button" aria-label="打开导航" aria-expanded="false" aria-controls="header-nav">${icon('menu', 'menu-open')}${icon('close', 'menu-close')}</button></div>
  </div></header>`;
}

function siteFooter() {
  return `<footer class="footer"><div class="footer-top"><a href="/#about" class="profile"><img src="/images/avatar.png" alt="柴郡的头像" width="40" height="40" loading="lazy"><strong>柴郡</strong></a><div class="socials">${external(site.github, icon('github') + '<span class="sr-only">GitHub</span>', 'icon-button')}${external(site.x, icon('x') + '<span class="sr-only">X / Twitter</span>', 'icon-button')}${external(site.telegram, icon('telegram') + '<span class="sr-only">Telegram</span>', 'icon-button')}</div></div><div class="footer-bottom"><small class="footer-copyright">© ${new Date().getFullYear()} BLACKNICO.COM</small><a href="#main" class="back-top">回到顶部 ${icon('arrow')}</a></div></footer>`;
}

function projectCard(project, featured = false) {
  const p = project;
  const isLink = Boolean(p.url && p.url !== p.homepage && !p.url.startsWith('https://github.com/'));
  // GitHub 原始仓库 URL 作为统一源码入口，编辑配置里的 url 可覆盖为真实网站入口。
  const repoUrl = github.repos.find(repo => repo.name === p.name).url;
  const url = isLink ? p.url : repoUrl;
  return `<article class="project-card ${featured ? 'featured-card' : ''}" data-project data-category="${p.category}" data-search="${escape([p.name, p.description, ...p.tags].join(' ').toLowerCase())}">
    ${featured ? `<a class="project-visual" href="${repoUrl}" ${ext} aria-label="在 GitHub 查看 ${escape(p.name)}"><img src="/images/projects/${p.image}" alt="${escape(p.name)} ${p.name === 'PuppetLoom' ? '官方项目封面' : '真实桌面工作区截图'}" width="960" height="540" loading="lazy" decoding="async"><span class="visual-arrow">${icon('external')}</span></a>` : ''}
    <div class="project-content"><div class="project-top"><h3>${external(url, escape(p.name))}${p.fork || p.archived ? `<span class="project-status">${[p.fork ? 'Fork' : '', p.archived ? '已归档' : ''].filter(Boolean).join(' · ')}</span>` : ''}</h3>${external(repoUrl, icon('github') + `<span class="sr-only">查看 ${escape(p.name)} 源码</span>`, 'project-out')}</div><p>${escape(p.description || '在 GitHub 查看这个项目的介绍与源码。')}</p>${isLink ? external(url, '访问网站 ' + icon('external'), 'project-visit') : ''}</div>
  </article>`;
}

function home() {
  const featured = ['PuppetLoom', 'MediaFlow-Pro'].map(name => projects.find(p => p.name === name));
  const extra = ['Glean', 'Heimdall', 'Bemo', 'FolioCross'].map(name => projects.find(p => p.name === name));
  return `<section class="hero" aria-labelledby="hero-title"><h1 id="hero-title">把好奇心，做成<span class="accent-word">点什么。</span></h1><div class="hero-bottom"><div class="hero-copy"><p><strong>你好，我是柴郡。</strong>关于 AI、创作与投资的作品和记录。</p></div><div class="hero-actions"><a class="button primary" href="/projects/">看看我的作品 ${icon('arrow')}</a><a class="button plain" href="#about">认识一下 ${icon('arrow')}</a></div></div></section>
  <section class="section sites-section" id="sites">${sectionTitle('我的网站')}<div class="site-grid">${websites.map(w => external(w.url, `<div class="site-title"><h3>${w.title}</h3>${icon('external', 'site-arrow')}</div><span class="site-domain">${w.domain}</span>`, 'site-card')).join('')}</div></section>
  <section class="section" id="featured">${sectionTitle('精选作品', more('/projects/', '全部项目'))}<div class="featured-grid">${featured.map(p => projectCard(p, true)).join('')}</div><div class="mini-project-grid">${extra.map(p => projectCard(p)).join('')}</div><a class="skill-banner" href="/projects/?category=skills"><span class="skill-banner-icon">${icon('spark')}</span><h3>Agent Skills</h3><span class="circle-arrow">${icon('arrow')}</span></a></section>
  <section class="section" id="writing">${sectionTitle('文章与记录', `<a class="text-link" href="https://blog.blacknico.com/" ${ext}>博客 ${icon('external')}</a>`)}<div class="writing-list">${articles.map(article => { const link = articleLinks.find(row => row.title === article.title); return `<a class="writing-row" href="${escape(link?.url || article.url)}" ${ext}><h3>${escape(article.title)}</h3>${icon('external')}</a>`; }).join('')}</div></section>
  <section class="about-section" id="about"><div class="about-copy"><h2>一个爱折腾的普通人。</h2><p>我在 AI、内容创作和投资之间来回探索。喜欢把日常遇到的问题做成工具，也把过程中的发现写下来。</p>${external(site.x, '在 X 上找到我 ' + icon('external'), 'text-link')}</div></section>
  <a class="invite-banner" href="/invite/"><span class="invite-banner-icon">${icon('gift')}</span><h3>交易所与 Web3 钱包邀请福利</h3><span class="invite-banner-link">${icon('arrow')}</span></a>`;
}

function projectsPage() {
  return `<section class="page-hero"><h1>项目与<span class="accent-text">作品。</span></h1></section><section class="projects-section" aria-labelledby="projects-title"><h2 id="projects-title" class="sr-only">公开项目</h2><div class="project-toolbar"><div class="filter-list" role="group" aria-label="项目分类">${categories.map(c => `<button type="button" class="filter-button ${c.id === 'all' ? 'selected' : ''}" data-filter="${c.id}" aria-pressed="${c.id === 'all'}">${c.label}<span>${c.id === 'all' ? total : count(c.id)}</span></button>`).join('')}</div><label class="search-field">${icon('search')}<input type="search" id="project-search" placeholder="搜索项目" aria-label="搜索项目" aria-describedby="result-count" aria-keyshortcuts="/" autocomplete="off"><kbd aria-hidden="true">/</kbd></label></div><div class="results-line"><span id="result-count" role="status" aria-live="polite" aria-atomic="true">${total} 个项目</span></div><div class="all-project-grid">${projects.map(p => projectCard(p)).join('')}</div><div class="empty-state" id="empty-state" hidden>${icon('search')}<h2>没有找到相关项目</h2><button type="button" class="button primary" id="reset-filters">查看全部项目</button></div></section>`;
}

function referralCard(referral) {
  const r = referral;
  return `<article class="referral-card ${r.color}"><div class="referral-header"><span class="exchange-logo">${icon(r.icon)}</span><h3>${r.name}</h3></div><div class="referral-benefit"><strong>${r.benefit}</strong><span>${r.benefitLabel}</span></div><div class="referral-codes">${r.codes.map(code => `<div class="code-row"><div><span>${code.label}</span><code>${code.value}</code></div><button class="copy-button" type="button" data-copy="${code.value}" aria-label="复制${r.name}${code.label} ${code.value}">${icon('copy', 'copy-idle')}${icon('check', 'copy-done')}<span>复制</span></button></div>`).join('')}</div><a class="button referral-button" href="${escape(r.url)}" target="_blank" rel="sponsored noopener noreferrer">${r.cta}${icon('external')}</a></article>`;
}

function invitePage() {
  return `<section class="page-hero invite-hero"><h1>少一点手续费，<span class="accent-text">多一份支持。</span></h1><p>通过邀请链接注册，支持我的创作。</p></section><p class="invite-terms">优惠以平台页面和账户实际显示为准；通过邀请注册或绑定，我可能获得返佣。</p><section class="section referral-section" id="exchanges">${sectionTitle('交易所邀请')}<div class="referral-grid">${referrals.filter(r => r.group === 'exchange').map(referralCard).join('')}</div></section><section class="section referral-section" id="wallets">${sectionTitle('Web3 钱包邀请')}<div class="referral-grid">${referrals.filter(r => r.group === 'wallet').map(referralCard).join('')}</div><p class="wallet-note">钱包优惠不含链上网络 Gas 费。</p></section><details class="referral-details"><summary>优惠与使用说明</summary><p>注册或绑定前，请核对对应邀请码与适用优惠。交易所注册、币安合约与 Web3 钱包使用各自的邀请码；已有账户能否绑定、适用产品、期限与地区，以平台页面为准。</p><p>加密资产价格会波动，请先了解产品及相关风险。</p></details><a class="learning-note" href="https://crypto.blacknico.com/" ${ext}>${icon('book')}<span>Web3 入门教程</span>${icon('external')}</a><div class="toast" id="copy-toast" role="status" aria-live="polite" aria-atomic="true"></div>`;
}

export const routes = Object.values(pages).map(page => page.path);
export function renderPage(page = 'home') {
  const currentPage = Object.hasOwn(pages, page) ? page : '404';
  const body = currentPage === 'home' ? home() : currentPage === 'projects' ? projectsPage() : currentPage === 'invite' ? invitePage() : `<section class="page-hero not-found"><h1>找不到这个页面。</h1><p>404</p><a href="/" class="button primary">返回首页 ${icon('arrow')}</a></section>`;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark">${renderSeoHead(currentPage, projects)}<meta name="theme-color" content="#f7f6f2"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preload" href="/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/noto-sans-sc-headings.woff2" as="font" type="font/woff2" crossorigin><script src="/theme.js"></script><link rel="stylesheet" href="/styles.css"><script src="/app.js" defer></script></head><body data-page="${currentPage}"><a class="skip-link" href="#main">跳到正文</a>${siteHeader(currentPage)}<div class="main-shell"><main id="main" tabindex="-1">${body}</main>${siteFooter()}</div></body></html>`;
}
