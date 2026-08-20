import { useEffect, useRef, useState } from 'react'
import type { GitHubSettings, SyncState } from '../../core/types'
import { todayStr } from '../../core/date'
import { db } from '../../core/db'
import { GITHUB_URL, RELEASES_URL, checkLatestRelease, isNewer, type ReleaseInfo } from '../../core/update'
import { addCustomLang, getAllLangs, getLang, removeCustomLang, setLang, t, type CustomLang } from '../../core/i18n'
import { version } from '../../../package.json'
import { ChangelogDialog } from '../components/ChangelogDialog'

interface SettingsViewProps {
  settings: GitHubSettings | null
  loggedIn: boolean
  onOpenLogin: () => void
  onLogout: () => void
  syncState: SyncState | undefined
  syncing: boolean
  lastSyncMsg: string
  onPush: () => void
  onPull: () => void
  onToggleAutoSync: () => void
  canInstall: boolean
  onInstall: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  /** 彩蛋皮肤开关（特定日期触发主题配色） */
  easterEgg: boolean
  onToggleEasterEgg: () => void
  /** 导入等数据变更后通知上层刷新条目 */
  onEntriesChanged: () => void
  /** 打开免责声明（由 App 统一管理，用于首次使用弹窗） */
  onShowDisclaimer: () => void
}

function formatSyncTime(ts?: number): string {
  if (!ts) return t('settings.notSynced')
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  return t('settings.lastSync', { t: local })
}

async function handleExport() {
  const [entries, conflicts] = await Promise.all([db.entries.toArray(), db.conflicts.toArray()])
  const data = {
    app: 'darkcube-diary',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
    conflicts
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `darkcube-backup-${todayStr()}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function handleClear() {
  const ok = window.confirm(t('settings.clearConfirm'))
  if (!ok) return
  await db.delete()
  window.location.reload()
}

export function SettingsView({
  settings,
  loggedIn,
  onOpenLogin,
  onLogout,
  syncState,
  syncing,
  lastSyncMsg,
  onPush,
  onPull,
  onToggleAutoSync,
  canInstall,
  onInstall,
  theme,
  onToggleTheme,
  easterEgg,
  onToggleEasterEgg,
  onEntriesChanged,
  onShowDisclaimer
}: SettingsViewProps) {
  const [release, setRelease] = useState<ReleaseInfo | null>(null)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [langOpen, setLangOpen] = useState(false)
  const [langMsg, setLangMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const langFileInputRef = useRef<HTMLInputElement | null>(null)

  /** 导入第三方语言文件 */
  async function handleImportLang(file: File) {
    setLangMsg('')
    try {
      const text = await file.text()
      const data = JSON.parse(text) as {
        code?: unknown
        label?: unknown
        usesSpaces?: unknown
        dict?: unknown
      }
      if (
        typeof data?.code !== 'string' ||
        typeof data.label !== 'string' ||
        typeof data.dict !== 'object' ||
        data.dict === null
      ) {
        setLangMsg(t('settings.langImportBad'))
        return
      }
      const custom: CustomLang = {
        code: data.code,
        label: data.label,
        usesSpaces: Boolean(data.usesSpaces),
        dict: data.dict as Record<string, string>
      }
      if (!addCustomLang(custom)) {
        setLangMsg(t('settings.langImportBad'))
        return
      }
      setLang(custom.code)
      setLangMsg(t('settings.langImportDone', { label: custom.label }))
    } catch {
      setLangMsg(t('settings.langImportFail'))
    }
  }

  // 进入设置页时检查一次最新版本
  useEffect(() => {
    let alive = true
    void checkLatestRelease().then((r) => {
      if (alive && r) setRelease(r)
    })
    return () => {
      alive = false
    }
  }, [])

  /** 导入备份 JSON：合并日记与冲突记录（覆盖同名日期），标记待同步 */
  async function handleImport(file: File) {
    setImportMsg('')
    try {
      const text = await file.text()
      const data = JSON.parse(text) as { entries?: unknown[]; conflicts?: unknown[] }
      if (!Array.isArray(data?.entries)) {
        setImportMsg(t('settings.importBad'))
        return
      }
      let n = 0
      for (const raw of data.entries) {
        const e = raw as { date?: unknown; title?: unknown; body?: unknown; updatedAt?: unknown; weather?: unknown; mood?: unknown }
        if (typeof e?.date !== 'string') continue
        await db.entries.put({
          date: e.date,
          title: typeof e.title === 'string' ? e.title : '',
          body: typeof e.body === 'string' ? e.body : '',
          updatedAt: typeof e.updatedAt === 'number' ? e.updatedAt : Date.now(),
          weather: typeof e.weather === 'string' ? e.weather : undefined,
          mood: typeof e.mood === 'string' ? e.mood : undefined,
          blobSha: undefined,
          dirty: true
        })
        n++
      }
      if (Array.isArray(data.conflicts)) {
        for (const raw of data.conflicts) {
          const c = raw as { date?: unknown; title?: unknown; body?: unknown; updatedAt?: unknown; synced?: unknown }
          if (typeof c?.date !== 'string') continue
          await db.conflicts.put({
            date: c.date,
            title: typeof c.title === 'string' ? c.title : '',
            body: typeof c.body === 'string' ? c.body : '',
            updatedAt: typeof c.updatedAt === 'number' ? c.updatedAt : Date.now(),
            synced: Boolean(c.synced)
          })
        }
      }
      setImportMsg(t('settings.importDone', { n }))
      onEntriesChanged()
    } catch {
      setImportMsg(t('settings.importFail'))
    }
  }

  const currentLang = getLang()
  const currentLangLabel = getAllLangs().find((l) => l.id === currentLang)?.label ?? currentLang

  return (
    <div className="view">
      <div className="settings-wrap">
        {/* ---- GitHub 云存档 ---- */}
        <section className="glass-panel section">
          <div className="section__title">{t('settings.githubSection')}</div>

          {loggedIn && settings ? (
            <div className="account-card glass-panel--flat">
              {settings.userAvatar ? (
                <img
                  className="account-card__avatar"
                  src={settings.userAvatar}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="account-card__avatar"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}
                >
                  墨
                </div>
              )}
              <div className="account-card__meta">
                <div className="account-card__name">{settings.userLogin}</div>
                <div className="account-card__repo">
                  {settings.owner}/{settings.repo}
                </div>
              </div>
              <div className="account-card__actions">
                <button className="btn btn--sm" onClick={onOpenLogin}>
                  {t('settings.reLogin')}
                </button>
                <button className="btn btn--sm btn--danger" onClick={onLogout}>
                  {t('settings.logout')}
                </button>
              </div>
            </div>
          ) : (
            <div className="note">
              {t('settings.loggedOut')}
              <div style={{ marginTop: 10 }}>
                <button className="btn btn--primary" onClick={onOpenLogin}>
                  {t('nav.login')}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ---- 同步 ---- */}
        <section className="glass-panel section">
          <div className="section__title">{t('settings.syncSection')}</div>

          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.autoSync')}</div>
              <div className="row__desc">{t('settings.autoSyncDesc')}</div>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={Boolean(settings?.autoSync)}
              onClick={onToggleAutoSync}
              disabled={!loggedIn}
              aria-label={t('settings.autoSync')}
            />
          </div>

          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.manualSync')}</div>
              <div className="row__desc">{formatSyncTime(syncState?.lastSyncAt)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn--sm"
                onClick={onPull}
                disabled={!loggedIn || syncing}
                title={t('settings.pull')}
              >
                {syncing ? t('settings.busy') : t('settings.pull')}
              </button>
              <button
                className="btn btn--sm btn--primary"
                onClick={onPush}
                disabled={!loggedIn || syncing}
                title={t('settings.push')}
              >
                {syncing ? t('settings.busy') : t('settings.push')}
              </button>
            </div>
          </div>

          {lastSyncMsg && <div className="note">{lastSyncMsg}</div>}
        </section>

        {/* ---- 数据 ---- */}
        <section className="glass-panel section">
          <div className="section__title">{t('settings.dataSection')}</div>
          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.export')}</div>
              <div className="row__desc">{t('settings.exportDesc')}</div>
            </div>
            <button className="btn btn--sm" onClick={() => void handleExport()}>
              {t('settings.exportBtn')}
            </button>
          </div>
          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.import')}</div>
              <div className="row__desc">{t('settings.importDesc')}</div>
            </div>
            <button className="btn btn--sm" onClick={() => fileInputRef.current?.click()}>
              {t('settings.importBtn')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleImport(f)
                e.target.value = ''
              }}
            />
          </div>
          {importMsg && <div className="note">{importMsg}</div>}
          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.clear')}</div>
              <div className="row__desc">{t('settings.clearDesc')}</div>
            </div>
            <button className="btn btn--sm btn--danger" onClick={() => void handleClear()}>
              {t('settings.clearBtn')}
            </button>
          </div>
        </section>

        {/* ---- 语言 ---- */}
        <section className="glass-panel section">
          <div className="section__title">{t('settings.langSection')}</div>

          <div className="row">
            <div className="row__main">
              <div className="row__title">{currentLangLabel}</div>
              <div className="row__desc">{t('settings.langImportDesc')}</div>
            </div>
            <button
              className="btn btn--sm"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
            >
              {langOpen ? t('settings.langCollapse') : t('settings.langExpand')}
            </button>
          </div>

          {langOpen && (
            <div className="collapse-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {getAllLangs().map((l) => (
                  <div key={l.id} className="row" style={{ gap: 8 }}>
                    <button
                      className={`btn btn--sm${currentLang === l.id ? ' btn--primary' : ''}`}
                      onClick={() => setLang(l.id)}
                      style={{ flex: 1, justifyContent: 'flex-start' }}
                    >
                      {l.label}
                      {currentLang === l.id ? ' ✓' : ''}
                    </button>
                    {l.custom && (
                      <button
                        className="btn btn--sm btn--danger"
                        title={t('settings.langRemove')}
                        aria-label={t('settings.langRemove')}
                        onClick={() => {
                          removeCustomLang(l.id)
                          if (currentLang === l.id) setLang('zh-CN')
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="row">
                <div className="row__main">
                  <div className="row__title">{t('settings.langImport')}</div>
                  <div className="row__desc">{t('settings.langImportDesc')}</div>
                </div>
                <button className="btn btn--sm" onClick={() => langFileInputRef.current?.click()}>
                  {t('settings.langImport')}
                </button>
                <input
                  ref={langFileInputRef}
                  type="file"
                  accept="application/json,.json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleImportLang(f)
                    e.target.value = ''
                  }}
                />
              </div>

              {langMsg && <div className="note">{langMsg}</div>}
            </div>
          )}
        </section>

        {/* ---- 关于 ---- */}
        <section className="glass-panel section">
          <div className="section__title">{t('settings.aboutSection')}</div>

          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.darkMode')}</div>
              <div className="row__desc">{t('settings.darkModeDesc')}</div>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={onToggleTheme}
              aria-label={t('settings.darkMode')}
            />
          </div>

          {/* 彩蛋皮肤开关：在特定日期能触发主题配色 */}
          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.easterEgg')}</div>
              <div className="row__desc">{t('settings.easterEggDesc')}</div>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={easterEgg}
              onClick={onToggleEasterEgg}
              aria-label={t('settings.easterEgg')}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="brand__logo" style={{ width: 34, height: 34 }}>
              墨
            </span>
            <div>
              <a
                className="row__title link-about-title"
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                title={GITHUB_URL}
              >
                {getLang() === 'en' ? 'DarkCube' : '墨辰DarkCube'} v{version} ↗
              </a>
              <div className="row__desc">{t('settings.aboutDesc')}</div>
            </div>
          </div>
          <div className="row">
            <div className="row__main">
              <div className="row__title">{t('settings.checkUpdate')}</div>
              <div className="row__desc">
                {release
                  ? isNewer(release.tag_name, version)
                    ? t('settings.newVersion', { v: release.tag_name })
                    : t('settings.latest', { v: release.tag_name })
                  : t('settings.latestRelease')}
              </div>
            </div>
            <a className="btn btn--sm" href={RELEASES_URL} target="_blank" rel="noreferrer">
              {t('settings.releasesBtn')}
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <button className="btn btn--sm" onClick={() => setChangelogOpen(true)}>
              {t('settings.changelog')}
            </button>
            <a
              className="link"
              href="https://space.bilibili.com/518517303"
              target="_blank"
              rel="noreferrer"
            >
              {t('settings.author')}
            </a>
            <button className="btn btn--sm" onClick={onShowDisclaimer}>
              {t('settings.disclaimer')}
            </button>
          </div>
          {canInstall && (
            <button className="btn btn--primary btn--block" onClick={onInstall}>
              {t('settings.install')}
            </button>
          )}
        </section>

        {/* 设置区最底部的座右铭 */}
        <div className="about-motto">{t('about.motto')}</div>
      </div>

      <ChangelogDialog open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </div>
  )
}
