# cznbook

陈镇男个人作品集，静态发布站点。

线上地址：https://cznportfolio.pages.dev/

## 2026-10-25 中英文切换

- 顶部的「中文 / EN」在桌面和手机上均可见，切换时保留当前内容分区。
- 中文首页为 `index.html`，英文首页为 `en.html`；两个页面均可直接访问，文案和简历链接不依赖 JavaScript。
- 中文下载使用原有 `assets/chen-zhennan-resume.pdf`，保留已更新照片；英文下载使用 `assets/chen-zhennan-resume-en.pdf`。
- 英文首页的作品链接带 `lang=en`；翻页界面的目录、按钮、章节标题及返回首页入口对应英文。切换语言保留章节与作品编号，作品展板图片保留原稿。
- 英文首页的生成脚本和本轮检查记录位于本地 `制作过程/网站双语_20261025`；共享首页文件同步到 `portfolio-site-motion/dist`，翻页源码仍在 `portfolio-site-motion/book-src`。
- 本地验证：15 项源码测试和 TypeScript/Vite 构建通过；桌面、手机、无 JavaScript、语言往返及四个 PDF 下载入口通过浏览器检查。

## 2026-09-25 手机端修复

- 房子线稿在手机上随滚动展开；遵循系统的减少动态效果设置。
- 手机单页阅读排除章节排版留白；桌面双页排版保持不变。
- 章节、缩略图和旧链接沿用稳定作品编号，切换阅读模式保留作品位置。
- 触摸直接驱动原翻页引擎，取消原有 250ms 等待，减轻手机阴影和整体晃动。

本仓库保存发布文件。对应可编辑源码位于本地 `portfolio-site-motion/book-src`，首页位于 `portfolio-site-motion/dist`；不要从旧基础版重新覆盖。

验证：13 项代码测试通过，TypeScript/Vite 构建通过，59 张作品原图完整保留。本轮未做手机真机测试。
