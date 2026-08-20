import { useCallback, useEffect, useRef, useState } from 'react'
import { db, loadSettings, saveSettings } from './core/db'
import type { DiaryEntry, GitHubSettings, SyncState, ViewId } from './core/types'
import { todayStr } from './core/date'
import { syncNow, SyncStepError } from './core/sync/engine'
import { friendlyGitHubError } from './core/github/api'
import { LiquidBackground } from './ui/components/LiquidBackground'
import { TopBar, BottomNav } from './ui/components/TopBar'
import { LoginDialog } from './ui/components/LoginDialog'
import { CalendarView } from './ui/views/CalendarView'
import { EditorView } from './ui/views/EditorView'
import { TimelineView } from './ui/views/TimelineView'
import { SettingsView } from './ui/views/SettingsView'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function App() {
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
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    localStorage.getItem('darkcube-theme') === 'dark' ? 'dark' : 'light'
  )

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
    setLastSyncMsg('同步中…')
    try {
      const result = await syncNow(settings, syncStateRef.current)
      setLastSyncMsg(
        result.conflicts > 0
          ? `完成：拉取 ${result.pulled} · 推送 ${result.pushed} · 冲突 ${result.conflicts}（旧内容已备份为 .conflict.md）`
          : `完成：拉取 ${result.pulled} · 推送 ${result.pushed}`
      )
    } catch (e) {
      setLastSyncMsg(
        e instanceof SyncStepError
          ? `同步失败（${e.step}）：${e.message}`
          : `同步失败：${friendlyGitHubError(e)}`
      )
    } finally {
      setSyncing(false)
      refreshSyncState()
      refreshEntries() // 拉取的新内容立即刷新到界面，无需重启
    }
  }, [settings, refreshSyncState, refreshEntries])

  // 主题：日间 / 夜间
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('darkcube-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

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

  const openEditor = useCallback((date: string) => {
    setSelectedDate(date)
    setView('editor')
  }, [])

  const entry = entries.find((e) => e.date === selectedDate) ?? null

  return (
    <div className="app">
      <LiquidBackground />
      <div className="app-shell">
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
            <CalendarView entries={entries} selectedDate={selectedDate} onPickDate={openEditor} />
          )}
          {view === 'editor' && (
            <EditorView
              date={selectedDate}
              entry={entry}
              onChangeDate={setSelectedDate}
              onEntrySaved={refreshEntries}
            />
          )}
          {view === 'timeline' && (
            <TimelineView entries={entries} conflictCount={conflictCount} onOpen={openEditor} />
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
              onSync={() => void doSync()}
              onToggleAutoSync={() => void handleToggleAutoSync()}
              canInstall={installEvt !== null}
              onInstall={() => void handleInstall()}
              theme={theme}
              onToggleTheme={toggleTheme}
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
    </div>
  )
}
