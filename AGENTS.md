# AGENTS.md — 墨辰DarkCube 开发约定

本文件为 AI 开发者（及人类协作者）在本仓库工作时必须遵守的约定。

## 强制规则：每次创建新版本必须更新更新日志

**任何新版本（版本号变更，例如 1.3.4 → 1.3.5）都必须同步完成以下两件事，缺一不可：**

1. **更新 `src/core/changelog.ts`**：
   - 在 `CHANGELOG` 数组**顶部**新增一条与当前版本对应的条目（`version` / `tag` / `date` / `notes`）。
   - `notes` 必须同时提供 **简体中文、繁体中文、English、日本語** 四种语言（`Record<Lang, string[]>`）。
   - 描述要覆盖该版本的所有用户可见变更（新功能、修复、改进）。

2. **版本号统一**：`package.json` 的 `version` 与 `changelog.ts` 新条目的 `version`/`tag` 必须一致，且与即将发布的 Releases 标签（`vX.Y.Z`）一致。

### 更新日志日期规则（强制）

- `date` 字段必须写**完整日期 `YYYY-MM-DD`**，不要只写年份月份（如 `2026-09`）——月份粒度无法核对，曾出现把 9 月发布的版本写成 8 月的错误。
- 日期取**实际发布当天的本地日期**（本机时区），即创建 git tag / 发布 Release 的那一天。
- 发布后可自查一致性：

  ```bash
  git for-each-ref --sort=creatordate --format='%(refname:short) %(creatordate:format:%Y-%m-%d)' refs/tags
  ```

  该输出应与 `changelog.ts` 中对应条目的 `date` 完全一致；不一致即为错误，必须修正。

> 历史教训：v1.3.3 曾因漏更新日志而被用户指出；v1.4.2 的日期曾被误写为 `2026-08`（实际发布于 2026-09-17）。请在提交新版本代码前自查 `git diff src/core/changelog.ts`。

## 其他约定

- **禁止用 PowerShell 读写含中文的源码/配置**：`Get-Content` / `Set-Content` 在 Windows PowerShell 5.1 下按 ANSI 解码 UTF-8，
  会静默损坏中文并可能破坏 JSON（`package.json`、`engine.ts` 均被此坑损坏过）。
  一律使用编辑工具（read/edit/write）修改；必须用脚本时，用 Node 的 `fs.readFileSync(p, 'utf8')` / `writeFileSync(p, s, 'utf8')`。
- 用户界面文案一律通过 `src/core/i18n.ts` 的 `t()` 输出，不要硬编码中文；新增词条需同时提供 4 种语言。
- 文档（README / docs/）中的用户可见内容尽量中英双语。
- 新版本发布流程：改版本号 → 更新 changelog → `npm run build` 验证 → `npm run dist:desktop` 打包桌面版 → `gh release create vX.Y.Z`（含 exe）→ 推标签触发 APK 云端构建。
- 桌面端**只有一个构建**：Wails + 系统 WebView2，源码在 `desktop-wails/`，产物约 12MB，详见 `docs/desktop.md`（Electron 已于 v2.0.0 彻底下线）。
  - 构建命令：`npm run dist:desktop`（需 Go 1.21+ 与 wails CLI：`go install github.com/wailsapp/wails/v2/cmd/wails@latest`）。
  - exe 版本信息取自 `desktop-wails/wails.json` 的 `info.productVersion`，**每次发版需与 `package.json` 同步修改**（不经脚本同步，易漏）。
  - WebView2 数据目录固定为 `%APPDATA%\DarkCube`（`main.go` 的 `WebviewUserDataPath`），**不要改动**，否则用户本地数据会"消失"。
  - ⚠️ 与旧版本（Electron / 1.5.0 轻量版）的 IndexedDB origin 不同，数据不互通；升级必须走「导出备份 → 导入备份」，应用启动时会自动提示。
  - CI 尚未自动化桌面构建（需要 Go + Wails 工具链），发版时本地构建后上传 Release。
- Android APK 的 versionName/versionCode 由 `scripts/sync-android-version.mjs` 自动从 `package.json` 同步，无需手动修改 `android/app/build.gradle`。
- 不要在更新日志中提及「免责声明文案调整」等不面向用户的内部改动（如确有需要，遵循用户指示）。
