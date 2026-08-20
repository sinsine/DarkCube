/** 国际化：简体中文 / 繁体中文 / English / 日本語 */

import { useEffect, useState } from 'react'

export type Lang = 'zh-CN' | 'zh-TW' | 'en' | 'ja'

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'zh-CN', label: '简体中文' },
  { id: 'zh-TW', label: '繁體中文' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: '日本語' }
]

const KEY = 'darkcube-lang'

type Strings = Record<Lang, string>

const dict: Record<string, Strings> = {
  // ---- 导航 / 顶栏 ----
  'nav.calendar': { 'zh-CN': '日历', 'zh-TW': '日曆', en: 'Calendar', ja: 'カレンダー' },
  'nav.timeline': { 'zh-CN': '时间线', 'zh-TW': '時間線', en: 'Timeline', ja: 'タイムライン' },
  'nav.settings': { 'zh-CN': '设置', 'zh-TW': '設定', en: 'Settings', ja: '設定' },
  'nav.write': { 'zh-CN': '写日记', 'zh-TW': '寫日記', en: 'Write', ja: '書く' },
  'nav.login': { 'zh-CN': '登录 GitHub', 'zh-TW': '登入 GitHub', en: 'Login GitHub', ja: 'GitHub ログイン' },
  'topbar.theme.dark': { 'zh-CN': '切换夜间模式', 'zh-TW': '切換夜間模式', en: 'Switch to dark mode', ja: 'ダークモードへ' },
  'topbar.theme.light': { 'zh-CN': '切换日间模式', 'zh-TW': '切換日間模式', en: 'Switch to light mode', ja: 'ライトモードへ' },

  // ---- 日历 ----
  'calendar.prevYear': { 'zh-CN': '上一年', 'zh-TW': '上一年', en: 'Previous year', ja: '前年' },
  'calendar.prevMonth': { 'zh-CN': '上个月', 'zh-TW': '上個月', en: 'Previous month', ja: '前月' },
  'calendar.nextMonth': { 'zh-CN': '下个月', 'zh-TW': '下個月', en: 'Next month', ja: '翌月' },
  'calendar.nextYear': { 'zh-CN': '下一年', 'zh-TW': '下一年', en: 'Next year', ja: '翌年' },
  'calendar.today': { 'zh-CN': '今天', 'zh-TW': '今天', en: 'Today', ja: '今日' },
  'calendar.onThisDay': { 'zh-CN': '那年今天', 'zh-TW': '那年今天', en: 'On this day', ja: 'この日の過去' },
  'calendar.yearsAgo': { 'zh-CN': '{n} 年前', 'zh-TW': '{n} 年前', en: '{n} years ago', ja: '{n}年前' },

  // ---- 编辑器 ----
  'editor.prevDay': { 'zh-CN': '前一天', 'zh-TW': '前一天', en: 'Previous day', ja: '前日' },
  'editor.nextDay': { 'zh-CN': '后一天', 'zh-TW': '後一天', en: 'Next day', ja: '翌日' },
  'editor.hasEntry': { 'zh-CN': '已有日记', 'zh-TW': '已有日記', en: 'Has entry', ja: '日記あり' },
  'editor.newEntry': { 'zh-CN': '新日记', 'zh-TW': '新日記', en: 'New entry', ja: '新規' },
  'editor.weather': { 'zh-CN': '天气', 'zh-TW': '天氣', en: 'Weather', ja: '天気' },
  'editor.mood': { 'zh-CN': '心情', 'zh-TW': '心情', en: 'Mood', ja: '気分' },
  'editor.edit': { 'zh-CN': '编辑', 'zh-TW': '編輯', en: 'Edit', ja: '編集' },
  'editor.preview': { 'zh-CN': '预览', 'zh-TW': '預覽', en: 'Preview', ja: 'プレビュー' },
  'editor.words': { 'zh-CN': '{n} 字', 'zh-TW': '{n} 字', en: '{n} chars', ja: '{n}字' },
  'editor.saving': { 'zh-CN': '保存中…', 'zh-TW': '儲存中…', en: 'Saving…', ja: '保存中…' },
  'editor.saved': { 'zh-CN': '已保存', 'zh-TW': '已儲存', en: 'Saved', ja: '保存済み' },
  'editor.collapseToolbar': { 'zh-CN': '收起格式栏 ▴', 'zh-TW': '收起格式列 ▴', en: 'Collapse toolbar ▴', ja: 'ツールバーを閉じる ▴' },
  'editor.expandToolbar': { 'zh-CN': '展开格式栏 ▾', 'zh-TW': '展開格式列 ▾', en: 'Expand toolbar ▾', ja: 'ツールバーを開く ▾' },
  'editor.jumpDate': { 'zh-CN': '跳转到指定日期', 'zh-TW': '跳轉到指定日期', en: 'Jump to date', ja: '日付へ移動' },
  'editor.placeholder': {
    'zh-CN': '在这里写下今天的思绪…\n\n支持 Markdown：\n# 标题\n**加粗** · *斜体* · - 列表 · > 引用',
    'zh-TW': '在這裡寫下今天的思緒…\n\n支援 Markdown：\n# 標題\n**粗體** · *斜體* · - 列表 · > 引用',
    en: 'Write your thoughts for today…\n\nMarkdown supported:\n# Heading\n**bold** · *italic* · - list · > quote',
    ja: '今日の思いをここに…\n\nMarkdown 対応：\n# 見出し\n**太字** · *斜体* · - リスト · > 引用'
  },
  'editor.note': {
    'zh-CN': '内容将自动保存在本机（IndexedDB），登录 GitHub 后可同步到私有仓库。',
    'zh-TW': '內容將自動儲存在本機（IndexedDB），登入 GitHub 後可同步到私有倉庫。',
    en: 'Content is saved locally (IndexedDB). After logging in to GitHub it can be synced to your private repository.',
    ja: '内容は端末（IndexedDB）に自動保存されます。GitHub にログインするとプライベートリポジトリに同期できます。'
  },

  // ---- 天气 / 心情 ----
  'weather.sunny': { 'zh-CN': '晴', 'zh-TW': '晴', en: 'Sunny', ja: '晴れ' },
  'weather.cloudy': { 'zh-CN': '多云', 'zh-TW': '多雲', en: 'Cloudy', ja: '曇り' },
  'weather.overcast': { 'zh-CN': '阴', 'zh-TW': '陰', en: 'Overcast', ja: '曇' },
  'weather.rain': { 'zh-CN': '雨', 'zh-TW': '雨', en: 'Rain', ja: '雨' },
  'weather.snow': { 'zh-CN': '雪', 'zh-TW': '雪', en: 'Snow', ja: '雪' },
  'weather.wind': { 'zh-CN': '风', 'zh-TW': '風', en: 'Windy', ja: '風' },
  'mood.happy': { 'zh-CN': '开心', 'zh-TW': '開心', en: 'Happy', ja: '嬉しい' },
  'mood.calm': { 'zh-CN': '平静', 'zh-TW': '平靜', en: 'Calm', ja: '穏やか' },
  'mood.sad': { 'zh-CN': '难过', 'zh-TW': '難過', en: 'Sad', ja: '悲しい' },
  'mood.angry': { 'zh-CN': '生气', 'zh-TW': '生氣', en: 'Angry', ja: '怒り' },
  'mood.tired': { 'zh-CN': '疲惫', 'zh-TW': '疲憊', en: 'Tired', ja: '疲れ' },
  'mood.excited': { 'zh-CN': '兴奋', 'zh-TW': '興奮', en: 'Excited', ja: '興奮' },

  // ---- 时间线 ----
  'timeline.delete': { 'zh-CN': '删除', 'zh-TW': '刪除', en: 'Delete', ja: '削除' },
  'timeline.confirmDelete': {
    'zh-CN': '确定删除这篇日记？此操作会同步删除云端备份，且不可恢复。',
    'zh-TW': '確定刪除這篇日記？此操作會同步刪除雲端備份，且無法復原。',
    en: 'Delete this entry? This will also delete the cloud backup permanently.',
    ja: 'この日記を削除しますか？クラウドのバックアップも削除され、元に戻せません。'
  },
  'timeline.empty': { 'zh-CN': '还没有日记', 'zh-TW': '還沒有日記', en: 'No entries yet', ja: 'まだ日記がありません' },
  'timeline.emptyHint': {
    'zh-CN': '点击「写日记」留下第一篇',
    'zh-TW': '點擊「寫日記」留下第一篇',
    en: 'Tap "Write" to create your first entry',
    ja: '「書く」をタップして最初の日記を'
  },
  'timeline.count': { 'zh-CN': '{n} 篇', 'zh-TW': '{n} 篇', en: '{n} entries', ja: '{n}件' },
  'timeline.untitled': { 'zh-CN': '（无标题）', 'zh-TW': '（無標題）', en: '(Untitled)', ja: '(無題)' },
  'timeline.conflicts': {
    'zh-CN': '⚠ {n} 篇冲突备份：同步时本地被远端覆盖的内容已保留为仓库中的 .conflict.md 文件',
    'zh-TW': '⚠ {n} 篇衝突備份：同步時本地被遠端覆蓋的內容已保留為倉庫中的 .conflict.md 檔案',
    en: '⚠ {n} conflict backup(s): content overwritten during sync is kept as .conflict.md in the repository',
    ja: '⚠ 競合バックアップ {n} 件：同期時に上書きされた内容はリポジトリ内の .conflict.md として保持されています'
  },

  // ---- 设置 ----
  'settings.githubSection': { 'zh-CN': 'GitHub 云存档', 'zh-TW': 'GitHub 雲端存檔', en: 'GitHub cloud backup', ja: 'GitHub クラウド保存' },
  'settings.syncSection': { 'zh-CN': '同步', 'zh-TW': '同步', en: 'Sync', ja: '同期' },
  'settings.loggedOut': {
    'zh-CN': '尚未登录 GitHub。登录后即可将日记同步到你的私有仓库作为云存档。',
    'zh-TW': '尚未登入 GitHub。登入後即可將日記同步到你的私有倉庫作為雲端存檔。',
    en: 'Not logged in to GitHub yet. After login, entries can be synced to your private repository as cloud backup.',
    ja: 'まだ GitHub にログインしていません。ログインすると、プライベートリポジトリに日記を同期してクラウド保存できます。'
  },
  'settings.reLogin': { 'zh-CN': '重新登录', 'zh-TW': '重新登入', en: 'Re-login', ja: '再ログイン' },
  'settings.logout': { 'zh-CN': '退出登录', 'zh-TW': '登出', en: 'Log out', ja: 'ログアウト' },
  'settings.autoSync': { 'zh-CN': '自动同步', 'zh-TW': '自動同步', en: 'Auto sync', ja: '自動同期' },
  'settings.autoSyncDesc': {
    'zh-CN': '打开应用或恢复联网时自动拉取与推送',
    'zh-TW': '開啟應用程式或恢復連網時自動拉取與推送',
    en: 'Auto pull & push when the app opens or the network returns',
    ja: 'アプリ起動時やネットワーク復帰時に自動で同期'
  },
  'settings.manualSync': { 'zh-CN': '手动同步', 'zh-TW': '手動同步', en: 'Manual sync', ja: '手動同期' },
  'settings.pull': { 'zh-CN': '↓ 下载', 'zh-TW': '↓ 下載', en: '↓ Pull', ja: '↓ 取得' },
  'settings.push': { 'zh-CN': '↑ 上传', 'zh-TW': '↑ 上傳', en: '↑ Push', ja: '↑ 送信' },
  'settings.busy': { 'zh-CN': '进行中…', 'zh-TW': '進行中…', en: 'Working…', ja: '処理中…' },
  'settings.lastSync': { 'zh-CN': '最近同步：{t}', 'zh-TW': '最近同步：{t}', en: 'Last sync: {t}', ja: '最終同期：{t}' },
  'settings.notSynced': { 'zh-CN': '尚未同步', 'zh-TW': '尚未同步', en: 'Not synced yet', ja: '未同期' },
  'settings.syncDoing': { 'zh-CN': '同步中…', 'zh-TW': '同步中…', en: 'Syncing…', ja: '同期中…' },
  'settings.pushDoing': { 'zh-CN': '上传中…', 'zh-TW': '上傳中…', en: 'Pushing…', ja: '送信中…' },
  'settings.pullDoing': { 'zh-CN': '下载中…', 'zh-TW': '下載中…', en: 'Pulling…', ja: '取得中…' },
  'settings.pushDone': { 'zh-CN': '上传完成：推送 {n} 篇', 'zh-TW': '上傳完成：推送 {n} 篇', en: 'Push complete: {n} entries', ja: '送信完了：{n}件' },
  'settings.pullDone': { 'zh-CN': '下载完成：拉取 {n} 篇', 'zh-TW': '下載完成：拉取 {n} 篇', en: 'Pull complete: {n} entries', ja: '取得完了：{n}件' },
  'settings.pullDoneConflict': { 'zh-CN': ' · 冲突 {n}（旧内容已备份）', 'zh-TW': ' · 衝突 {n}（舊內容已備份）', en: ' · {n} conflict(s) (old content backed up)', ja: ' · 競合 {n}件（旧内容はバックアップ済み）' },
  'settings.syncDone': { 'zh-CN': '完成：拉取 {a} · 推送 {b}', 'zh-TW': '完成：拉取 {a} · 推送 {b}', en: 'Done: pulled {a}, pushed {b}', ja: '完了：取得 {a}、送信 {b}' },
  'settings.syncDoneConflict': {
    'zh-CN': '完成：拉取 {a} · 推送 {b} · 冲突 {c}（旧内容已备份为 .conflict.md）',
    'zh-TW': '完成：拉取 {a} · 推送 {b} · 衝突 {c}（舊內容已備份為 .conflict.md）',
    en: 'Done: pulled {a}, pushed {b}, {c} conflict(s) (old content saved as .conflict.md)',
    ja: '完了：取得 {a}、送信 {b}、競合 {c}件（旧内容は .conflict.md に保存）'
  },
  'settings.syncFail': { 'zh-CN': '同步失败（{step}）：{msg}', 'zh-TW': '同步失敗（{step}）：{msg}', en: 'Sync failed ({step}): {msg}', ja: '同期失敗（{step}）：{msg}' },
  'settings.syncFailPlain': { 'zh-CN': '同步失败：{msg}', 'zh-TW': '同步失敗：{msg}', en: 'Sync failed: {msg}', ja: '同期失敗：{msg}' },
  'settings.pushFail': { 'zh-CN': '上传失败（{step}）：{msg}', 'zh-TW': '上傳失敗（{step}）：{msg}', en: 'Push failed ({step}): {msg}', ja: '送信失敗（{step}）：{msg}' },
  'settings.pushFailPlain': { 'zh-CN': '上传失败：{msg}', 'zh-TW': '上傳失敗：{msg}', en: 'Push failed: {msg}', ja: '送信失敗：{msg}' },
  'settings.pullFail': { 'zh-CN': '下载失败（{step}）：{msg}', 'zh-TW': '下載失敗（{step}）：{msg}', en: 'Pull failed ({step}): {msg}', ja: '取得失敗（{step}）：{msg}' },
  'settings.pullFailPlain': { 'zh-CN': '下载失败：{msg}', 'zh-TW': '下載失敗：{msg}', en: 'Pull failed: {msg}', ja: '取得失敗：{msg}' },
  'settings.dataSection': { 'zh-CN': '数据', 'zh-TW': '資料', en: 'Data', ja: 'データ' },
  'settings.export': { 'zh-CN': '导出备份', 'zh-TW': '匯出備份', en: 'Export backup', ja: 'バックアップ書き出し' },
  'settings.exportDesc': {
    'zh-CN': '将全部日记与冲突备份导出为 JSON 文件',
    'zh-TW': '將全部日記與衝突備份匯出為 JSON 檔案',
    en: 'Export all entries and conflict backups as a JSON file',
    ja: 'すべての日記と競合バックアップを JSON ファイルに書き出します'
  },
  'settings.exportBtn': { 'zh-CN': '导出', 'zh-TW': '匯出', en: 'Export', ja: '書き出し' },
  'settings.import': { 'zh-CN': '导入备份', 'zh-TW': '匯入備份', en: 'Import backup', ja: 'バックアップ読み込み' },
  'settings.importDesc': {
    'zh-CN': '从 JSON 备份恢复日记（覆盖同名日期，下次同步自动上传）',
    'zh-TW': '從 JSON 備份恢復日記（覆蓋同名日期，下次同步自動上傳）',
    en: 'Restore entries from a JSON backup (overwrites same dates, uploaded on next sync)',
    ja: 'JSON バックアップから日記を復元（同日付は上書き、次回同期で自動アップロード）'
  },
  'settings.importBtn': { 'zh-CN': '导入', 'zh-TW': '匯入', en: 'Import', ja: '読み込み' },
  'settings.importDone': { 'zh-CN': '导入完成：{n} 篇日记（覆盖同名日期）', 'zh-TW': '匯入完成：{n} 篇日記（覆蓋同名日期）', en: 'Import complete: {n} entries (same dates overwritten)', ja: '読み込み完了：{n}件（同日付は上書き）' },
  'settings.importBad': {
    'zh-CN': '文件格式不正确：缺少 entries 数组（请使用本应用导出的备份）',
    'zh-TW': '檔案格式不正確：缺少 entries 陣列（請使用本應用程式匯出的備份）',
    en: 'Invalid file format: missing entries array (use a backup exported by this app)',
    ja: 'ファイル形式が正しくありません：entries 配列がありません（本アプリで書き出したバックアップを使用してください）'
  },
  'settings.importFail': { 'zh-CN': '导入失败：文件不是有效的 JSON 备份', 'zh-TW': '匯入失敗：檔案不是有效的 JSON 備份', en: 'Import failed: file is not a valid JSON backup', ja: '読み込み失敗：有効な JSON バックアップではありません' },
  'settings.clear': { 'zh-CN': '清空本地数据', 'zh-TW': '清空本機資料', en: 'Clear local data', ja: 'ローカルデータを消去' },
  'settings.clearDesc': {
    'zh-CN': '删除本机所有日记与配置（已同步内容仍在仓库中）',
    'zh-TW': '刪除本機所有日記與設定（已同步內容仍在倉庫中）',
    en: 'Delete all local entries and settings (synced content stays in the repository)',
    ja: '端末のすべての日記と設定を削除（同期済みの内容はリポジトリに残ります）'
  },
  'settings.clearBtn': { 'zh-CN': '清空', 'zh-TW': '清空', en: 'Clear', ja: '消去' },
  'settings.clearConfirm': {
    'zh-CN': '确定清空本机所有日记与配置？此操作不可恢复（已同步到 GitHub 的内容仍保留在仓库中）。',
    'zh-TW': '確定清空本機所有日記與設定？此操作無法復原（已同步到 GitHub 的內容仍保留在倉庫中）。',
    en: 'Clear all local entries and settings? This cannot be undone (content already synced to GitHub stays in the repository).',
    ja: '端末のすべての日記と設定を消去しますか？この操作は元に戻せません（GitHub に同期済みの内容はリポジトリに残ります）。'
  },
  'settings.aboutSection': { 'zh-CN': '外观与关于', 'zh-TW': '外觀與關於', en: 'Appearance & About', ja: '外観と情報' },
  'settings.lightMode': { 'zh-CN': '日间模式', 'zh-TW': '日間模式', en: 'Light mode', ja: 'ライトモード' },
  'settings.lightModeDesc': { 'zh-CN': '黑白反转的亮色界面', 'zh-TW': '黑白反轉的亮色介面', en: 'Inverted monochrome light interface', ja: '白黒反転のライトな画面' },
  'settings.langSection': { 'zh-CN': '语言', 'zh-TW': '語言', en: 'Language', ja: '言語' },
  'settings.aboutDesc': { 'zh-CN': '本地优先 · GitHub 私有仓库云存档', 'zh-TW': '本地優先 · GitHub 私有倉庫雲端存檔', en: 'Local-first · GitHub private repo backup', ja: 'ローカル優先 · GitHub プライベートリポジトリ保存' },
  'settings.checkUpdate': { 'zh-CN': '检查更新', 'zh-TW': '檢查更新', en: 'Check for updates', ja: '更新を確認' },
  'settings.newVersion': { 'zh-CN': '发现新版本 {v}，点击右侧前往下载', 'zh-TW': '發現新版本 {v}，點擊右側前往下載', en: 'New version {v} available, click to download', ja: '新しいバージョン {v} があります。右側からダウンロードできます' },
  'settings.latest': { 'zh-CN': '已是最新版本（{v}）', 'zh-TW': '已是最新版本（{v}）', en: 'You are up to date ({v})', ja: '最新版です（{v}）' },
  'settings.latestRelease': { 'zh-CN': '前往 GitHub Releases 查看最新版本', 'zh-TW': '前往 GitHub Releases 查看最新版本', en: 'Visit GitHub Releases for the latest version', ja: 'GitHub Releases で最新版を確認' },
  'settings.releasesBtn': { 'zh-CN': '最新 Releases ↗', 'zh-TW': '最新 Releases ↗', en: 'Latest Releases ↗', ja: '最新リリース ↗' },
  'settings.changelog': { 'zh-CN': '📜 历史更新日志', 'zh-TW': '📜 歷史更新日誌', en: '📜 Changelog', ja: '📜 更新履歴' },
  'settings.author': { 'zh-CN': '作者 B 站主页 ↗', 'zh-TW': '作者 B 站主頁 ↗', en: "Author's Bilibili ↗", ja: '作者のB站ホーム ↗' },
  'settings.disclaimer': { 'zh-CN': '📄 免责声明', 'zh-TW': '📄 免責聲明', en: '📄 Disclaimer', ja: '📄 免責事項' },
  'settings.install': { 'zh-CN': '安装应用到桌面 / 主屏幕', 'zh-TW': '安裝應用程式到桌面 / 主畫面', en: 'Install app to desktop / home screen', ja: 'デスクトップ／ホーム画面にインストール' },

  // ---- 登录 ----
  'login.title': { 'zh-CN': '登录 GitHub', 'zh-TW': '登入 GitHub', en: 'Login GitHub', ja: 'GitHub ログイン' },
  'login.subtitle': {
    'zh-CN': '云存档 · 仓库不存在时自动创建私有仓库',
    'zh-TW': '雲端存檔 · 倉庫不存在時自動建立私有倉庫',
    en: 'Cloud backup · auto-creates a private repo if missing',
    ja: 'クラウド保存 · リポジトリがなければ自動で作成'
  },
  'login.repoName': { 'zh-CN': '仓库名（不存在则自动创建私有仓库）', 'zh-TW': '倉庫名稱（不存在則自動建立私有倉庫）', en: 'Repo name (auto-creates a private repo if missing)', ja: 'リポジトリ名（なければ自動で作成）' },
  'login.tokenHelper': { 'zh-CN': '没有 Token？打开 GitHub 生成细粒度 Token ↗', 'zh-TW': '沒有 Token？開啟 GitHub 產生細粒度 Token ↗', en: 'No token? Open GitHub to create a fine-grained token ↗', ja: 'トークンがない？GitHub で詳細トークンを作成 ↗' },
  'login.submit': { 'zh-CN': '登录并创建仓库', 'zh-TW': '登入並建立倉庫', en: 'Login & create repo', ja: 'ログインして作成' },
  'login.submitting': { 'zh-CN': '登录中…', 'zh-TW': '登入中…', en: 'Logging in…', ja: 'ログイン中…' },
  'login.cancel': { 'zh-CN': '取消', 'zh-TW': '取消', en: 'Cancel', ja: 'キャンセル' },
  'login.show': { 'zh-CN': '显示', 'zh-TW': '顯示', en: 'Show', ja: '表示' },
  'login.hide': { 'zh-CN': '隐藏', 'zh-TW': '隱藏', en: 'Hide', ja: '非表示' },
  'login.note': {
    'zh-CN': '提示：Token 仅保存在本机浏览器。仓库不存在时会自动创建为私有仓库。',
    'zh-TW': '提示：Token 僅儲存在本機瀏覽器。倉庫不存在時會自動建立為私有倉庫。',
    en: 'Note: the token is only stored in this browser. If the repo does not exist, a private one is created automatically.',
    ja: '注意：トークンはこのブラウザにのみ保存されます。リポジトリがなければ自動で作成されます。'
  },
  'login.tutorialBtn': { 'zh-CN': '📖 不会操作 GitHub？查看新手登录教程', 'zh-TW': '📖 不會操作 GitHub？查看新手登入教學', en: '📖 New to GitHub? View the login tutorial', ja: '📖 GitHub 初心者？ログインチュートリアルを見る' },

  // ---- 弹窗 ----
  'dialog.disclaimer': { 'zh-CN': '免责声明', 'zh-TW': '免責聲明', en: 'Disclaimer', ja: '免責事項' },
  'dialog.disclaimerSub': { 'zh-CN': '请仔细阅读', 'zh-TW': '請仔細閱讀', en: 'Please read carefully', ja: 'よくお読みください' },
  'dialog.changelog': { 'zh-CN': '历史更新日志', 'zh-TW': '歷史更新日誌', en: 'Changelog', ja: '更新履歴' },
  'dialog.changelogSub': { 'zh-CN': '点击版本号可直达该版本的 Releases 页面', 'zh-TW': '點擊版本號可直達該版本的 Releases 頁面', en: 'Click a version to open its Releases page', ja: 'バージョンをクリックするとそのリリースページへ移動します' },
  'dialog.close': { 'zh-CN': '关闭', 'zh-TW': '關閉', en: 'Close', ja: '閉じる' },
  'dialog.tutorial': { 'zh-CN': 'GitHub 登录教程（小白向）', 'zh-TW': 'GitHub 登入教學（新手向）', en: 'GitHub Login Tutorial (Beginner)', ja: 'GitHub ログインチュートリアル（初心者向け）' },
  'dialog.tutorialSub': { 'zh-CN': '从零开始，约 10 分钟完成配置', 'zh-TW': '從零開始，約 10 分鐘完成設定', en: 'Complete setup in about 10 minutes', ja: '約10分でセットアップ完了' },
  'dialog.releases': { 'zh-CN': 'Releases ↗', 'zh-TW': 'Releases ↗', en: 'Releases ↗', ja: 'リリース ↗' },

  // ---- 错误 / 同步步骤 ----
  'errors.notLoggedIn': { 'zh-CN': '请先登录 GitHub', 'zh-TW': '請先登入 GitHub', en: 'Please log in to GitHub first', ja: '先に GitHub にログインしてください' },
  'errors.tokenInvalid': { 'zh-CN': 'Token 无效或已过期，请重新生成后输入', 'zh-TW': 'Token 無效或已過期，請重新產生後輸入', en: 'Token is invalid or expired, please regenerate it', ja: 'トークンが無効または期限切れです。再生成してください' },
  'errors.forbidden': { 'zh-CN': '访问被拒绝：请检查 Token 是否勾选「Contents 读写」权限', 'zh-TW': '存取被拒絕：請檢查 Token 是否勾選「Contents 讀寫」權限', en: 'Access denied: check that the token has Contents read/write permission', ja: 'アクセスが拒否されました：トークンに Contents の読み書き権限があるか確認してください' },
  'errors.notFound': { 'zh-CN': '仓库不存在，或该 Token 没有访问此仓库的权限', 'zh-TW': '倉庫不存在，或該 Token 沒有存取此倉庫的權限', en: 'Repository not found, or the token has no access to it', ja: 'リポジトリが見つからないか、トークンにアクセス権限がありません' },
  'errors.conflict409': { 'zh-CN': '请求冲突：仓库为空或状态异常，请稍后重试', 'zh-TW': '請求衝突：倉庫為空或狀態異常，請稍後重試', en: 'Conflict: repository is empty or unavailable, please retry later', ja: '競合：リポジトリが空か利用不可です。後でもう一度お試しください' },
  'errors.invalid422': { 'zh-CN': '请求无效（422）：文件或仓库已存在，或仓库状态异常，请重试', 'zh-TW': '請求無效（422）：檔案或倉庫已存在，或倉庫狀態異常，請重試', en: 'Invalid request (422): file/repo already exists or state is abnormal, please retry', ja: 'リクエストが無効です（422）：ファイルまたはリポジトリが既に存在するか、状態が異常です' },
  'errors.network': { 'zh-CN': '网络连接失败，请检查网络后重试', 'zh-TW': '網路連線失敗，請檢查網路後重試', en: 'Network error, please check your connection and retry', ja: 'ネットワーク接続に失敗しました。接続を確認して再試行してください' },
  'errors.unknown': { 'zh-CN': '发生未知错误', 'zh-TW': '發生未知錯誤', en: 'An unknown error occurred', ja: '不明なエラーが発生しました' },
  'errors.repoExists': { 'zh-CN': '仓库「{name}」已存在但无法访问，或创建失败：请更换仓库名或检查 Token 权限', 'zh-TW': '倉庫「{name}」已存在但無法存取，或建立失敗：請更換倉庫名稱或檢查 Token 權限', en: 'Repo "{name}" exists but is inaccessible, or creation failed: change the repo name or check token permissions', ja: 'リポジトリ「{name}」は存在しますがアクセスできないか、作成に失敗しました：名前を変えるか権限を確認してください' },
  'errors.initFailed': { 'zh-CN': '仓库初始化失败，请稍后重试', 'zh-TW': '倉庫初始化失敗，請稍後重試', en: 'Repository initialization failed, please retry', ja: 'リポジトリの初期化に失敗しました。後でもう一度お試しください' },
  'errors.noRef': { 'zh-CN': '缺少远端分支引用，无法提交（请重试）', 'zh-TW': '缺少遠端分支參照，無法提交（請重試）', en: 'Missing remote branch reference, cannot commit (retry)', ja: 'リモートブランチ参照がありません。コミットできません（再試行）' },
  'errors.badRequest': { 'zh-CN': '请求参数错误，请检查输入', 'zh-TW': '請求參數錯誤，請檢查輸入', en: 'Bad request, please check the input', ja: 'リクエストパラメータが不正です。入力を確認してください' },
  'step.readBranch': { 'zh-CN': '读取分支', 'zh-TW': '讀取分支', en: 'read branch', ja: 'ブランチ読み取り' },
  'step.readRepo': { 'zh-CN': '读取仓库信息', 'zh-TW': '讀取倉庫資訊', en: 'read repo info', ja: 'リポジトリ情報の読み取り' },
  'step.probeBranch': { 'zh-CN': '探测分支', 'zh-TW': '探測分支', en: 'probe branch', ja: 'ブランチの確認' },
  'step.initRepo': { 'zh-CN': '初始化空仓库', 'zh-TW': '初始化空倉庫', en: 'initialize repository', ja: '空リポジトリの初期化' },
  'step.readCommit': { 'zh-CN': '读取提交', 'zh-TW': '讀取提交', en: 'read commit', ja: 'コミット読み取り' },
  'step.readTree': { 'zh-CN': '读取文件列表', 'zh-TW': '讀取檔案列表', en: 'read file list', ja: 'ファイル一覧の読み取り' },
  'step.download': { 'zh-CN': '下载日记', 'zh-TW': '下載日記', en: 'download entry', ja: '日記の取得' },
  'step.upload': { 'zh-CN': '上传日记', 'zh-TW': '上傳日記', en: 'upload entry', ja: '日記の送信' },
  'step.uploadConflict': { 'zh-CN': '上传冲突备份', 'zh-TW': '上傳衝突備份', en: 'upload conflict backup', ja: '競合バックアップの送信' },
  'step.buildTree': { 'zh-CN': '构建提交树', 'zh-TW': '建立提交樹', en: 'build commit tree', ja: 'コミットツリーの構築' },
  'step.createCommit': { 'zh-CN': '创建提交', 'zh-TW': '建立提交', en: 'create commit', ja: 'コミット作成' },
  'step.updateBranch': { 'zh-CN': '更新分支', 'zh-TW': '更新分支', en: 'update branch', ja: 'ブランチ更新' },

  // ---- 语言设置（v1.3.2） ----
  'settings.langExpand': { 'zh-CN': '展开语言选项', 'zh-TW': '展開語言選項', en: 'Expand language options', ja: '言語オプションを展開' },
  'settings.langCollapse': { 'zh-CN': '收起语言选项', 'zh-TW': '收起語言選項', en: 'Collapse language options', ja: '言語オプションを折りたたむ' },
  'settings.langImport': { 'zh-CN': '导入语言', 'zh-TW': '匯入語言', en: 'Import language', ja: '言語を読み込み' },
  'settings.langImportDesc': {
    'zh-CN': '导入第三方开发者制作的翻译文件（JSON），立即切换并使用',
    'zh-TW': '匯入第三方開發者製作的翻譯檔案（JSON），立即切換並使用',
    en: 'Import a translation file (JSON) made by third-party developers and switch to it immediately',
    ja: '第三者が作成した翻訳ファイル（JSON）を読み込み、すぐに切り替えて使用します'
  },
  'settings.langImportDone': { 'zh-CN': '已导入语言「{label}」并切换', 'zh-TW': '已匯入語言「{label}」並切換', en: 'Imported language "{label}" and switched', ja: '言語「{label}」を読み込み、切り替えました' },
  'settings.langImportBad': { 'zh-CN': '文件格式不正确：需要 code / label / dict 字段', 'zh-TW': '檔案格式不正確：需要 code / label / dict 欄位', en: 'Invalid file format: needs code / label / dict fields', ja: 'ファイル形式が不正です：code / label / dict が必要です' },
  'settings.langImportFail': { 'zh-CN': '导入失败：无法解析该文件', 'zh-TW': '匯入失敗：無法解析該檔案', en: 'Import failed: cannot parse the file', ja: '読み込み失敗：ファイルを解析できません' },
  'settings.langRemove': { 'zh-CN': '移除', 'zh-TW': '移除', en: 'Remove', ja: '削除' },

  // ---- 编辑器导出 ----
  'editor.exportMd': { 'zh-CN': '导出 .md', 'zh-TW': '匯出 .md', en: 'Export .md', ja: '.md を書き出し' },

  // ---- 更新弹窗 ----
  'update.title': { 'zh-CN': '发现新版本', 'zh-TW': '發現新版本', en: 'New version available', ja: '新しいバージョンがあります' },
  'update.subtitle': { 'zh-CN': 'v{version} 已发布', 'zh-TW': 'v{version} 已發布', en: 'v{version} released', ja: 'v{version} がリリースされました' },
  'update.desc': {
    'zh-CN': '检测到新版本 {v}，是否前往 GitHub Releases 下载更新？',
    'zh-TW': '偵測到新版本 {v}，是否前往 GitHub Releases 下載更新？',
    en: 'A new version {v} is available. Go to GitHub Releases to download it?',
    ja: '新しいバージョン {v} があります。GitHub Releases からダウンロードしますか？'
  },
  'update.go': { 'zh-CN': '前往 Releases', 'zh-TW': '前往 Releases', en: 'Go to Releases', ja: 'リリースへ' },
  'update.later': { 'zh-CN': '稍后再说', 'zh-TW': '稍後再說', en: 'Later', ja: '後で' },
  'update.dismiss': { 'zh-CN': '不再提醒（此版本）', 'zh-TW': '不再提醒（此版本）', en: "Don't remind again (this version)", ja: '再表示しない（このバージョン）' }
}

/** 内置语言列表 */
export interface CustomLang {
  code: string
  label: string
  usesSpaces: boolean
  dict: Record<string, string>
}

const CUSTOM_KEY = 'darkcube-custom-langs'

function isValidCustomLang(x: unknown): x is CustomLang {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  return (
    typeof o.code === 'string' &&
    /^[a-z]{2,3}(-[A-Z]{2})?$/.test(o.code) &&
    typeof o.label === 'string' &&
    typeof o.usesSpaces === 'boolean' &&
    typeof o.dict === 'object' &&
    o.dict !== null
  )
}

function loadCustomLangs(): CustomLang[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    if (!raw) return []
    const arr: unknown = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.filter(isValidCustomLang)
  } catch {
    return []
  }
}

function saveCustomLangs(): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customLangs))
  } catch {
    /* ignore */
  }
}

let customLangs: CustomLang[] = loadCustomLangs()

export function getCustomLangs(): CustomLang[] {
  return customLangs
}

/** 添加自定义语言（同 code 覆盖），成功返回 true */
export function addCustomLang(lang: CustomLang): boolean {
  if (!isValidCustomLang(lang)) return false
  customLangs = [...customLangs.filter((l) => l.code !== lang.code), lang]
  saveCustomLangs()
  return true
}

export function removeCustomLang(code: string): void {
  customLangs = customLangs.filter((l) => l.code !== code)
  saveCustomLangs()
}

/** 全部可用语言：内置 4 + 自定义 */
export function getAllLangs(): { id: string; label: string; custom: boolean }[] {
  return [
    ...LANGS.map((l) => ({ id: l.id, label: l.label, custom: false })),
    ...customLangs.map((l) => ({ id: l.code, label: l.label, custom: true }))
  ]
}

let currentLang: string = 'zh-CN'

function loadLang(): string {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved) {
      const known = LANGS.some((l) => l.id === saved) || customLangs.some((l) => l.code === saved)
      if (known) return saved
    }
  } catch {
    /* ignore */
  }
  return detectSystemLang()
}

/** 检测系统语言：zh-TW/HK/MO → 繁体，zh → 简体，ja → 日语，其余 → 英语 */
export function detectSystemLang(): Lang {
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const l of langs) {
      const lower = (l || '').toLowerCase()
      if (lower.startsWith('zh')) {
        if (lower.includes('tw') || lower.includes('hk') || lower.includes('mo')) return 'zh-TW'
        return 'zh-CN'
      }
      if (lower.startsWith('ja')) return 'ja'
      if (lower.startsWith('en')) return 'en'
    }
  } catch {
    /* ignore */
  }
  return 'en'
}

export function getLang(): string {
  return currentLang
}

export function setLang(lang: string): void {
  currentLang = lang
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event('darkcube-lang-change'))
  } catch {
    /* ignore */
  }
}

/** React 钩子：语言变化时触发重渲染（供 App 层调用） */
export function useLang(): string {
  const [, setTick] = useState(0)
  useEffect(() => {
    const onChange = () => setTick((t) => t + 1)
    window.addEventListener('darkcube-lang-change', onChange)
    return () => window.removeEventListener('darkcube-lang-change', onChange)
  }, [])
  return currentLang
}

/** 翻译：t('nav.calendar') 或 t('editor.words', { n: 12 })；自定义语言优先 */
export function t(key: string, vars?: Record<string, string | number>): string {
  let text = ''
  const custom = customLangs.find((l) => l.code === currentLang)
  if (custom && custom.dict[key] != null) {
    text = custom.dict[key]
  } else {
    const entry = dict[key]
    text = entry ? entry[currentLang as Lang] ?? entry['en'] : key
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v))
    }
  }
  return text
}

/** 该语言书面语是否使用空格分词（英语 true，中日文 false，自定义语言按配置） */
export function langUsesSpaces(lang: string): boolean {
  const custom = customLangs.find((l) => l.code === lang)
  if (custom) return custom.usesSpaces
  return lang === 'en'
}

/** 日期：2025-01-15 → 语言化 */
export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  switch (currentLang) {
    case 'en':
      return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    case 'ja':
      return `${y}年${m}月${d}日`
    case 'zh-TW':
      return `${y} 年 ${m} 月 ${d} 日`
    default:
      return `${y} 年 ${m} 月 ${d} 日`
  }
}

/** 月历标题 */
export function formatMonth(year: number, month: number): string {
  switch (currentLang) {
    case 'en':
      return new Date(year, month - 1, 1).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    case 'ja':
      return `${year}年${month}月`
    case 'zh-TW':
      return `${year} 年 ${month} 月`
    default:
      return `${year} 年 ${month} 月`
  }
}

/** 星期：2025-01-15 → 周X / weekday */
export function formatWeekday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const w = new Date(y, m - 1, d).getDay()
  switch (currentLang) {
    case 'en':
      return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][w]
    case 'ja':
      return ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'][w]
    case 'zh-TW':
      return `週${'日一二三四五六'[w]}`
    default:
      return `周${'日一二三四五六'[w]}`
  }
}

// 模块初始化：读取持久化语言（首次进入会执行系统语言检测）
currentLang = loadLang()
