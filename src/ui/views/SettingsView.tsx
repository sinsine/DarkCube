import { useEffect, useRef, useState } from 'react'
import type { GitHubSettings, SyncState } from '../../core/types'
import { todayStr } from '../../core/date'
import { db } from '../../core/db'
import { RELEASES_URL, checkLatestRelease, isNewer, type ReleaseInfo } from '../../core/update'
import { version } from '../../../package.json'
import { DisclaimerDialog } from '../components/DisclaimerDialog'

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
  /** 导入等数据变更后通知上层刷新条目 */
  onEntriesChanged: () => void
}

function formatSyncTime(ts?: number): string {
  if (!ts) return '尚未同步'
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `最近同步：${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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
  const ok = window.confirm(
    '确定清空本机所有日记与配置？此操作不可恢复（已同步到 GitHub 的内容仍保留在仓库中）。'
  )
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
  onEntriesChanged
}: SettingsViewProps) {
  const [release, setRelease] = useState<ReleaseInfo | null>(null)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
        setImportMsg('文件格式不正确：缺少 entries 数组（请使用本应用导出的备份）')
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
      setImportMsg(`导入完成：${n} 篇日记（覆盖同名日期）`)
      onEntriesChanged()
    } catch {
      setImportMsg('导入失败：文件不是有效的 JSON 备份')
    }
  }

  return (
    <div className="view">
      <div className="settings-wrap">
        {/* ---- GitHub 云存档 ---- */}
        <section className="glass-panel section">
          <div className="section__title">GitHub 云存档</div>

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
                  重新登录
                </button>
                <button className="btn btn--sm btn--danger" onClick={onLogout}>
                  退出登录
                </button>
              </div>
            </div>
          ) : (
            <div className="note">
              尚未登录 GitHub。登录后即可将日记同步到你的私有仓库作为云存档。
              <div style={{ marginTop: 10 }}>
                <button className="btn btn--primary" onClick={onOpenLogin}>
                  登录 GitHub
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ---- 同步 ---- */}
        <section className="glass-panel section">
          <div className="section__title">同步</div>

          <div className="row">
            <div className="row__main">
              <div className="row__title">自动同步</div>
              <div className="row__desc">打开应用或恢复联网时自动拉取与推送</div>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={Boolean(settings?.autoSync)}
              onClick={onToggleAutoSync}
              disabled={!loggedIn}
              aria-label="自动同步"
            />
          </div>

          <div className="row">
            <div className="row__main">
              <div className="row__title">手动同步</div>
              <div className="row__desc">{formatSyncTime(syncState?.lastSyncAt)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn--sm"
                onClick={onPull}
                disabled={!loggedIn || syncing}
                title="从云端下载到本地"
              >
                {syncing ? '进行中…' : '↓ 下载'}
              </button>
              <button
                className="btn btn--sm btn--primary"
                onClick={onPush}
                disabled={!loggedIn || syncing}
                title="从本地上传到云端"
              >
                {syncing ? '进行中…' : '↑ 上传'}
              </button>
            </div>
          </div>

          {lastSyncMsg && <div className="note">{lastSyncMsg}</div>}
        </section>

        {/* ---- 数据 ---- */}
        <section className="glass-panel section">
          <div className="section__title">数据</div>
          <div className="row">
            <div className="row__main">
              <div className="row__title">导出备份</div>
              <div className="row__desc">将全部日记与冲突备份导出为 JSON 文件</div>
            </div>
            <button className="btn btn--sm" onClick={() => void handleExport()}>
              导出
            </button>
          </div>
          <div className="row">
            <div className="row__main">
              <div className="row__title">导入备份</div>
              <div className="row__desc">从 JSON 备份恢复日记（覆盖同名日期，下次同步自动上传）</div>
            </div>
            <button className="btn btn--sm" onClick={() => fileInputRef.current?.click()}>
              导入
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
              <div className="row__title">清空本地数据</div>
              <div className="row__desc">删除本机所有日记与配置（已同步内容仍在仓库中）</div>
            </div>
            <button className="btn btn--sm btn--danger" onClick={() => void handleClear()}>
              清空
            </button>
          </div>
        </section>

        {/* ---- 关于 ---- */}
        <section className="glass-panel section">
          <div className="section__title">外观与关于</div>

          <div className="row">
            <div className="row__main">
              <div className="row__title">日间模式</div>
              <div className="row__desc">黑白反转的亮色界面</div>
            </div>
            <button
              className="switch"
              role="switch"
              aria-checked={theme === 'light'}
              onClick={onToggleTheme}
              aria-label="日间模式"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="brand__logo" style={{ width: 34, height: 34 }}>
              墨
            </span>
            <div>
              <div className="row__title">墨辰DarkCube v{version}</div>
              <div className="row__desc">本地优先 · GitHub 私有仓库云存档 · 黑白液态玻璃</div>
            </div>
          </div>
          <div className="row">
            <div className="row__main">
              <div className="row__title">检查更新</div>
              <div className="row__desc">
                {release
                  ? isNewer(release.tag_name, version)
                    ? `发现新版本 ${release.tag_name}，点击右侧前往下载`
                    : `已是最新版本（${release.tag_name}）`
                  : '前往 GitHub Releases 查看最新版本'}
              </div>
            </div>
            <a className="btn btn--sm" href={RELEASES_URL} target="_blank" rel="noreferrer">
              最新 Releases ↗
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <a
              className="link"
              href="https://space.bilibili.com/518517303"
              target="_blank"
              rel="noreferrer"
            >
              作者 B 站主页 ↗
            </a>
            <button className="btn btn--sm" onClick={() => setDisclaimerOpen(true)}>
              📄 免责声明
            </button>
          </div>
          {canInstall && (
            <button className="btn btn--primary btn--block" onClick={onInstall}>
              安装应用到桌面 / 主屏幕
            </button>
          )}
        </section>
      </div>

      <DisclaimerDialog open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
    </div>
  )
}
