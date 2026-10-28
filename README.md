# blacknico.com

柴郡的个人主站。首版采用暖白、炭黑和橙色，配有原创 SVG 黑猫插画，包含网站入口、项目作品集、文章与独立邀请页。

## 本地预览

双击 `启动预览.bat`（也可使用 `启动预览.cmd`），或在项目目录运行：

```powershell
npm run dev
```

打开 <http://127.0.0.1:4377/>。保持终端运行即可持续预览。端口被占用时可使用 `node scripts/server.mjs --port 4378`。

项目使用 Node.js 22 或更新版本，无需安装第三方 npm 依赖。本机 Node 位于 `D:\Tools\NodeJS`。

## 页面

| 地址 | 内容 |
| --- | --- |
| `/` | 个人主页、五个子站入口、精选作品、文章、介绍 |
| `/projects/` | 39 个公开项目，支持分类、搜索与直接链接到筛选结果 |
| `/invite/` | 两家交易所及两个 Web3 钱包的邀请链接、五个邀请码 |

页面支持手机导航、浅色/深色主题、键盘操作及减少动态效果的系统偏好。邀请码可一键复制，复制失败时会提示手动复制。

## 修改内容

- `src/data/site.mjs`：个人信息、网站入口、精选文章和邀请链接。
- `src/data/editorial.mjs`：项目中文介绍、分类、标签和精选封面。
- `src/data/github.json`：GitHub 公开仓库资料。
- `src/data/article-links.json`：核对过的真实文章链接。
- `src/render.mjs`：页面结构。
- `src/seo.mjs`：各页 SEO 信息、结构化数据与自动生成的站点地图。
- `public/styles.css`：样式与手机布局。
- `public/app.js`：筛选、搜索、主题与复制操作。
- `public/images/`：头像、项目原始封面与截图、SVG 插画。

修改样式、前端脚本或渲染模板后刷新浏览器。修改数据文件与图标后需要重启预览服务。

`npm run sync:github` 可重新读取 CheshireMew 的公开仓库；不会访问私有仓库，也不会覆盖手写中文介绍。GitHub 拒绝请求或网络失败时保留旧数据。增加新仓库后，在 `editorial.mjs` 中补充分类与介绍即可。首页的文章是经过选择的内容，不会自动随博客最新文章改变。

## 检查与部署文件

```powershell
npm run check
npm run build
```

`check` 核对页面、素材、项目资料、真实文章地址、邀请链接及邀请码。`build` 将三个页面、404 页和静态资源写入 `dist/`，不生成压缩包。

部署时将 `dist/` 的内容交给现有静态网站服务。各路径对应独立的 `index.html`，无需数据库、Node 常驻服务或页面路由回退。新页面已提供 canonical、站点地图、robots、分享图及结构化个人资料。

网站已于 2026 年 10 月 20 日部署到 <https://blacknico.com/>，替换原首页。生产目录、版本、备份与恢复方式见 [部署记录](docs/deployment.md)。

`scripts/qa-browser.mjs` 是本机浏览器检查入口，默认使用 D 盘现有 Playwright 与系统 Chrome，不需要下载浏览器。检查截图和报告写到 `D:\Tools\blacknico-site-qa`；可通过 `PLAYWRIGHT_PATH`、`QA_DIR`、`BASE_URL` 改变位置。

资料核对范围与说明见 `docs/content-sources.md`。

专项优化与 Search Console 地图提交状态见 [SEO 说明](docs/seo.md)。正式地图为 <https://blacknico.com/sitemap.xml>。
