# SEO 与站点地图

2026 年 10 月 20 日完成主站专项 SEO 优化。范围是现有首页、项目页和邀请页，不增加重复的关键词页面。

## 页面搜索信息

`src/seo.mjs` 集中定义页面地址、标题、简介和最后内容修改日期。渲染器、构建脚本和站点地图共用这些页面信息。每页搜索摘要、Open Graph、Twitter 分享标题与描述保持一致，分享图补充了尺寸和图片说明。

- 首页：`ProfilePage`，关联柴郡的 `Person` 与 BlackNico `WebSite`。
- 项目页：`CollectionPage`，包含公开仓库的 `ItemList`，源码条目标记为 `SoftwareSourceCode`，两级面包屑。
- 邀请页：普通 `WebPage` 和面包屑，不再错误标记为个人资料页。
- 404：`noindex, follow`，不输出规范地址或个人资料结构化数据。

所有项目和邀请信息均直接输出到 HTML。搜索与分类通过 JavaScript 增强浏览体验，不影响搜索引擎读取页面完整内容。项目筛选和搜索参数仍可分享，规范地址统一为 `/projects/`。邀请外链保留 `rel="sponsored"`。

## 站点地图与 Google Search Console

正式地图为 <https://blacknico.com/sitemap.xml>。它在构建时自动生成，只列出三个正式页面；增加或移除页面时更新 `src/seo.mjs`，不再手工维护独立清单。`lastModified` 必须反映内容真实修改，不要每次构建都改日期。原有手写地图归档于 `docs/archive/sitemap-initial.xml`。

`robots.txt` 允许抓取，明确声明正式地图地址，不阻止 Google 读取页面资源。

本轮已在 Google Search Console 的 **blacknico.com 网域资源**下提交主站地图，Google 显示“已成功处理站点地图”，已发现网页为 **3**。原有 `https://blog.blacknico.com/wp-sitemap.xml` 条目保留。提交成功和发现网页不等于已全部编入索引或已获得搜索排名；收录与搜索表现以后由 Search Console 展示实际结果。

## 网址与性能

`deployment/nginx-main.conf` 是生产主站 HTTPS server 块使用的配置片段。它统一 `www`、显式 `index.html` 和项目/邀请的无末尾斜杠网址，使用 301 跳转并保留查询参数。主站 HTTP 入口直接跳转到不带 www 的 HTTPS 主域名。博客、导航等其他站点不使用本片段。

HTML、CSS、JavaScript、XML 与 SVG 启用 gzip。首页展示的两张项目封面改用 WebP，总大小从 2,222,513 字节降至 163,386 字节，约减少 92.6%。原始 PNG 保留。图片宽高、替代文字与非首屏延迟加载继续保留。

## 检查

`npm run check` 包含 SEO 检查；也可以单独运行 `npm run check:seo`。检查涵盖各页独立摘要、规范地址、分享信息一致性、结构化数据、源码条目、站点地图地址和日期、404，以及邀请码链接与轻量封面。

生产发布后还应核对实际 HTTP 状态、301 的目标与参数保留、地图 XML、gzip，以及页面正文和交互。性能改进按实际资源大小说明，本轮没有将本机测试冒充真实用户的核心网页指标。
