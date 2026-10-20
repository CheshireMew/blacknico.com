import { mkdir, writeFile } from 'node:fs/promises';
const repos = [];
for (let page = 1; page <= 20; page++) {
  const response = await fetch(`https://api.github.com/users/CheshireMew/repos?per_page=100&sort=updated&page=${page}`, { headers: { 'User-Agent': 'blacknico.com' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`GitHub 返回 ${response.status}，原有数据已保留。`);
  const rows = await response.json();
  for (const r of rows) repos.push({ name: r.name, description: r.description || '', url: r.html_url, homepage: r.homepage || '', fork: r.fork, archived: r.archived, language: r.language, stars: r.stargazers_count, updatedAt: r.updated_at });
  if (rows.length < 100) break;
}
if (!repos.length) throw new Error('GitHub 返回空列表，原有数据已保留。');
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/data/github.json', import.meta.url), JSON.stringify({ checkedAt: new Date().toISOString(), repos }, null, 2) + '\n');
console.log(`已同步 ${repos.length} 个公开仓库。项目介绍仍由 editorial.mjs 管理。`);
