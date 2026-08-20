/** 历史版本更新日志（多语言） */

import type { Lang } from './i18n'

export interface ChangelogEntry {
  version: string
  tag: string
  date: string
  notes: Record<Lang, string[]>
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.2',
    tag: 'v1.3.2',
    date: '2026-08',
    notes: {
      'zh-CN': ['语言设置独立为单独栏目（数据与关于之间）并可折叠', '新增导入第三方翻译文件功能', '预览模式可导出 .md 文件', '修复更新日志未随版本更新', '移除编辑后立即自动同步'],
      'zh-TW': ['語言設定獨立為單獨欄目（資料與關於之間）並可摺疊', '新增匯入第三方翻譯檔案功能', '預覽模式可匯出 .md 檔案', '修復更新日誌未隨版本更新', '移除編輯後立即自動同步'],
      en: ['Language settings moved to a standalone collapsible section', 'Import third-party translation files', 'Export .md in preview mode', 'Fixed changelog not updated', 'Removed auto-sync right after editing'],
      ja: ['言語設定を独立した折りたたみ欄に（データと情報の間）', '第三者製翻訳ファイルの読み込みに対応', 'プレビューで .md を書き出し', '更新履歴が更新されない問題を修正', '編集直後の自動同期を削除']
    }
  },
  {
    version: '1.3.1',
    tag: 'v1.3.1',
    date: '2026-08',
    notes: {
      'zh-CN': ['四语言支持（简/繁/英/日）与系统语言检测', '时间线上下滑动不再误触删除', '编辑后自动同步', '日历保持离开时的月份', '首句判断语言感知', '日期跳转'],
      'zh-TW': ['四語言支援（簡/繁/英/日）與系統語言偵測', '時間線上下滑動不再誤觸刪除', '編輯後自動同步', '日曆保持離開時的月份', '首句判斷語言感知', '日期跳轉'],
      en: ['4-language support (SC/TC/EN/JA) with system detection', 'Vertical scroll no longer triggers delete', 'Auto-sync after editing', 'Calendar keeps its month', 'Language-aware first sentence', 'Jump to date'],
      ja: ['4言語対応（簡/繁/英/日）とシステム言語検出', '縦スクロールで削除が誤発動しないよう修正', '編集後の自動同期', 'カレンダーの月を保持', '最初の一文の言語対応', '日付へ移動']
    }
  },
  {
    version: '1.3.0',
    tag: 'v1.3.0',
    date: '2026-08',
    notes: {
      'zh-CN': ['天气/心情滑动限制在背景框内', '日历滑动停稳后不再重复渐显', '关于页跳转 GitHub 主页', '历史更新日志', '首次使用弹免责声明'],
      'zh-TW': ['天氣/心情滑動限制在背景框內', '日曆滑動停穩後不再重複漸顯', '關於頁跳轉 GitHub 主頁', '歷史更新日誌', '首次使用彈免責聲明'],
      en: ['Weather/mood swiping constrained to the panel', 'No repeated fade-in after calendar swipe', 'About page links to GitHub repo', 'Changelog dialog', 'Disclaimer on first launch'],
      ja: ['天気・気分のスワイプをパネル内に制限', 'カレンダー切替後のフェード再生を修正', '情報ページから GitHub へ', '更新履歴ダイアログ', '初回起動時に免責事項を表示']
    }
  },
  {
    version: '1.2.8',
    tag: 'v1.2.8',
    date: '2026-08',
    notes: {
      'zh-CN': ['修复本地删除后云端同步删除', '删除按钮默认隐藏、四周圆角', '天气/心情横向滑动选择'],
      'zh-TW': ['修復本地刪除後雲端同步刪除', '刪除按鈕預設隱藏、四周圓角', '天氣/心情橫向滑動選擇'],
      en: ['Cloud deletion after local delete fixed', 'Delete button hidden by default, rounded corners', 'Weather/mood horizontal swipe select'],
      ja: ['ローカル削除後のクラウド削除を修正', '削除ボタンをデフォルト非表示にし角丸化', '天気・気分を横スワイプで選択']
    }
  },
  {
    version: '1.2.7',
    tag: 'v1.2.7',
    date: '2026-08',
    notes: {
      'zh-CN': ['时间线左滑删除（本地+云端）', '滑动后取消渐显', '同步细分为上传/下载'],
      'zh-TW': ['時間線左滑刪除（本地+雲端）', '滑動後取消漸顯', '同步細分為上傳/下載'],
      en: ['Swipe-to-delete in timeline (local + cloud)', 'No fade-in after swipe', 'Sync split into push/pull'],
      ja: ['タイムラインでスワイプ削除（ローカル＋クラウド）', 'スワイプ後のフェードを停止', '同期を送信/取得に分割']
    }
  },
  {
    version: '1.2.6',
    tag: 'v1.2.6',
    date: '2026-08',
    notes: {
      'zh-CN': ['时间线进入预览模式', '标题取当日第一句话', '预览模式天气/心情只读', '竖屏折叠格式栏', '导入 JSON 备份'],
      'zh-TW': ['時間線進入預覽模式', '標題取當日第一句話', '預覽模式天氣/心情唯讀', '直式摺疊格式列', '匯入 JSON 備份'],
      en: ['Timeline opens in preview', 'Title uses first sentence', 'Weather/mood read-only in preview', 'Collapsible toolbar in portrait', 'Import JSON backup'],
      ja: ['タイムラインはプレビューで開く', 'タイトルは最初の一文', 'プレビューで天気・気分は表示のみ', '縦画面でツールバーを折りたたみ', 'JSON バックアップの読み込み']
    }
  },
  {
    version: '1.2.5',
    tag: 'v1.2.5',
    date: '2026-08',
    notes: {
      'zh-CN': ['同步后内容即时刷新', '竖屏隐藏滚动条、标题显示版本号', 'APK 稳定签名支持覆盖安装'],
      'zh-TW': ['同步後內容即時刷新', '直式隱藏捲軸、標題顯示版本號', 'APK 穩定簽名支援覆蓋安裝'],
      en: ['Content refreshes immediately after sync', 'Hidden scrollbar & version badge in portrait', 'Stable APK signing for in-place updates'],
      ja: ['同期後に内容を即時更新', '縦画面でスクロールバー非表示・版数表示', 'APK の安定署名で上書きインストール対応']
    }
  },
  {
    version: '1.2.4',
    tag: 'v1.2.4',
    date: '2026-08',
    notes: {
      'zh-CN': ['天气/心情随正文同步', '日历左右滑动翻页动画', '竖屏底部导航加大、点击蓝框优化'],
      'zh-TW': ['天氣/心情隨正文同步', '日曆左右滑動翻頁動畫', '直式底部導覽加大、點擊藍框最佳化'],
      en: ['Weather/mood sync with entries', 'Calendar swipe animation', 'Bigger bottom nav & no blue tap highlight in portrait'],
      ja: ['天気・気分も日記と同期', 'カレンダーのスワイプアニメーション', '縦画面で下部ナビ拡大・タップ青枠を修正']
    }
  },
  {
    version: '1.2.3',
    tag: 'v1.2.3',
    date: '2026-08',
    notes: {
      'zh-CN': ['竖屏全面适配', '新增免责声明'],
      'zh-TW': ['直式全面適配', '新增免責聲明'],
      en: ['Full portrait-mode adaptation', 'Disclaimer added'],
      ja: ['縦画面の全面対応', '免責事項を追加']
    }
  },
  {
    version: '1.2.2',
    tag: 'v1.2.2',
    date: '2026-08',
    notes: {
      'zh-CN': ['修复时间线圆点重叠', 'Android APK 版发布'],
      'zh-TW': ['修復時間線圓點重疊', 'Android APK 版發布'],
      en: ['Timeline dot overlap fixed', 'Android APK released'],
      ja: ['タイムラインのドット重なりを修正', 'Android APK 版を公開']
    }
  },
  {
    version: '1.2.1',
    tag: 'v1.2.1',
    date: '2026-08',
    notes: {
      'zh-CN': ['标题更名墨辰DarkCube', '动画优化', '日历跨年移动', '时间线按年分组', '检查更新'],
      'zh-TW': ['標題更名墨辰DarkCube', '動畫最佳化', '日曆跨年移動', '時間線按年分組', '檢查更新'],
      en: ['Renamed to 墨辰DarkCube', 'Animation polish', 'Calendar year navigation', 'Timeline grouped by year', 'Update check'],
      ja: ['墨辰DarkCube に改名', 'アニメーション最適化', 'カレンダーの年移動', 'タイムラインを年別にグループ化', '更新チェック']
    }
  },
  {
    version: '1.2.0',
    tag: 'v1.2.0',
    date: '2026-08',
    notes: {
      'zh-CN': ['作者 B 站主页链接', '小白登录教程', '默认日间模式', '天气/心情记录'],
      'zh-TW': ['作者 B 站主頁連結', '新手登入教學', '預設日間模式', '天氣/心情記錄'],
      en: ['Author page link', 'Beginner login tutorial', 'Light mode by default', 'Weather/mood recording'],
      ja: ['作者のB站リンク', '初心者向けログインガイド', 'ライトモードを既定に', '天気・気分の記録']
    }
  },
  {
    version: '1.1.6',
    tag: 'v1.1.6',
    date: '2026-08',
    notes: {
      'zh-CN': ['修复同步核心问题（分支引用解析）', '拉取/推送真正生效'],
      'zh-TW': ['修復同步核心問題（分支參照解析）', '拉取/推送真正生效'],
      en: ['Fixed core sync bug (branch ref parsing)', 'Pull/push actually work'],
      ja: ['同期の核心バグ（ブランチ参照解析）を修正', '取得・送信が実際に動作']
    }
  },
  {
    version: '1.1.0',
    tag: 'v1.1.0',
    date: '2026-08',
    notes: {
      'zh-CN': ['图形化 Markdown 工具栏', '自动创建仓库', '日间模式'],
      'zh-TW': ['圖形化 Markdown 工具列', '自動建立倉庫', '日間模式'],
      en: ['Markdown toolbar', 'Auto-create repository', 'Light mode'],
      ja: ['Markdown ツールバー', 'リポジトリの自動作成', 'ライトモード']
    }
  },
  {
    version: '1.0.0',
    tag: 'v1.0.0',
    date: '2026-08',
    notes: {
      'zh-CN': ['首版：黑白液态玻璃日记应用', 'GitHub 私有仓库云存档', '电脑/安卓双端互通'],
      'zh-TW': ['首版：黑白液態玻璃日記應用程式', 'GitHub 私有倉庫雲端存檔', '電腦/安卓雙端互通'],
      en: ['First release: monochrome glass diary app', 'GitHub private repo backup', 'PC & Android cross-device sync'],
      ja: ['初版：白黒ガラス調の日記アプリ', 'GitHub プライベートリポジトリ保存', 'PC・Android 間で同期']
    }
  }
]
