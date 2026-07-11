# Sambor Prei Kuk Documentation Website

这是三博波雷古寺院遗址数字文档网站的第一阶段框架。

本阶段只包含网站 Layout、页面结构、导航、占位区域和数据模板。GIS 地图、Cesium Stories、文物数据库、检索系统、三维模型平台和后台系统尚未接入。

## 如何本地预览

1. 打开终端，进入新网站文件夹：

   ```powershell
   cd "C:\Users\Herit\Documents\SPK Documentation\spk-documentation-website"
   ```

2. 第一次使用时安装依赖：

   ```powershell
   npm install
   ```

3. 启动本地预览：

   ```powershell
   npm run dev
   ```

4. 浏览器打开终端显示的本地地址，通常是 `http://localhost:4321`。

## 构建检查

修改后请运行：

```powershell
npm run build
```

如果命令报错，先修复错误，再提交 GitHub。

## 目录结构

- `src/pages`：网站页面模板。
- `src/layouts`：全局页面布局。
- `src/components`：Header、Footer、卡片、占位框等可复用组件。
- `src/data`：项目、遗迹、专题、论文报告、首页内容等可编辑数据。
- `src/config`：网站基本信息、导航、外部系统链接配置。
- `src/styles`：全局样式。
- `public/images`：以后放普通网页图片。
- `public/thumbnails`：以后放缩略图。
- `public/documents`：以后放公开文档或 PDF。
- `.github/workflows/deploy.yml`：GitHub Pages 自动部署配置。

## 如何修改首页文字

首页页面在：

```text
src/pages/index.astro
```

首页 Featured Content 和 Latest Articles / Reports 的示例记录在：

```text
src/data/home.ts
```

请把 Demo / Placeholder 内容替换为已经确认的正式文字。不要填写未经确认的历史、年代、研究结论或个人信息。

## 如何替换图片

1. 把图片放入 `public/images` 或 `public/thumbnails`。
2. 在对应数据文件中填写图片路径，例如：

   ```text
   /images/example.jpg
   ```

3. 所有图片都必须有清楚的 alt 文本。当前第一阶段主要使用占位框。

不要上传大型原始数据，例如 OBJ、PLY、LAS、E57、原始高清照片或大量照片集。

## 如何增加项目

编辑：

```text
src/data/projects.ts
```

当前 Project 页面中的英文参考内容和图片整理自 Shimoda Laboratory 的 SPK Project 页面。继续修改时，请优先编辑 `projectPageSections`，并保留或更新对应来源链接。

每个项目支持：

- `title`
- `period`
- `summary`
- `thumbnail`
- `participatingOrganizations`
- `relatedOutputs`
- `externalLink`
- `category`

`category` 只能使用：

- `Research`
- `Conservation`
- `Human Resource Development`

## 如何增加遗迹

编辑：

```text
src/data/monuments.ts
```

每条遗迹记录支持：

- `id`
- `name`
- `zone`
- `thumbnail`
- `shortDescription`
- `tags`

网站会自动为每条记录生成详情页：

```text
/digital-archives/sites/遗迹id
```

不要为每座遗迹手写一整套页面。未来真实内容应优先通过数据文件维护。

## 如何增加专题集合

编辑：

```text
src/data/collections.ts
```

每个专题入口可以先指向内部页面。未来如果团队完成了外部检索系统，可以在 `src/config/externalSystems.ts` 中配置外部链接或 iframe。

当前专题包括：

- Movable Object Inventory
- Inscriptions
- Flying Palace
- Old Photographs

## 如何增加论文和报告

编辑：

```text
src/data/articles.ts
```

成果记录支持：

- `title`
- `authors`
- `year`
- `category`
- `citation`
- `summary`
- `thumbnail`
- `pdfUrl`
- `externalUrl`

分类包括：

- Published Articles
- Reports
- Presentations
- Books / Chapters
- Media / News

## 如何填写 Cesium Story 链接

编辑：

```text
src/config/externalSystems.ts
```

找到：

```ts
cesiumStory: {
  mode: "disabled",
  url: "",
}
```

如果还没有完成，保持：

```ts
mode: "disabled"
url: ""
```

如果要打开外部网页：

```ts
mode: "external-link"
url: "https://example.com"
```

如果要嵌入 iframe：

```ts
mode: "iframe"
url: "https://example.com"
```

不要把 Cesium ion Token、密码或隐私数据写入代码。

## 如何填写交互地图链接

仍然编辑：

```text
src/config/externalSystems.ts
```

找到：

```ts
interactiveMap
```

支持三种状态：

- `disabled`：未完成，页面显示 Under preparation。
- `external-link`：按钮跳转外部网页。
- `iframe`：在页面内嵌入外部网页。

以后可接入外部网页、QGIS2web 静态页面、Leaflet 页面或其他团队制作的地图页面。

当前交互地图使用单独页面：

```text
/interactive-map
```

Digital Archives 页面只显示入口按钮，地图本体在单独页面中以 iframe 方式嵌入。

## 如何连接文物检索系统

在 `src/config/externalSystems.ts` 中配置：

- `monumentDatabase`
- `movableObjectDatabase`

本网站第一阶段不开发文物检索系统，只保留入口。

## 如何嵌入外部页面

把对应外部系统的 `mode` 改为：

```ts
mode: "iframe"
```

并填写 `url`。

如果外部网站禁止 iframe 嵌入，请改用：

```ts
mode: "external-link"
```

## 如何提交 GitHub 修改

进入新网站仓库后：

```powershell
git status
git add .
git commit -m "Describe your change"
git push origin 分支名
```

不要在 `main` 分支直接开发。建议先创建新分支。

## 如何部署 GitHub Pages

本仓库已经包含 GitHub Actions 配置：

```text
.github/workflows/deploy.yml
```

推送到 `main` 后，GitHub Actions 会构建并部署到 GitHub Pages。当前任务不会自动合并到 `main`。

Astro 的 GitHub Pages base 路径会根据仓库名称自动设置，不需要手动写死仓库名。

## 绝对不要修改的内容

当前父目录中的旧网站只用于参考：

```text
C:\Users\Herit\Documents\SPK Documentation
```

不要修改、移动、删除或提交旧网站中的任何文件。所有新网站修改只能发生在：

```text
C:\Users\Herit\Documents\SPK Documentation\spk-documentation-website
```

也不要修改或提交旧网站的 `.next`、`node_modules`、`tsconfig.tsbuildinfo`。
