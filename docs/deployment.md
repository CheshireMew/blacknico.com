# blacknico.com 部署记录

部署日期：2026 年 10 月 20 日（北京时间）。

## 当前生产版本

- 网站：<https://blacknico.com/>；`www.blacknico.com` 继续提供同一网站。
- 内容版本：`2afe62b344b9a831a4fa1146bda17b4b59cd28f4`，包含 OKX 钱包 20%、币安钱包 30% 的手续费优惠文案。
- 发布目录：`/srv/blacknico.com/releases/20261020-2afe62b/site`。
- 当前目录：`/srv/blacknico.com/current/site`，`current` 为指向发布目录的符号链接。
- 发布清单：版本目录下的 `manifest.json`，包含 15 个文件的尺寸与 SHA256。
- 运行方式：现有 Nginx 直接提供静态页面，不需要 Node 常驻服务、数据库或新装依赖。

在 Windows 本地检查并生成静态页面，将页面文件通过 SSH 写入独立发布目录；其余静态资源从 GitHub 的完整提交地址取得。所有文件在切换前均与本地产物逐文件校验，未生成压缩包。

## Nginx 与备份

现有 `/etc/nginx/sites-enabled/default` 指向 `/etc/nginx/sites-available/default`。仅调整其中 `blacknico.com www.blacknico.com` 主站块的根目录，增加 UTF-8、定制 404 和 `Cache-Control: no-cache`。保留原有 HTTPS 证书与 HTTP 到 HTTPS 的跳转方式，配置检查通过后平滑重载 Nginx。

原站目录 `/var/www/html` 完整保留。此次备份位于 `/srv/blacknico.com/backups/20261020-2afe62b`：

- `old-site/`：原主站文件副本。
- `nginx-default.conf`：切换前的完整配置。
- `rollback.sh`：将主站恢复到原 `/var/www/html` 的脚本，执行前先确认要恢复旧版，再通过 server-ops 的正式 SSH 入口运行。

同一配置中的博客、导航服务器块逐字保留；`nginx.conf` 与加密学习站配置的 SHA256 均未改变。没有修改 DNS、证书、其他项目文件或新增后台服务。

## 实际验证

- 公网 HTTPS 访问的全部 15 个文件与本地 SHA256 一致。
- 首页、`/projects/`、`/invite/` 和 www 地址正常返回 200；HTTP 正常跳转 HTTPS。
- 不存在的地址返回定制 404，状态码为 404。
- 桌面与手机浏览器检查通过：39 个项目、分类、搜索、深浅主题、手机导航、5 个邀请码的真实剪贴板复制均正常。
- 1440、768、390、320 像素宽度没有横向溢出，浏览器无脚本错误。
- 博客、导航、加密学习站公网入口均正常返回 200。

运维脚本、清单、运行结果和公网截图保存在本机 server-ops Skill 的 `.runs/blacknico-main-20261020/`，不进入此公开仓库。GitHub 后续仅更新说明文档时，不需要重新部署静态文件。
