# 墨辰DarkCube

> **中文**：一款本地优先的日记应用，黑白液态玻璃界面，有 PWA、Windows 桌面版和 Android 三个版本。电脑和安卓之间可以直接同步，日记存在你自己的 GitHub 私有仓库里，不经过任何第三方服务器。
>
> **English**: A local-first diary app with a monochrome liquid-glass interface, available as a PWA, a Windows desktop app and an Android app. Your PC and Android device sync with each other, and entries live in your own private GitHub repository instead of a third-party server.

![PWA](https://img.shields.io/badge/PWA-Installable-0a0a0a) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-0a0a0a) ![License](https://img.shields.io/badge/license-MIT-f5f5f5)

---

## 功能 / Features

- **写日记 / Write**: 一天一篇，用 Markdown 写，边写边看效果，带字数统计，停下就自动保存。One entry per day. Write in Markdown with a live preview, a word count, and auto-save as you type.
- **天气与心情 / Weather & Mood**: 记下当天的天气和心情，会跟正文一起同步到 GitHub，存在 front matter 里。Pick the day's weather and mood; they sync to GitHub alongside the entry as front matter.
- **Markdown 工具栏 / Markdown Toolbar**: 标题、加粗、斜体、引用、列表、代码、链接、分割线都能点一下插进去。Headings, bold, italic, quotes, lists, code, links and dividers can be inserted with a tap.
- **四种语言 / 4 Languages**: 简体中文、繁體中文、English、日本語，第一次打开会按系统语言自动选好。Simplified Chinese, Traditional Chinese, English and Japanese. The system language is detected on first launch.
- **导入第三方翻译 / Import Custom Languages**: 别人做的语言包（JSON）可以直接加载。Translation packs (JSON) made by others can be loaded in.
- **GitHub 云存档 / GitHub Cloud Backup**: 日记同步到你的私有仓库，上传前会做一层编码，仓库里看不到明文。Entries sync to your private repository, encoded before upload so the repository holds no plain text.
- **双端互通 / Cross-device**: 电脑和安卓共用同一份数据。Your PC and Android device share one set of data.
- **离线可用 / Offline-first**: 数据先存在本地（IndexedDB），断网照样能写。Entries are stored locally first (IndexedDB), so you can keep writing offline.
- **日历 / Calendar**: 可以跨年翻，左右滑动有动画，底部有「那年今天」。Move across years, swipe left and right, and check “On This Day” at the bottom.
- **时间线 / Timeline**: 按年份分组，标题取当天写下的第一句话，左滑可以删除。Grouped by year. The title is the first sentence of that day's entry, and swiping left deletes it.
- **更新检查 / Update Check**: 启动时会检查有没有新版本。Checks for a new version on startup.

---

## 技术栈 / Tech Stack

| 层 / Layer | 技术 / Tech |
|---|---|
| 构建 / Build | Vite 6 + React 18 + TypeScript（strict） |
| PWA | vite-plugin-pwa（Workbox） |
| 本地存储 / Local | IndexedDB（Dexie.js） |
| 云同步 / Sync | GitHub REST API（Git Data，纯 HTTP） |
| 桌面 / Desktop | Wails v2 + 系统 WebView2（产物约 12MB / ~12MB single binary） |
| Android | Capacitor 8 + GitHub Actions 云端构建 / cloud builds |
| Markdown | marked + DOMPurify |
| 国际化 / i18n | 自研词典 + 自定义语言导入 / custom dictionary + language packs |

---

## 快速开始 / Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 生产构建 / production build (dist/)
npm run dist:desktop  # 打包 Windows 桌面版（Wails，需 Go）/ package desktop (Wails, needs Go)
```

---

## GitHub 配置 / GitHub Setup

### 生成细粒度 Token / Create a fine-grained token

1. 打开 [https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. **Repository access**: **All repositories**
3. **Permissions**:
   - **Contents** → **Read and write**（同步必需 / required for sync）
   - **Administration** → **Read and write**（自动建仓必需 / required for auto-creating the repo）

### 应用内登录 / Login in the app

点顶栏的「登录 GitHub」，粘贴 Token，填仓库名（默认 `darkcube-diary`，不存在就自动建一个私有仓库）。Open “Login GitHub” in the top bar, paste the token, and enter a repository name. It defaults to `darkcube-diary` and creates a private repository if that name is free.

> 详细图文教程在应用内的「新手登录教程」，文档在 [docs/login-tutorial.md](docs/login-tutorial.md)（另有 .en/.ja/.zh-TW 版本）。
> A full illustrated tutorial is in the app; the docs are at [docs/login-tutorial.md](docs/login-tutorial.md) (also .en/.ja/.zh-TW).

### 同步 / Sync

- **↑ 上传 / Push**: 本地 → 云端 / local → cloud
- **↓ 下载 / Pull**: 云端 → 本地 / cloud → local
- **自动同步 / Auto sync**: 打开应用或网络恢复时自动双向同步 / two-way sync on open or network return
- **删除 / Delete**: 在时间线左滑删除，本地和云端一起删 / swipe left in the timeline (local and cloud)

---

## 部署到 GitHub Pages / Deploy to GitHub Pages

1. 把代码推到公开仓库 / Push code to a public repo
2. 仓库 **Settings → Pages → Source: GitHub Actions**（自带 [deploy.yml](.github/workflows/deploy.yml)）
3. 访问 `https://<user>.github.io/<repo>/`，电脑和安卓都能安装 / installable on PC and Android

> 日记数据放在你自己的私有仓库里，由 Token 保护，应用本身不含数据 / Diary data stays in your private repo (token-protected); the app shell contains no data.

---

## 多语言与自定义翻译 / Languages & Custom Translations

内置简体中文、繁體中文、English、日本語。第一次打开会按系统语言自动选，也可以在设置里的「语言」一项切换，每种语言独占一行，选项可以折叠。

Built-in languages are Simplified Chinese, Traditional Chinese, English and Japanese. The system language is picked on first launch, and you can switch under Settings → Language, where each language takes one line and the options can be collapsed.

**A third-party language pack looks like this.**

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

导入方式：设置 → 语言 → 展开语言选项 → 导入语言，选你的 `darkcube-<code>.json`，导入后立即生效，同一个 `code` 再导入一次会覆盖。

Import in-app: Settings → Language → expand the options → Import language, then pick your `darkcube-<code>.json`. It applies immediately, and importing the same `code` again overwrites it.

---

## 项目结构 / Project Structure

```
├── .github/workflows/       # Pages 部署 + APK 云端构建 / Pages deploy + APK build
├── docs/                    # 教程 / 免责声明（多语言）/ tutorials & disclaimers (multi-lang)
├── desktop-wails/           # Windows 桌面壳（Wails + WebView2）/ desktop shell
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

## 免责声明 / Disclaimer

用这个软件就表示你同意 [docs/disclaimer.md](docs/disclaimer.md)（另有 .en/.ja/.zh-TW 版本），第一次启动会自动弹出来。

By using this app you agree to [docs/disclaimer.md](docs/disclaimer.md) (also .en/.ja/.zh-TW); it appears automatically on first launch.

## License

MIT
