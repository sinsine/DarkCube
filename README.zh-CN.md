# 墨辰DarkCube

[English](README.md) | **简体中文** | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

> 一款本地优先的日记应用，黑白液态玻璃界面，有 PWA、Windows 桌面版和 Android 三个版本。电脑和安卓之间可以直接同步，日记存在你自己的 GitHub 私有仓库里，不经过任何第三方服务器。

![PWA](https://img.shields.io/badge/PWA-Installable-0a0a0a) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-0a0a0a) ![License](https://img.shields.io/badge/license-MIT-f5f5f5)

---

## 功能

- **写日记**：一天一篇，用 Markdown 写，边写边看效果，带字数统计，停下就自动保存。
- **天气与心情**：记下当天的天气和心情，会跟正文一起同步到 GitHub，存在 front matter 里。
- **Markdown 工具栏**：标题、加粗、斜体、引用、列表、代码、链接、分割线都能点一下插进去。
- **四种语言**：简体中文、繁體中文、English、日本語，第一次打开会按系统语言自动选好。
- **导入第三方翻译**：别人做的语言包（JSON）可以直接加载。
- **GitHub 云存档**：日记同步到你的私有仓库，上传前会做一层编码，仓库里看不到明文。
- **双端互通**：电脑和安卓共用同一份数据。
- **离线可用**：数据先存在本地（IndexedDB），断网照样能写。
- **日历**：可以跨年翻，左右滑动有动画，底部有「那年今天」。
- **时间线**：按年份分组，标题取当天写下的第一句话，左滑可以删除。
- **更新检查**：启动时会检查有没有新版本。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 构建 | Vite 6 + React 18 + TypeScript（strict） |
| PWA | vite-plugin-pwa（Workbox） |
| 本地存储 | IndexedDB（Dexie.js） |
| 云同步 | GitHub REST API（Git Data，纯 HTTP） |
| 桌面 | Wails v2 + 系统 WebView2（单文件约 12MB） |
| Android | Capacitor 8 + GitHub Actions 云端构建 |
| Markdown | marked + DOMPurify |
| 国际化 | 自研词典 + 自定义语言导入 |

---

## 快速开始

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # 生产构建（输出到 dist/）
npm run dist:desktop  # 打包 Windows 桌面版（Wails，需要 Go）
```

---

## GitHub 配置

### 生成细粒度 Token

1. 打开 [https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. **Repository access** 选 **All repositories**
3. **Permissions** 里勾选：
   - **Contents** → **Read and write**（同步必需）
   - **Administration** → **Read and write**（自动建仓必需）

### 在应用内登录

点顶栏的「登录 GitHub」，粘贴 Token，填仓库名。默认是 `darkcube-diary`，这个名字没被占用的话会自动建一个私有仓库。

> 详细图文教程在应用内；文档在 [docs/login-tutorial.md](docs/login-tutorial.md)。

### 同步

- **上传**：本地 → 云端
- **下载**：云端 → 本地
- **自动同步**：打开应用或网络恢复时自动双向同步
- **删除**：在时间线左滑删除，本地和云端一起删

---

## 部署到 GitHub Pages

1. 把代码推到公开仓库
2. 仓库 **Settings → Pages → Source: GitHub Actions**（用仓库自带的 [deploy.yml](.github/workflows/deploy.yml)）
3. 访问 `https://<user>.github.io/<repo>/`，电脑和安卓都能安装

> 日记数据放在你自己的私有仓库里，由 Token 保护，应用本身不含数据。

---

## 多语言与自定义翻译

内置简体中文、繁體中文、English、日本語。第一次打开会按系统语言自动选，也可以在设置里的「语言」一项切换，每种语言独占一行，选项可以折叠。

**第三方语言包长这样。**

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

- `code`：语言代码，比如 `fr`、`pt-BR`，2 到 3 个小写字母，可以带 `-大写` 后缀
- `label`：语言列表里显示的名字
- `usesSpaces`：这种语言词与词之间是否用空格分隔（拉丁语系填 `true`，中日韩填 `false`）
- `dict`：`"界面词条": "译文"` 的对照表，词条清单见 [src/core/i18n.ts](src/core/i18n.ts)，没写的词条会回落到内置语言

导入方式：设置 → 语言 → 展开语言选项 → 导入语言，选你的 `darkcube-<code>.json`，导入后立即生效，同一个 `code` 再导入一次会覆盖。

---

## 项目结构

```
├── .github/workflows/       # Pages 部署 + APK 云端构建
├── docs/                    # 教程与免责声明（多语言）
├── desktop-wails/           # Windows 桌面壳（Wails + WebView2）
├── android/                 # Capacitor Android 工程
├── scripts/                 # 图标与工具脚本
├── src/
│   ├── core/                # 数据、同步、国际化、更新检测
│   ├── ui/components/       # 顶栏、弹窗、登录
│   ├── ui/views/            # 日历、编辑器、时间线、设置
│   └── styles/              # 黑白玻璃设计系统
└── vite.config.ts
```

---

## 免责声明

用这个软件就表示你同意 [docs/disclaimer.md](docs/disclaimer.md)，第一次启动会自动弹出来。

## 许可证

MIT
