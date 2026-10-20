import { site } from './data/site.mjs';

// 每个页面的搜索信息与站点地图共用这份配置。
// lastModified 只在页面内容实际更新时修改，不使用每次构建的时间。
export const pages = {
  home: {
    path: '/', label: '首页', lastModified: '2026-10-20',
    title: 'BlackNico 柴郡｜AI 工具、开源项目与创作记录',
    description: '柴郡 Cheshire 的个人主站 BlackNico。探索 AI 工具、开源软件、Agent Skills、内容创作与投资研究，浏览我的项目作品、博客、Web3 学习站及其他网站。'
  },
  projects: {
    path: '/projects/', label: '项目与作品', lastModified: '2026-10-20',
    title: '开源项目与 Agent Skills｜BlackNico 柴郡',
    description: '浏览柴郡 CheshireMew 的开源项目与 Agent Skills：PuppetLoom 2D 角色动画、MediaFlow Pro 视频创作、Glean 信息筛选，以及笔记、翻译、写作和市场研究工具，附 GitHub 源码与网站入口。'
  },
  invite: {
    path: '/invite/', label: '邀请福利', lastModified: '2026-10-20',
    title: '币安、OKX 邀请码与 Web3 钱包手续费优惠｜BlackNico',
    description: '柴郡的币安 Binance、欧易 OKX 注册邀请及 Web3 钱包邀请码汇总。交易所展示 20% 手续费优惠，OKX 钱包 20%、币安钱包 30%；支持复制邀请码，具体权益以平台显示为准。'
  }
};

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const personId = `${site.domain}/#person`;
const websiteId = `${site.domain}/#website`;

export function structuredData(page, projects = []) {
  const metadata = pages[page];
  if (!metadata) return null;
  const url = site.domain + metadata.path;
  const person = {
    '@type': 'Person', '@id': personId,
    name: site.author, alternateName: ['Cheshire', 'CheshireMew', site.name],
    url: site.domain + '/', image: `${site.domain}/images/avatar.png`,
    sameAs: [site.github, site.x, site.telegram]
  };
  const website = {
    '@type': 'WebSite', '@id': websiteId, url: site.domain + '/',
    name: site.name, alternateName: 'BlackNico 柴郡',
    inLanguage: 'zh-CN', publisher: { '@id': personId }
  };
  const webpage = {
    '@type': page === 'home' ? 'ProfilePage' : page === 'projects' ? 'CollectionPage' : 'WebPage',
    '@id': url + '#webpage', url, name: metadata.title,
    description: metadata.description, inLanguage: 'zh-CN',
    isPartOf: { '@id': websiteId }, author: { '@id': personId },
    dateModified: metadata.lastModified,
    primaryImageOfPage: { '@type': 'ImageObject', url: `${site.domain}/images/social-card.png`, width: 1200, height: 630 }
  };
  const graph = [website, person, webpage];
  if (page === 'home') webpage.mainEntity = { '@id': personId };
  if (page === 'projects') {
    webpage.mainEntity = { '@id': url + '#projects' };
    graph.push({
      '@type': 'ItemList', '@id': url + '#projects', name: '柴郡的公开项目与作品',
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem', position: index + 1,
        item: {
          '@type': 'SoftwareSourceCode', name: project.name,
          description: project.description,
          url: project.url, codeRepository: `${site.github}/${encodeURIComponent(project.name)}`,
          ...(project.language ? { programmingLanguage: project.language } : {})
        }
      }))
    });
  }
  if (page !== 'home') {
    webpage.breadcrumb = { '@id': url + '#breadcrumb' };
    graph.push({
      '@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首页', item: site.domain + '/' },
        { '@type': 'ListItem', position: 2, name: metadata.label, item: url }
      ]
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function renderSeoHead(page, projects = []) {
  const metadata = pages[page];
  if (!metadata) return '<title>没有找到页面 · BlackNico</title><meta name="robots" content="noindex, follow">';
  const { title, description, path } = metadata;
  const url = site.domain + path;
  const imageUrl = `${site.domain}/images/social-card.png`;
  const json = JSON.stringify(structuredData(page, projects)).replace(/</g, '\\u003c');
  return `<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="author" content="${escape(site.author)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_CN">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="BlackNico 柴郡的个人空间：AI、创作、投资与开源作品">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@0xCheshire">
<meta name="twitter:creator" content="@0xCheshire">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${imageUrl}">
<meta name="twitter:image:alt" content="BlackNico 柴郡的个人空间">
<script type="application/ld+json">${json}</script>`;
}

export function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.values(pages).map(page => `  <url><loc>${site.domain}${page.path}</loc><lastmod>${page.lastModified}</lastmod></url>`).join('\n')}
</urlset>\n`;
}
