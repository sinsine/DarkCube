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
    version: '1.3.7',
    tag: 'v1.3.7',
    date: '2026-08',
    notes: {
      'zh-CN': ['移除中国新年彩蛋皮肤顶部的小字', '设置「外观与关于」拆分为「外观」（上方）与「关于」（下方）两个栏目', '英文/日文副标题与座右铭文案优化'],
      'zh-TW': ['移除中國新年彩蛋皮膚頂部的小字', '設定「外觀與關於」拆分為「外觀」（上方）與「關於」（下方）兩個欄目', '英文/日文副標題與座右銘文案最佳化'],
      en: ['Removed the small Chinese New Year skin badge at the top', 'Split "Appearance & About" into two sections: "Appearance" (top) and "About" (below)', 'Refined English/Japanese subtitle and motto wording'],
      ja: ['中国旧正月スキンの上部バッジ表示を削除', '「外観と情報」を「外観」（上）と「情報」（下）の2つの欄に分割', '英語・日本語のサブタイトルとモットーの文言を改善']
    }
  },
  {
    version: '1.3.6',
    tag: 'v1.3.6',
    date: '2026-08',
    notes: {
      'zh-CN': ['修复切换语言后所选语言按钮颜色发虚的问题（悬停/触屏残留时不再变浅）', '外观与关于：日间模式改为「夜间模式」，开关反转（夜间模式开启时开关变白）', '关于页副标题改为「求求给个star吧——」'],
      'zh-TW': ['修復切換語言後所選語言按鈕顏色發虛的問題（懸停/觸屏殘留時不再變淺）', '外觀與關於：日間模式改為「夜間模式」，開關反轉（夜間模式開啟時開關變白）', '關於頁副標題改為「求求給個star吧——」'],
      en: ['Fixed selected language button looking faded after switching language (no longer washes out on hover/touch residue)', 'Appearance & About: "Light mode" changed to "Dark mode" with the switch inverted (turns white when dark mode is on)', 'About subtitle changed to "Pretty please give a star ——"'],
      ja: ['言語切替後、選択した言語ボタンの色が薄くなる問題を修正（ホバー/タッチ残像で薄くならない）', '外観と情報：「ライトモード」を「ダークモード」に変更し、スイッチを反転（ダークモードONで白くなる）', '情報ページのサブタイトルを「スターをください——」に変更']
    }
  },
  {
    version: '1.3.5',
    tag: 'v1.3.5',
    date: '2026-08',
    notes: {
      'zh-CN': [
        '应用图标白圈内新增黑色钢笔图案',
        '安卓应用名改为「墨辰」（英文系统显示 DarkCube）',
        '新增「彩蛋皮肤」开关：在特定日期触发主题配色',
        '中国新年彩蛋皮肤：农历除夕至正月初七切换红金传统配色，顶部显示彩蛋小字',
        '「那年今天」点击后以预览模式打开日记',
        '动效优化：日历/设置等按钮按压反馈、语言与格式栏折叠入场动画、日期跳转输入框入场动画、时间线删除退场动画'
      ],
      'zh-TW': [
        '應用程式圖示白圈內新增黑色鋼筆圖案',
        '安卓應用名稱改為「墨辰」（英文系統顯示 DarkCube）',
        '新增「彩蛋皮膚」開關：在特定日期觸發主題配色',
        '中國新年彩蛋皮膚：農曆除夕至正月初七切換紅金傳統配色，頂部顯示彩蛋小字',
        '「那年今天」點擊後以預覽模式開啟日記',
        '動效優化：日曆/設定等按鈕按壓回饋、語言與格式列摺疊入場動畫、日期跳轉輸入框入場動畫、時間線刪除退場動畫'
      ],
      en: [
        'Black pen glyph added inside the app icon\u2019s white circle',
        'Android app name changed to "墨辰" ("DarkCube" on English systems)',
        'New "Easter egg skin" toggle: triggers a special theme on certain dates',
        'Chinese New Year skin: switches to a red-and-gold palette from Lunar New Year\u2019s Eve to the 7th day, with a small badge at the top',
        '"On this day" now opens the entry in preview mode',
        'Motion polish: press feedback on calendar/settings controls, expand-in animations for language & toolbar collapse, date-jump field entry, and a timeline delete exit animation'
      ],
      ja: [
        'アプリアイコンの白い円に黒いペンの絵を追加',
        'Android アプリ名を「墨辰」に変更（英語環境では DarkCube）',
        '「イースターエッグスキン」スイッチを追加：特定の日付でテーマ配色が発動',
        '中国旧正月スキン：旧暦大晦日から1月7日まで紅・金の伝統配色に切り替え、上部にバッジ表示',
        '「この日の過去」をクリックするとプレビューモードで開く',
        'モーション改善：カレンダー・設定などの押下フィードバック、言語・ツールバーの展開アニメーション、日付ジャンプ欄の登場、タイムライン削除時の退場アニメーション'
      ]
    }
  },
  {
    version: '1.3.4',
    tag: 'v1.3.4',
    date: '2026-08',
    notes: {
      'zh-CN': ['竖屏浏览日记时隐藏「导出 .md」按钮', '横屏保留日夜主题过渡（竖屏不触发）', '新增 AGENTS.md 开发约定（新版本必须更新日志）', '补全 v1.3.3 更新日志', '英语模式下标题改为 DarkCube', '修复英语模式残留汉字（日历「今」、时间线「年」等）', '日语模式 B 站改为 Bilibili', '更新日志日期颜色与正文一致'],
      'zh-TW': ['直式瀏覽日記時隱藏「匯出 .md」按鈕', '橫式保留日夜主題過渡（直式不觸發）', '新增 AGENTS.md 開發約定（新版本必須更新日誌）', '補全 v1.3.3 更新日誌', '英語模式下標題改為 DarkCube', '修復英語模式殘留漢字（日曆「今」、時間線「年」等）', '日語模式 B 站改為 Bilibili', '更新日誌日期顏色與內文一致'],
      en: ['Hide "Export .md" button in portrait preview', 'Landscape-only theme transition (not in portrait)', 'Added AGENTS.md dev rules (changelog required for every release)', 'Backfilled v1.3.3 changelog', 'Brand shows "DarkCube" in English mode', 'Fixed remaining Chinese strings in English (calendar "T", year labels)', 'Bilibili in Japanese mode', 'Changelog date color matches body text'],
      ja: ['縦画面のプレビューで「.md 書き出し」ボタンを非表示', '横画面のみテーマ遷移（縦画面では発動しない）', 'AGENTS.md を追加（新バージョンは必ず更新履歴を更新）', 'v1.3.3 の更新履歴を補完', '英語モードではタイトルを DarkCube に', '英語モードの残存漢字（カレンダー「今」、年表示など）を修正', '日本語モードで B站 を Bilibili に', '更新履歴の日付色を本文と統一']
    }
  },
  {
    version: '1.3.3',
    tag: 'v1.3.3',
    date: '2026-08',
    notes: {
      'zh-CN': ['README 中英双语化', '修复安卓日夜主题切换闪烁', '鼠标左滑可完整拉出删除按钮', '日历新增「那年今天」版块', '启动检查更新弹窗（前往/稍后/不再提醒）', '语言选项每种独占一行'],
      'zh-TW': ['README 中英雙語化', '修復安卓日夜主題切換閃爍', '滑鼠左滑可完整拉出刪除按鈕', '日曆新增「那年今天」版塊', '啟動檢查更新彈窗（前往/稍後/不再提醒）', '語言選項每種獨佔一行'],
      en: ['Bilingual README', 'Fixed Android theme-switch flicker', 'Mouse drag fully reveals delete button', 'Added "On This Day" below the calendar', 'Startup update dialog (Go/Later/Dismiss)', 'One language per line'],
      ja: ['README を中英バイリンガル化', 'Android のテーマ切替のちらつきを修正', 'マウスドラッグで削除ボタンを完全表示', 'カレンダー下に「この日の過去」を追加', '起動時の更新ダイアログ（リリースへ/後で/再表示しない）', '言語オプションを1行1言語に']
    }
  },
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
