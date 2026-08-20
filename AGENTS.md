# AGENTS.md — 墨辰DarkCube 开发约定

本文件为 AI 开发者（及人类协作者）在本仓库工作时必须遵守的约定。

## 强制规则：每次创建新版本必须更新更新日志

**任何新版本（版本号变更，例如 1.3.4 → 1.3.5）都必须同步完成以下两件事，缺一不可：**

1. **更新 `src/core/changelog.ts`**：
   - 在 `CHANGELOG` 数组**顶部**新增一条与当前版本对应的条目（`version` / `tag` / `date` / `notes`）。
   - `notes` 必须同时提供 **简体中文、繁体中文、English、日本語** 四种语言（`Record<Lang, string[]>`）。
   - 描述要覆盖该版本的所有用户可见变更（新功能、修复、改进）。

2. **版本号统一**：`package.json` 的 `version` 与 `changelog.ts` 新条目的 `version`/`tag` 必须一致，且与即将发布的 Releases 标签（`vX.Y.Z`）一致。

> 历史教训：v1.3.3 曾因漏更新日志而被用户指出。请在提交新版本代码前自查 `git diff src/core/changelog.ts`。

## 其他约定

- 用户界面文案一律通过 `src/core/i18n.ts` 的 `t()` 输出，不要硬编码中文；新增词条需同时提供 4 种语言。
- 文档（README / docs/）中的用户可见内容尽量中英双语。
- 新版本发布流程：改版本号 → 更新 changelog → `npm run build` 验证 → 本地 `electron-builder --win` 打包 EXE → `gh release create vX.Y.Z`（含 EXE）→ 推标签触发 APK 云端构建。
- Android APK 的 versionName/versionCode 由 `scripts/sync-android-version.mjs` 自动从 `package.json` 同步，无需手动修改 `android/app/build.gradle`。
- 不要在更新日志中提及「免责声明文案调整」等不面向用户的内部改动（如确有需要，遵循用户指示）。
