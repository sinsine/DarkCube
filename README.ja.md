# 墨辰DarkCube

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | **日本語**

> ローカル優先の日記アプリです。白黒のリキッドグラス調インターフェースで、PWA・Windows デスクトップ版・Android 版の 3 つがあります。PC と Android の間でそのまま同期でき、日記はご自身の GitHub プライベートリポジトリに保存されます。第三者のサーバーは経由しません。

![PWA](https://img.shields.io/badge/PWA-Installable-0a0a0a) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-0a0a0a) ![License](https://img.shields.io/badge/license-MIT-f5f5f5)

---

## 機能

- **日記を書く**：1 日 1 件。Markdown で書きながらプレビューを確認でき、文字数が表示され、入力が止まると自動保存されます。
- **天気と気分**：その日の天気と気分を記録すると、本文と一緒に GitHub へ同期されます（front matter として保存）。
- **Markdown ツールバー**：見出し、太字、斜体、引用、リスト、コード、リンク、区切り線をタップで挿入できます。
- **4 言語対応**：简体中文、繁體中文、English、日本語。初回起動時にシステム言語から自動で選ばれます。
- **サードパーティ翻訳の読み込み**：第三者が作成した言語パック（JSON）をそのまま読み込めます。
- **GitHub クラウド保存**：日記はご自身のプライベートリポジトリへ同期されます。アップロード前にエンコードするため、リポジトリに平文は残りません。
- **PC と Android で共有**：同じデータを 2 台で使えます。
- **オフライン対応**：データはまず端末内（IndexedDB）に保存されるので、オフラインでも書き続けられます。
- **カレンダー**：年をまたいで移動でき、左右スワイプで切り替わります。下部には「この日の過去」があります。
- **タイムライン**：年ごとにグループ化され、タイトルはその日の最初の一文です。左スワイプで削除できます。
- **更新確認**：起動時に新しいバージョンがあるか確認します。

---

## 技術スタック

| 層 | 技術 |
|---|---|
| ビルド | Vite 6 + React 18 + TypeScript（strict） |
| PWA | vite-plugin-pwa（Workbox） |
| ローカル保存 | IndexedDB（Dexie.js） |
| 同期 | GitHub REST API（Git Data、HTTP のみ） |
| デスクトップ | Wails v2 + システムの WebView2（単一ファイル約 12MB） |
| Android | Capacitor 8 + GitHub Actions によるクラウドビルド |
| Markdown | marked + DOMPurify |
| 国際化 | 自前の辞書 + カスタム言語の読み込み |

---

## クイックスタート

```bash
npm install
npm run dev           # http://localhost:5173
npm run build         # 本番ビルド（dist/ に出力）
npm run dist:desktop  # Windows デスクトップ版をパッケージ（Wails、Go が必要）
```

---

## GitHub の設定

### 細かい権限のトークンを作成する

1. [https://github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) を開く
2. **Repository access** で **All repositories** を選ぶ
3. **Permissions** で次を設定する
   - **Contents** → **Read and write**（同期に必要）
   - **Administration** → **Read and write**（リポジトリの自動作成に必要）

### アプリ内でログインする

上部バーの「GitHub ログイン」を押し、トークンを貼り付けてリポジトリ名を入力します。既定は `darkcube-diary` で、その名前が空いていればプライベートリポジトリを自動作成します。

> 図解つきの詳しい手順はアプリ内にあります。ドキュメントは [docs/login-tutorial.ja.md](docs/login-tutorial.ja.md) です。

### 同期

- **送信**：ローカル → クラウド
- **取得**：クラウド → ローカル
- **自動同期**：アプリ起動時やネットワーク復帰時に双方向で同期
- **削除**：タイムラインで左スワイプ（ローカルとクラウドの両方から削除）

---

## GitHub Pages へのデプロイ

1. コードを公開リポジトリへプッシュする
2. リポジトリの **Settings → Pages → Source: GitHub Actions** を選ぶ（同梱の [deploy.yml](.github/workflows/deploy.yml) を使います）
3. `https://<user>.github.io/<repo>/` を開く（PC と Android の両方にインストールできます）

> 日記データはご自身のプライベートリポジトリにあり、トークンで保護されます。アプリ本体にデータは含まれません。

---

## 多言語とカスタム翻訳

内蔵言語は 简体中文、繁體中文、English、日本語 です。初回起動時にシステム言語から自動で選ばれ、設定の「言語」から切り替えられます。1 言語につき 1 行で表示され、項目は折りたたむことができます。

**サードパーティの言語パックはこの形式です。**

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

- `code`：言語コード（例：`fr`、`pt-BR`）。小文字 2〜3 文字と、任意で `-大文字` の接尾辞
- `label`：言語一覧に表示される名前
- `usesSpaces`：単語の間に空白を入れる言語かどうか（ラテン系は `true`、日本語・中国語・韓国語は `false`）
- `dict`：`"UI キー": "訳文"` の対応表。キーの一覧は [src/core/i18n.ts](src/core/i18n.ts) にあり、書いていないキーは内蔵言語にフォールバックします

読み込み方：設定 → 言語 → 言語オプションを展開 → 言語を読み込み で `darkcube-<code>.json` を選びます。読み込むとすぐに反映され、同じ `code` をもう一度読み込むと上書きされます。

---

## プロジェクト構成

```
├── .github/workflows/       # Pages デプロイ + APK クラウドビルド
├── docs/                    # チュートリアルと免責事項（多言語）
├── desktop-wails/           # Windows デスクトップシェル（Wails + WebView2）
├── android/                 # Capacitor Android プロジェクト
├── scripts/                 # アイコンとツールのスクリプト
├── src/
│   ├── core/                # データ、同期、国際化、更新確認
│   ├── ui/components/       # トップバー、ダイアログ、ログイン
│   ├── ui/views/            # カレンダー、エディタ、タイムライン、設定
│   └── styles/              # 白黒ガラスのデザインシステム
└── vite.config.ts
```

---

## 免責事項

本アプリを使うと [docs/disclaimer.ja.md](docs/disclaimer.ja.md) に同意したものとみなされます。初回起動時に自動で表示されます。

## ライセンス

MIT
