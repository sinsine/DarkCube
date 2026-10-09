# DarkCube

**English** | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md)

> A local-first diary app with a monochrome liquid-glass interface, available as a PWA, a Windows desktop app and an Android app. Your PC and Android device sync with each other, and entries live in your own private GitHub repository instead of a third-party server.

![PWA](https://img.shields.io/badge/PWA-Installable-0a0a0a) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-0a0a0a) ![License](https://img.shields.io/badge/license-MIT-f5f5f5)

---

## Features

- **Write**: One entry per day. Write in Markdown with a live preview, a word count, and auto-save as you type.
- **Weather & Mood**: Pick the day's weather and mood; they sync to GitHub alongside the entry as front matter.
- **Markdown Toolbar**: Headings, bold, italic, quotes, lists, code, links and dividers can be inserted with a tap.
- **4 Languages**: Simplified Chinese, Traditional Chinese, English and Japanese. The system language is detected on first launch.
- **Import Custom Languages**: Translation packs (JSON) made by others can be loaded in.
- **GitHub Cloud Backup**: Entries sync to your private repository, encoded before upload so the repository holds no plain text.
- **Cross-device**: Your PC and Android device share one set of data.
- **Offline-first**: Entries are stored locally first (IndexedDB), so you can keep writing offline.
- **Calendar**: Move across years, swipe left and right, and check “On This Day” at the bottom.
- **Timeline**: Grouped by year. The title is the first sentence of that day's entry, and swiping left deletes it.
- **Update Check**: Checks for a new version on startup.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Build | Vite 6 + React 18 + TypeScript (strict) |
| PWA | vite-plugin-pwa (Workbox) |
| Local | IndexedDB (Dexie.js) |
| Sync | GitHub REST API (Git Data, plain HTTP) |
| Desktop | Wails v2 + system WebView2 (~12MB single binary) |
| Android | Capacitor 8 + GitHub Actions cloud builds |
| Markdown | marked + DOMPurify |
| i18n | Built-in dictionary + custom language packs |

---

## Quick Start

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # production build (dist/)
npm run dist:desktop  # package the Windows desktop app (Wails, needs Go)
```

---

## GitHub Setup

### Create a fine-grained token

1. Open [https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. **Repository access**: **All repositories**
3. **Permissions**:
   - **Contents** → **Read and write** (required for sync)
   - **Administration** → **Read and write** (required for auto-creating the repo)

### Login in the app

Open “Login GitHub” in the top bar, paste the token, and enter a repository name. It defaults to `darkcube-diary` and creates a private repository if that name is free.

> A full illustrated tutorial is in the app; the docs are at [docs/login-tutorial.en.md](docs/login-tutorial.en.md).

### Sync

- **Push**: local → cloud
- **Pull**: cloud → local
- **Auto sync**: two-way sync when the app opens or the network returns
- **Delete**: swipe left in the timeline (local and cloud)

---

## Deploy to GitHub Pages

1. Push the code to a public repo
2. Repository **Settings → Pages → Source: GitHub Actions** (uses the bundled [deploy.yml](.github/workflows/deploy.yml))
3. Open `https://<user>.github.io/<repo>/` — installable on PC and Android

> Diary data stays in your private repo (token-protected); the app shell contains no data.

---

## Languages & Custom Translations

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
- `dict`: `"uiKey": "translation"` map; keys are listed in [src/core/i18n.ts](src/core/i18n.ts); missing keys fall back to the built-in languages

Import in-app: Settings → Language → expand the options → Import language, then pick your `darkcube-<code>.json`. It applies immediately, and importing the same `code` again overwrites it.

---

## Project Structure

```
├── .github/workflows/       # Pages deploy + APK cloud build
├── docs/                    # tutorials & disclaimers (multi-lang)
├── desktop-wails/           # Windows desktop shell (Wails + WebView2)
├── android/                 # Capacitor Android project
├── scripts/                 # icon & tooling scripts
├── src/
│   ├── core/                # data, sync, i18n, update checks
│   ├── ui/components/       # top bar, dialogs, login
│   ├── ui/views/            # calendar, editor, timeline, settings
│   └── styles/              # monochrome glass design system
└── vite.config.ts
```

---

## Disclaimer

By using this app you agree to [docs/disclaimer.en.md](docs/disclaimer.en.md); it appears automatically on first launch.

## License

MIT
