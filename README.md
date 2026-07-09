# 拾光札记 — 一个人的生活随笔博客

基于 [Astro](https://astro.build/) 构建的内容驱动型个人博客，采用温暖纸质感设计，以"时间轴 + 心情/天气图标"的手记本式布局为视觉签名。

## ✨ 特性

- 📝 **Markdown 写作** — 通过 Content Collections 管理，支持 frontmatter 类型校验
- 🏷️ **标签归档** — 自动生成标签云和标签筛选页
- 📡 **RSS 订阅** — 开箱即用的 `/rss.xml` 订阅源
- 🔥 **Firebase 集成** — Analytics 访问统计 + Firestore 邮件订阅持久化
- 🎨 **纸质感设计** — 米麻纸色 + 深墨棕 + 信笺紫 + 苔绿，衬线字体为主
- 📱 **响应式** — 移动端时间轴和卡片正常堆叠降级
- ⚡ **零 JS 默认** — 仅保留轻量滚动淡入动效，保持阅读的安静感
- 🔍 **SEO 友好** — 自动生成 sitemap，语义化 HTML

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

开发服务器启动后访问 `http://localhost:4321`。

## 📁 项目结构

```
E:/blog/
├── public/
│   └── favicon.svg              # 站点图标
├── src/
│   ├── components/              # 可复用组件
│   │   ├── Header.astro         # 顶部导航
│   │   ├── Hero.astro           # Hero 区
│   │   ├── EntryCard.astro      # 随笔卡片
│   │   ├── MoodIcon.astro       # 心情/天气图标
│   │   ├── About.astro          # 关于我
│   │   ├── Subscribe.astro      # 订阅区
│   │   └── Footer.astro         # 页脚
│   ├── content/
│   │   ├── config.ts            # Content Collections 配置
│   │   └── posts/               # Markdown 文章目录
│   ├── layouts/
│   │   └── BaseLayout.astro     # 基础布局
│   ├── pages/
│   │   ├── index.astro          # 首页
│   │   ├── about.astro          # 关于页
│   │   ├── posts/
│   │   │   ├── index.astro      # 随笔列表
│   │   │   └── [slug].astro     # 文章详情
│   │   ├── tags/
│   │   │   ├── index.astro      # 标签总览
│   │   │   └── [tag].astro      # 单标签归档
│   │   └── rss.xml.js           # RSS 订阅
│   ├── styles/
│   │   └── global.css           # 全局样式
│   ├── utils/
│   │   ├── firebase.ts          # Firebase 初始化（App/Analytics/Firestore）
│   │   ├── subscribers.ts       # 订阅者 Firestore 数据访问
│   │   └── slugify.ts           # URL slug 工具
│   └── consts.ts                # 站点常量
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## ✍️ 写作指南

在 `src/content/posts/` 目录下新建 `.md` 文件即可，文件头部使用 YAML frontmatter：

```yaml
---
title: 文章标题
date: 2026-07-09
mood: 晴          # 可选值：晴 / 多云 / 雨 / 夜 / 风 / 雪 / 雾
tags:
  - 日常
  - 思考
excerpt: 一句话摘要，显示在列表页和 RSS 中。
---

正文内容（Markdown）……
```

### Frontmatter 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 文章标题 |
| `date` | date | ✅ | 发布日期（YYYY-MM-DD） |
| `mood` | enum | ✅ | 心情/天气：晴、多云、雨、夜、风、雪、雾 |
| `tags` | string[] | ✅ | 标签数组 |
| `excerpt` | string | ✅ | 摘要，用于列表页和 RSS |

## 🎨 设计系统

| 变量 | 色值 | 用途 |
|------|------|------|
| `--paper` | `#F1ECE1` | 主背景（米麻纸色） |
| `--paper-deep` | `#E7DFD0` | 次背景 |
| `--paper-alt` | `#FBF8F2` | 卡片背景 |
| `--ink` | `#2B2620` | 主文字（深墨棕） |
| `--ink-soft` | `#6B6252` | 次文字 |
| `--ink-faint` | `#9C927E` | 弱文字 |
| `--accent` | `#5B4B8A` | 强调色（信笺紫） |
| `--moss` | `#748052` | 点缀色（苔绿） |
| `--line` | `#CBBFA6` | 分割线 |

字体：Noto Serif SC（正文/标题）、EB Garamond Italic（日期数字）、JetBrains Mono（标签/导航）

## 🔥 Firebase / Firestore

项目已集成 Firebase，配置位于 `src/utils/firebase.ts`。

### 已启用服务

| 服务 | 用途 | 说明 |
|------|------|------|
| **Analytics** | 访问统计 | 仅生产环境初始化，开发环境不收集数据 |
| **Firestore** | 订阅者持久化 | 邮箱订阅写入 `subscribers` 集合 |

### Firestore 数据结构

`subscribers` 集合（自动创建）：

```
subscribers/{autoId}
  ├── email: string      // 订阅邮箱（小写存储）
  └── createdAt: timestamp // 订阅时间（服务器时间戳）
```

### Firestore 安全规则建议

在 Firebase 控制台为 `subscribers` 集合配置以下规则，仅允许客户端写入、禁止读取（防止邮箱泄露）：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /subscribers/{docId} {
      allow create: if true;   // 允许任何人订阅
      allow read, update, delete: if false; // 禁止客户端读取/修改
    }
  }
}
```

### 使用其他 Firebase 服务

在 `src/utils/firebase.ts` 中按需追加导出，例如：

```ts
import { getAuth, type Auth } from 'firebase/auth';
export const auth: Auth = getAuth(app);
```

## 📄 License

MIT
