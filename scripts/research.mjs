import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readmes = new URL('research/readmes/', root);
await mkdir(readmes, { recursive: true });
const repos = JSON.parse((await readFile(new URL('research/github-public-repos.json', root), 'utf8')).replace(/^\uFEFF/, ''));
async function fetchText(url, timeout = 18000) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Blacknico-Site-Research' }, signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`${response.status}`);
  return { text: await response.text(), url: response.url, status: response.status };
}
const descriptions = [];
for (let offset = 0; offset < repos.length; offset += 6) {
  await Promise.all(repos.slice(offset, offset + 6).map(async repo => {
    if (repo.fork) return;
    try {
      const result = await fetchText(`https://raw.githubusercontent.com/CheshireMew/${repo.name}/HEAD/README.md`);
      await writeFile(new URL(`${repo.name}.md`, readmes), result.text);
      const urls = [...new Set(result.text.match(/https?:\/\/[^\s<>"')]+/g) || [])].filter(url => /blacknico\.com|\.png|\.webp|\.jpg/.test(url));
      descriptions.push({ name: repo.name, intro: result.text.slice(0, 1800), urls: urls.slice(0, 15) });
    } catch (error) { descriptions.push({ name: repo.name, error: error.message }); }
  }));
}
await writeFile(new URL('research/readme-summary.json', root), JSON.stringify(descriptions, null, 2));
let domains = ['blacknico.com', 'blog.blacknico.com', 'read.blacknico.com', 'crypto.blacknico.com'];
const discovery = [];
for (const url of ['https://crt.sh/?q=%25.blacknico.com&output=json', 'https://api.certspotter.com/v1/issuances?domain=blacknico.com&include_subdomains=true&expand=dns_names']) {
  try {
    const result = JSON.parse((await fetchText(url, 20000)).text);
    const names = result.flatMap(row => row.dns_names || (row.name_value || '').split('\n'));
    domains.push(...names.filter(name => /^(?:[a-z0-9-]+\.)*blacknico\.com$/.test(name)));
    discovery.push({ url, result: 'success', domains: [...new Set(names)] });
  } catch (error) { discovery.push({ url, error: error.message }); }
}
for (const row of descriptions) {
  for (const url of row.urls || []) {
    try { const host = new URL(url).hostname; if (host.endsWith('.blacknico.com')) domains.push(host); } catch {}
  }
}
domains = [...new Set(domains)].sort();
const sites = await Promise.all(domains.map(async domain => {
  try {
    const result = await fetchText(`https://${domain}`, 12000);
    return { domain, status: result.status, url: result.url, title: result.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim(), links: [...new Set(result.text.match(/https?:\/\/[a-z0-9.-]*blacknico\.com/g) || [])] };
  } catch (error) { return { domain, error: error.message }; }
}));
await writeFile(new URL('research/domain-discovery.json', root), JSON.stringify({ checkedAt: new Date().toISOString(), discovery, sites }, null, 2));
console.log(JSON.stringify({ repoCount: repos.length, readmes: descriptions.map(row => ({ name: row.name, error: row.error, domains: row.urls?.filter(url => url.includes('blacknico.com')) })), sites }, null, 2));
