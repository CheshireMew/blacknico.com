import { writeFile, readFile } from 'node:fs/promises';
const assets = [
  ['https://avatars.githubusercontent.com/u/156318350?v=4&s=160', 'public/images/avatar.png'],
  ['https://raw.githubusercontent.com/CheshireMew/PuppetLoom/HEAD/assets/readme/puppetloom-cover-v2.png', 'public/images/projects/puppetloom.png'],
  ['https://raw.githubusercontent.com/CheshireMew/MediaFlow-Pro/HEAD/docs/images/mediaflow-workspace-zh-cn.png', 'public/images/projects/mediaflow.png']
];
await Promise.all(assets.map(async ([url, path]) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(new URL(`../${path}`, import.meta.url), bytes);
  console.log(`${path}: ${bytes.length} bytes`);
}));
// 从自己的博客首页解析真实文章地址，保留文字与对应关系。
const response = await fetch('https://blog.blacknico.com/', { signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error(`Blog: ${response.status}`);
const html = await response.text();
const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(match => ({ url: match[1], title: match[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() }));
const wanted = ['谁能拒绝一只会陪你写代码的猫娘桌宠', '个人主页的第一眼印象', '2142 个 RSS'];
const found = wanted.map(title => links.find(link => link.title.includes(title))).filter(Boolean);
await writeFile(new URL('../src/data/article-links.json', import.meta.url), JSON.stringify(found, null, 2) + '\n');
console.log(found);
