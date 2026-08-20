# 墨辰DarkCube

> **中文**：黑白液态玻璃风格的**本地优先**日记应用（PWA + Windows 桌面版 + Android）——电脑与安卓双端互通，GitHub 私有仓库作为云存档，无需任何第三方服务器。
>
> **English**: A **local-first** diary app (PWA + Windows desktop + Android) with a monochrome liquid-glass UI — cross-device sync between PC and Android, backed by your own private GitHub repository, with no third-party server required.

![PWA](https://img.shields.io/badge/PWA-Installable-0a0a0a) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-0a0a0a) ![License](https://img.shields.io/badge/license-MIT-f5f5f5)

---

## ✨ 功能 / Features

- **写日记 / Write**: 一天一篇，Markdown 语法，实时预览，字数统计，自动保存 / One entry per day, Markdown syntax, live preview, word count, auto-save
- **天气 / 心情记录 / Weather & Mood**: 一键选择当天天气与心情，随正文同步到 GitHub（front matter）/ Pick weather & mood in one tap; synced with the entry (front matter)
- **图形化 Markdown 辅助 / Markdown Toolbar**: 一键插入标题/加粗/斜体/引用/列表/代码/链接/分割线 / One-tap insert headings, bold, italic, quotes, lists, code, links, dividers
- **四语言 / 4 Languages**: 简体中文 / 繁體中文 / English / 日本語，首次打开自动检测系统语言 / System language detected on first launch
- **导入第三方翻译 / Import Custom Languages**: 加载第三方语言包（JSON）/ Load third-party translation packs (JSON)
- **GitHub 云存档 / GitHub Cloud Backup**: 日记以 Markdown 明文同步到你的私有仓库 / Entries sync as plain Markdown to your private repository
- **双端互通 / Cross-device**: 电脑与安卓共享同一份数据 / PC and Android share the same data
- **离线可用 / Offline-first**: 本地优先（IndexedDB），断网照常写日记 / Works offline with local storage (IndexedDB)
- **日历 / Calendar**: 跨年移动、左右滑动动画、**那年今天** / Year navigation, swipe animation, **On This Day**
- **时间线 / Timeline**: 按年分组、标题取当日第一句话、左滑删除 / Grouped by year, title from first sentence, swipe-to-delete
- **更新检查 / Update Check**: 启动时自动检测新版本 / Auto-checks for new versions on startup

---

## 🖥 技术栈 / Tech Stack

| 层 / Layer | 技术 / Tech |
|---|---|
| 构建 / Build | Vite 6 + React 18 + TypeScript（strict） |
| PWA | vite-plugin-pwa（Workbox） |
| 本地存储 / Local | IndexedDB（Dexie.js） |
| 云同步 / Sync | GitHub REST API（Git Data，纯 HTTP） |
| 桌面 / Desktop | Electron + electron-builder |
| Android | Capacitor 8 + GitHub Actions 云端构建 / cloud builds |
| Markdown | marked + DOMPurify |
| 国际化 / i18n | 自研词典 + 自定义语言导入 / custom dictionary + language packs |

---

## 🚀 快速开始 / Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 生产构建 / production build (dist/)
npm run dist:win   # 打包 Windows 桌面应用 / package Windows desktop app
```

---

## ☁️ GitHub 配置 / GitHub Setup

### 生成细粒度 Token / Create a fine-grained token

1. 打开 [https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. **Repository access**: **All repositories**
3. **Permissions**:
   - **Contents** → **Read and write**（同步必需 / required for sync）
   - **Administration** → **Read and write**（自动建仓必需 / required for auto-creating the repo）

### 应用内登录 / Login in the app

顶栏「登录 GitHub」→ 粘贴 Token → 仓库名（默认 `darkcube-diary`，不存在自动创建私有仓库）/ Tap "Login GitHub" → paste the token → repo name (defaults to `darkcube-diary`, auto-created if missing).

> 详细图文教程见应用内「📖 新手登录教程」，文档位于 [docs/login-tutorial.md](docs/login-tutorial.md)（另有 .en/.ja/.zh-TW 版本）。
> Full illustrated tutorial is available in-app; docs live at [docs/login-tutorial.md](docs/login-tutorial.md) (also .en/.ja/.zh-TW).

### 同步 / Sync

- **↑ 上传 / Push**: 本地 → 云端 / local → cloud
- **↓ 下载 / Pull**: 云端 → 本地 / cloud → local
- **自动同步 / Auto sync**: 打开应用或恢复联网时自动双向同步 / two-way sync on open or network return
- **删除 / Delete**: 时间线左滑删除（本地 + 云端）/ swipe left in the timeline (local + cloud)

---

## 📲 部署到 GitHub Pages / Deploy to GitHub Pages

1. 推送代码到公开仓库 / Push code to a public repo
2. 仓库 **Settings → Pages → Source: GitHub Actions**（自带 [deploy.yml](.github/workflows/deploy.yml)）
3. 访问 `https://<user>.github.io/<repo>/`，电脑/安卓均可安装 / installable on PC and Android

> 日记数据在你自己的私有仓库（Token 保护）；应用外壳不含数据 / Diary data stays in your private repo (token-protected); the app shell contains no data.

---

## 🌐 多语言与自定义翻译 / Languages & Custom Translations

内置 **简体中文 / 繁體中文 / English / 日本語**。首次打开自动检测系统语言，也可在 **设置 → 语言** 切换（每种语言独占一行，选项可折叠）。

**For third-party developers — create a language pack:**

```json
{
  "code": "fr",
  "label": "Français",
  "usesSpaces": true,
  "dict": {
    "nav.calendar": "Calendrier",
    "nav.timeline": "Chronologie",
    "nav.settings": "Paramètres",
    "nav.write": "Écrire",
    "nav.login": "Se connecter GitHub",
    "editor.weather": "Météo",
    "editor.mood": "Humeur",
    "settings.aboutSection": "Apparence et À propos"
  }
}
```

- `code`: language code (e.g. `fr`, `pt-BR`), 2–3 lowercase letters + optional `-UPPER` suffix
- `label`: name shown in the language list
- `usesSpaces`: whether the language uses spaces between words (`true` for Latin-like, `false` for CJK-like)
- `dict`: `"uiKey": "translation"` map; keys are listed in [src/core/i18n.ts](src/core/i18n.ts); **missing keys fall back to the built-in languages**

Import in-app: **设置 → 语言 → 展开语言选项 → 导入语言**, pick your `darkcube-<code>.json`; it is applied immediately (same `code` re-import overwrites).

---

## 📁 项目结构 / Project Structure

```
├── .github/workflows/       # Pages 部署 + APK 云端构建 / Pages deploy + APK build
├── docs/                    # 教程 / 免责声明（多语言）/ tutorials & disclaimers (multi-lang)
├── electron/                # Windows 桌面主进程 / desktop main process
├── android/                 # Capacitor Android 工程 / Android project
├── scripts/                 # 图标与工具脚本 / icon & tooling scripts
├── src/
│   ├── core/                # 数据 / 同步 / i18n / 更新检测 / data, sync, i18n, updates
│   ├── ui/components/       # 顶栏 / 弹窗 / 登录 / components
│   ├── ui/views/            # 日历 / 编辑器 / 时间线 / 设置 / views
│   └── styles/              # 黑白玻璃设计系统 / design system
└── vite.config.ts
```

---

## 📄 免责声明 / Disclaimer

使用即表示同意 [docs/disclaimer.md](docs/disclaimer.md)（另有 .en/.ja/.zh-TW 版本）；首次启动自动弹出 / By using this app you agree to [docs/disclaimer.md](docs/disclaimer.md) (also .en/.ja/.zh-TW); shown automatically on first launch.

## 📜 License

MIT
