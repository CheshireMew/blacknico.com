# blacknico.com 部署记录

部署日期：2026 年 10 月 20 日（北京时间）。

## 当前生产版本

- 网站：<https://blacknico.com/>；`www.blacknico.com` 使用 301 跳转到主域名。
- 内容版本：`7eacff851544c28eca56540158ddb62736e0008b`，包含专项 SEO 优化与 OKX 钱包 20%、币安钱包 30% 的手续费优惠文案。
- 发布目录：`/srv/blacknico.com/releases/20261020-7eacff8/site`。
- 当前目录：`/srv/blacknico.com/current/site`，`current` 为指向发布目录的符号链接。
- 发布清单：版本目录下的 `manifest.json`，包含 17 个网站文件以及 Nginx 配置片段的尺寸与 SHA256。
- 运行方式：现有 Nginx 直接提供静态页面，不需要 Node 常驻服务、数据库或新装依赖。

在 Windows 本地检查并生成静态页面，将页面文件与自动生成的站点地图通过 SSH 写入独立发布目录；其余静态资源和 Nginx 配置片段从 GitHub 的完整提交地址取得。所有文件在切换前均与本地产物逐文件校验，未生成压缩包。

## Nginx 与备份

现有 `/etc/nginx/sites-enabled/default` 指向 `/etc/nginx/sites-available/default`。主站 HTTPS 块通过 `include /srv/blacknico.com/current/deployment/nginx-main.conf;` 加载随版本保存的根目录、UTF-8、定制 404、缓存重验证、gzip 与规范地址规则。主站 HTTP 块直接跳转到不带 www 的 HTTPS 主域名，保留原有证书。配置检查通过后平滑重载 Nginx。

SEO 上线前一版备份位于 `/srv/blacknico.com/backups/20261020-7eacff8`，包含旧 Nginx 配置、旧版本指向记录和 `rollback.sh`。用户要求恢复时，该脚本将配置和 `current` 一起恢复到上一版 `20261020-2afe62b`。

最初原站目录 `/var/www/html` 完整保留。首次部署的备份位于 `/srv/blacknico.com/backups/20261020-2afe62b`：

- `old-site/`：原主站文件副本。
- `nginx-default.conf`：切换前的完整配置。
- `rollback.sh`：将主站恢复到原 `/var/www/html` 的脚本，执行前先确认要恢复旧版，再通过 server-ops 的正式 SSH 入口运行。

两次部署均保留同一配置中的博客、导航服务器块；`nginx.conf` 与加密学习站配置的 SHA256 均未改变。没有修改 DNS、证书、其他项目文件或新增后台服务。

## 实际验证

- 公网 HTTPS 访问的全部 17 个网站文件与本地 SHA256 一致。
- 首页、`/projects/`、`/invite/` 正常返回 200；www、显式 index.html、无末尾斜杠与 HTTP 地址按预期 301 跳转，保留查询参数。
- 不存在的地址返回定制 404，状态码为 404。
- 桌面与手机浏览器检查通过：39 个项目、分类、搜索、深浅主题、手机导航、5 个邀请码的真实剪贴板复制均正常。
- 1440、768、390、320 像素宽度没有横向溢出，浏览器无脚本错误。
- 博客、导航、加密学习站公网入口均正常返回 200。
- 标题、简介、规范地址与页面结构化数据在线一致；主要文本资源的 gzip 响应正常。
- Search Console 已成功处理主站站点地图，发现三个页面，详见 `seo.md`。

首次部署材料保存在本机 server-ops Skill 的 `.runs/blacknico-main-20261020/`；SEO 部署与验证材料在 `.runs/blacknico-seo-20261020/`，其中包含 Google 地图成功处理的截图。这些材料不进入此公开仓库。GitHub 后续仅更新说明文档时，不需要重新部署静态文件。
