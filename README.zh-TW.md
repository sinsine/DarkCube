# 墨辰DarkCube

[English](README.md) | [简体中文](README.zh-CN.md) | **繁體中文** | [日本語](README.ja.md)

> 一款本地優先的日記應用程式，黑白液態玻璃介面，有 PWA、Windows 桌面版和 Android 三個版本。電腦和安卓之間可以直接同步，日記存在你自己的 GitHub 私有倉庫裡，不經過任何第三方伺服器。

![PWA](https://img.shields.io/badge/PWA-Installable-0a0a0a) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-0a0a0a) ![License](https://img.shields.io/badge/license-MIT-f5f5f5)

---

## 功能

- **寫日記**：一天一篇，用 Markdown 寫，邊寫邊看效果，有字數統計，停下來就自動儲存。
- **天氣與心情**：記下當天的天氣和心情，會跟正文一起同步到 GitHub，存在 front matter 裡。
- **Markdown 工具列**：標題、粗體、斜體、引用、清單、程式碼、連結、分隔線都能點一下就插入。
- **四種語言**：简体中文、繁體中文、English、日本語，第一次打開會依系統語言自動選好。
- **匯入第三方翻譯**：別人做的語言包（JSON）可以直接載入。
- **GitHub 雲端存檔**：日記同步到你的私有倉庫，上傳前會做一層編碼，倉庫裡看不到明文。
- **雙端互通**：電腦和安卓共用同一份資料。
- **離線可用**：資料先存在本機（IndexedDB），斷網照樣能寫。
- **日曆**：可以跨年翻，左右滑動有動畫，底部有「那年今天」。
- **時間線**：依年份分組，標題取當天寫下的第一句話，左滑可以刪除。
- **更新檢查**：啟動時會檢查有沒有新版本。

---

## 技術棧

| 層 | 技術 |
|---|---|
| 建置 | Vite 6 + React 18 + TypeScript（strict） |
| PWA | vite-plugin-pwa（Workbox） |
| 本機儲存 | IndexedDB（Dexie.js） |
| 雲端同步 | GitHub REST API（Git Data，純 HTTP） |
| 桌面 | Wails v2 + 系統 WebView2（單一檔案約 12MB） |
| Android | Capacitor 8 + GitHub Actions 雲端建置 |
| Markdown | marked + DOMPurify |
| 國際化 | 自研詞典 + 自訂語言匯入 |

---

## 快速開始

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # 生產建置（輸出到 dist/）
npm run dist:desktop  # 打包 Windows 桌面版（Wails，需要 Go）
```

---

## GitHub 設定

### 產生細粒度 Token

1. 打開 [https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. **Repository access** 選 **All repositories**
3. **Permissions** 裡勾選：
   - **Contents** → **Read and write**（同步必需）
   - **Administration** → **Read and write**（自動建立倉庫必需）

### 在應用程式內登入

點頂欄的「登入 GitHub」，貼上 Token，填倉庫名稱。預設是 `darkcube-diary`，這個名字沒被佔用的話會自動建立一個私有倉庫。

> 詳細圖文教學在應用程式內；文件在 [docs/login-tutorial.zh-TW.md](docs/login-tutorial.zh-TW.md)。

### 同步

- **上傳**：本機 → 雲端
- **下載**：雲端 → 本機
- **自動同步**：打開應用程式或網路恢復時自動雙向同步
- **刪除**：在時間線左滑刪除，本機和雲端一起刪

---

## 部署到 GitHub Pages

1. 把程式碼推到公開倉庫
2. 倉庫 **Settings → Pages → Source: GitHub Actions**（用倉庫自帶的 [deploy.yml](.github/workflows/deploy.yml)）
3. 打開 `https://<user>.github.io/<repo>/`，電腦和安卓都能安裝

> 日記資料放在你自己的私有倉庫裡，由 Token 保護，應用程式本身不含資料。

---

## 多語言與自訂翻譯

內建简体中文、繁體中文、English、日本語。第一次打開會依系統語言自動選，也可以在設定裡的「語言」一項切換，每種語言獨佔一行，選項可以收合。

**第三方語言包長這樣。**

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

- `code`：語言代碼，例如 `fr`、`pt-BR`，2 到 3 個小寫字母，可以帶 `-大寫` 後綴
- `label`：語言清單裡顯示的名稱
- `usesSpaces`：這種語言詞與詞之間是否用空格分隔（拉丁語系填 `true`，中日韓填 `false`）
- `dict`：`"介面詞條": "譯文"` 的對照表，詞條清單見 [src/core/i18n.ts](src/core/i18n.ts)，沒寫的詞條會回落到內建語言

匯入方式：設定 → 語言 → 展開語言選項 → 匯入語言，選你的 `darkcube-<code>.json`，匯入後立即生效，同一個 `code` 再匯入一次會覆蓋。

---

## 專案結構

```
├── .github/workflows/       # Pages 部署 + APK 雲端建置
├── docs/                    # 教學與免責聲明（多語言）
├── desktop-wails/           # Windows 桌面殼（Wails + WebView2）
├── android/                 # Capacitor Android 專案
├── scripts/                 # 圖示與工具腳本
├── src/
│   ├── core/                # 資料、同步、國際化、更新檢查
│   ├── ui/components/       # 頂欄、彈窗、登入
│   ├── ui/views/            # 日曆、編輯器、時間線、設定
│   └── styles/              # 黑白玻璃設計系統
└── vite.config.ts
```

---

## 免責聲明

使用這個軟體就表示你同意 [docs/disclaimer.zh-TW.md](docs/disclaimer.zh-TW.md)，第一次啟動會自動彈出來。

## 授權條款

MIT
