import { useCallback, useEffect, useRef, useState } from 'react'
import { db, loadSettings, saveSettings } from './core/db'
import type { DiaryEntry, GitHubSettings, SyncState, ViewId } from './core/types'
import { todayStr } from './core/date'
import { pullOnly, pushOnly, syncNow, SyncStepError } from './core/sync/engine'
import { friendlyGitHubError } from './core/github/api'
import { checkLatestRelease, isNewer, RELEASES_URL, type ReleaseInfo } from './core/update'
import { isCnyPeriod } from './core/lunar'
import { t, useLang } from './core/i18n'
import { version } from '../package.json'
import { LiquidBackground } from './ui/components/LiquidBackground'
import { TopBar, BottomNav } from './ui/components/TopBar'
import { LoginDialog } from './ui/components/LoginDialog'
import { DisclaimerDialog } from './ui/components/DisclaimerDialog'
import { UpdateDialog } from './ui/components/UpdateDialog'
import { CalendarView } from './ui/views/CalendarView'
import { EditorView } from './ui/views/EditorView'
import { TimelineView } from './ui/views/TimelineView'
import { SettingsView } from './ui/views/SettingsView'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function App() {
  useLang() // 语言切换时全局重渲染
  const [view, setView] = useState<ViewId>('calendar')
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [settings, setSettings] = useState<GitHubSettings | null>(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [syncState, setSyncState] = useState<SyncState | undefined>()
  const [conflictCount, setConflictCount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncMsg, setLastSyncMsg] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [installEvt, setInstallEvt] = useState<BeforeInstallPromptEvent | null>(null)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    localStorage.getItem('darkcube-theme') === 'dark' ? 'dark' : 'light'
  )
  // 彩蛋皮肤开关（本地持久化）
  const [easterEgg, setEasterEgg] = useState(() => localStorage.getItem('darkcube-easter-egg') === '1')
  // 中国新年彩蛋皮肤是否激活：开关开启 且 系统日期处于农历除夕～正月初七
  const [cnyActive, setCnyActive] = useState(false)

  // 启动：检查更新（新版本优先于免责声明；首次启动且有更新时，免责声明在更新弹窗关闭后出现）
  const updatePendingDisclaimer = useRef(false)
  const [updateInfo, setUpdateInfo] = useState<ReleaseInfo | null>(null)
  const [updateOpen, setUpdateOpen] = useState(false)

  useEffect(() => {
    const DISCLAIMER_KEY = 'darkcube-disclaimer-seen'
    const DISMISS_KEY = 'darkcube-update-dismissed'
    const firstLaunch = !localStorage.getItem(DISCLAIMER_KEY)
    let alive = true
    void checkLatestRelease().then((r) => {
      if (!alive) return
      if (r && isNewer(r.tag_name, version)) {
        const dismissed = localStorage.getItem(DISMISS_KEY)
        if (dismissed === r.tag_name) {
          // 该版本已选择「不再提醒」
          if (firstLaunch) {
            localStorage.setItem(DISCLAIMER_KEY, '1')
            setDisclaimerOpen(true)
          }
          return
        }
        setUpdateInfo(r)
        setUpdateOpen(true)
        updatePendingDisclaimer.current = firstLaunch
        return
      }
      if (firstLaunch) {
        localStorage.setItem(DISCLAIMER_KEY, '1')
        setDisclaimerOpen(true)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  /** 更新弹窗关闭后的收尾：若首次启动，接着弹免责声明 */
  const closeUpdate = useCallback(() => {
    setUpdateOpen(false)
    if (updatePendingDisclaimer.current) {
      updatePendingDisclaimer.current = false
      localStorage.setItem('darkcube-disclaimer-seen', '1')
      setDisclaimerOpen(true)
    }
  }, [])

  const handleUpdateGo = useCallback(() => {
    window.open(RELEASES_URL, '_blank', 'noopener')
    closeUpdate()
  }, [closeUpdate])

  const handleUpdateDismiss = useCallback(() => {
    if (updateInfo) localStorage.setItem('darkcube-update-dismissed', updateInfo.tag_name)
    closeUpdate()
  }, [updateInfo, closeUpdate])

  const syncStateRef = useRef<SyncState | undefined>(undefined)
  syncStateRef.current = syncState

  useEffect(() => {
    void loadSettings().then((s) => setSettings(s ?? null))
    void db.entries.toArray().then(setEntries)
    void db.syncState.get(1).then(setSyncState)
    void db.conflicts.count().then(setConflictCount)
  }, [])

  const loggedIn = Boolean(settings?.token && settings?.userLogin)

  const refreshEntries = useCallback(() => {
    void db.entries.toArray().then(setEntries)
  }, [])

  const refreshSyncState = useCallback(() => {
    void db.syncState.get(1).then(setSyncState)
    void db.conflicts.count().then(setConflictCount)
  }, [])

  const doSync = useCallback(async () => {
    if (!settings?.token || !settings.userLogin) return
    setSyncing(true)
    setLastSyncMsg(t('settings.syncDoing'))
    try {
      // 从数据库读取最新状态（墓碑可能刚被删除操作写入，React 状态未同步）
      const latest = await db.syncState.get(1)
      const result = await syncNow(settings, latest)
      setLastSyncMsg(
        result.conflicts > 0
          ? t('settings.syncDoneConflict', { a: result.pulled, b: result.pushed, c: result.conflicts })
          : t('settings.syncDone', { a: result.pulled, b: result.pushed })
      )
    } catch (e) {
      setLastSyncMsg(
        e instanceof SyncStepError
          ? t('settings.syncFail', { step: t(e.step), msg: e.message })
          : t('settings.syncFailPlain', { msg: friendlyGitHubError(e) })
      )
    } finally {
      setSyncing(false)
      refreshSyncState()
      refreshEntries() // 拉取的新内容立即刷新到界面，无需重启
    }
  }, [settings, refreshSyncState, refreshEntries])

  /** 仅上传：本地 → 云端 */
  const doPush = useCallback(async () => {
    if (!settings?.token || !settings.userLogin) return
    setSyncing(true)
    setLastSyncMsg(t('settings.pushDoing'))
    try {
      const latest = await db.syncState.get(1)
      const r = await pushOnly(settings, latest)
      setLastSyncMsg(t('settings.pushDone', { n: r.pushed }))
    } catch (e) {
      setLastSyncMsg(
        e instanceof SyncStepError
          ? t('settings.pushFail', { step: t(e.step), msg: e.message })
          : t('settings.pushFailPlain', { msg: friendlyGitHubError(e) })
      )
    } finally {
      setSyncing(false)
      refreshSyncState()
      refreshEntries()
    }
  }, [settings, refreshSyncState, refreshEntries])

  /** 仅下载：云端 → 本地 */
  const doPull = useCallback(async () => {
    if (!settings?.token || !settings.userLogin) return
    setSyncing(true)
    setLastSyncMsg(t('settings.pullDoing'))
    try {
      const latest = await db.syncState.get(1)
      const r = await pullOnly(settings, latest)
      const conflictSuffix = r.conflicts ? t('settings.pullDoneConflict', { n: r.conflicts }) : ''
      setLastSyncMsg(t('settings.pullDone', { n: r.pulled }) + conflictSuffix)
    } catch (e) {
      setLastSyncMsg(
        e instanceof SyncStepError
          ? t('settings.pullFail', { step: t(e.step), msg: e.message })
          : t('settings.pullFailPlain', { msg: friendlyGitHubError(e) })
      )
    } finally {
      setSyncing(false)
      refreshSyncState()
      refreshEntries()
    }
  }, [settings, refreshSyncState, refreshEntries])

  /** 删除日记：本地删除 + 记墓碑 + 立即推送删除到云端 */
  const handleDeleteEntry = useCallback(
    async (date: string) => {
      const entry = await db.entries.get(date)
      if (!entry) return
      if (entry.blobSha) {
        const st = await db.syncState.get(1)
        const deleted = [...(st?.deleted ?? []).filter((d) => d !== date), date]
        await db.syncState.put({ ...(st ?? { id: 1 }), deleted })
      }
      await db.entries.delete(date)
      refreshEntries()
      void doPush()
    },
    [refreshEntries, doPush]
  )

  // 主题：日间 / 夜间
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('darkcube-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  // 彩蛋皮肤开关：持久化到本地
  useEffect(() => {
    localStorage.setItem('darkcube-easter-egg', easterEgg ? '1' : '0')
  }, [easterEgg])

  // 中国新年彩蛋皮肤：开关开启且日期处于农历除夕～正月初七时激活
  useEffect(() => {
    const apply = () => {
      const active = easterEgg && isCnyPeriod()
      setCnyActive(active)
      if (active) document.documentElement.dataset.cny = '1'
      else delete document.documentElement.dataset.cny
    }
    apply()
    // 跨天时自动刷新（每小时检查一次）
    const id = window.setInterval(apply, 60 * 60 * 1000)
    return () => {
      clearInterval(id)
      delete document.documentElement.dataset.cny
    }
  }, [easterEgg])

  // 网络状态
  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // PWA 安装提示
  useEffect(() => {
    const onBIP = (e: Event) => {
      e.preventDefault()
      setInstallEvt(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstallEvt(null)
    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!installEvt) return
    await installEvt.prompt()
    await installEvt.userChoice
    setInstallEvt(null)
  }, [installEvt])

  // 自动同步：打开应用时 + 恢复联网时（用 ref 防重入，避免 syncing 变化触发循环）
  const autoSyncBusy = useRef(false)
  useEffect(() => {
    const maybeAutoSync = () => {
      if (loggedIn && settings?.autoSync && !autoSyncBusy.current) {
        autoSyncBusy.current = true
        void doSync().finally(() => {
          autoSyncBusy.current = false
        })
      }
    }
    maybeAutoSync()
    window.addEventListener('online', maybeAutoSync)
    return () => window.removeEventListener('online', maybeAutoSync)
  }, [loggedIn, settings, doSync])

  const handleSaved = useCallback(async (s: GitHubSettings) => {
    await saveSettings(s)
    setSettings(s)
  }, [])

  const handleLogout = useCallback(async () => {
    if (!settings) return
    const next: GitHubSettings = {
      ...settings,
      token: undefined,
      userLogin: undefined,
      userAvatar: undefined,
      autoSync: false
    }
    await saveSettings(next)
    setSettings(next)
  }, [settings])

  const handleToggleAutoSync = useCallback(async () => {
    if (!settings) return
    const next: GitHubSettings = { ...settings, autoSync: !settings.autoSync }
    await saveSettings(next)
    setSettings(next)
  }, [settings])

  const [editorInitialMode, setEditorInitialMode] = useState<'edit' | 'preview'>('edit')

  const openEditor = useCallback((date: string, mode: 'edit' | 'preview' = 'edit') => {
    setSelectedDate(date)
    setEditorInitialMode(mode)
    setView('editor')
  }, [])

  const entry = entries.find((e) => e.date === selectedDate) ?? null

  return (
    <div className="app">
      <LiquidBackground />
      <div className="app-shell">
        {cnyActive && <div className="cny-banner">{t('skin.cny')}</div>}
        {!online && (
          <div className="offline-banner">离线中 · 日记已保存在本机，联网后自动同步</div>
        )}
        <TopBar
          view={view}
          onNavigate={setView}
          onWrite={() => openEditor(todayStr())}
          settings={settings}
          loggedIn={loggedIn}
          onOpenLogin={() => setLoginOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main className="app-main">
          {view === 'calendar' && (
            <CalendarView
              entries={entries}
              selectedDate={selectedDate}
              onPickDate={openEditor}
              onOpenPreview={(d) => openEditor(d, 'preview')}
            />
          )}
          {view === 'editor' && (
            <EditorView
              date={selectedDate}
              entry={entry}
              initialMode={editorInitialMode}
              onChangeDate={setSelectedDate}
              onEntrySaved={refreshEntries}
            />
          )}
          {view === 'timeline' && (
            <TimelineView
              entries={entries}
              conflictCount={conflictCount}
              onOpen={(d) => openEditor(d, 'preview')}
              onDelete={(d) => void handleDeleteEntry(d)}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              settings={settings}
              loggedIn={loggedIn}
              onOpenLogin={() => setLoginOpen(true)}
              onLogout={handleLogout}
              syncState={syncState}
              syncing={syncing}
              lastSyncMsg={lastSyncMsg}
              onPush={() => void doPush()}
              onPull={() => void doPull()}
              onToggleAutoSync={() => void handleToggleAutoSync()}
              canInstall={installEvt !== null}
              onInstall={() => void handleInstall()}
              theme={theme}
              onToggleTheme={toggleTheme}
              easterEgg={easterEgg}
              onToggleEasterEgg={() => setEasterEgg((v) => !v)}
              onEntriesChanged={refreshEntries}
              onShowDisclaimer={() => setDisclaimerOpen(true)}
            />
          )}
        </main>

        <BottomNav view={view} onNavigate={setView} onWrite={() => openEditor(todayStr())} />
      </div>

      <LoginDialog
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        initial={settings}
        onSaved={handleSaved}
      />
      <DisclaimerDialog open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
      <UpdateDialog
        open={updateOpen}
        version={updateInfo?.tag_name ?? ''}
        onGo={handleUpdateGo}
        onLater={closeUpdate}
        onDismiss={handleUpdateDismiss}
      />
    </div>
  )
}
