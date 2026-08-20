import { useState } from 'react'
import type { GitHubSettings, SyncState } from '../../core/types'
import { todayStr } from '../../core/date'
import { db } from '../../core/db'

interface SettingsViewProps {
  settings: GitHubSettings | null
  loggedIn: boolean
  onOpenLogin: () => void
  onLogout: () => void
  syncState: SyncState | undefined
  syncing: boolean
  lastSyncMsg: string
  onSync: () => void
  onToggleAutoSync: () => void
  canInstall: boolean
  onInstall: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onSaveSettings: (patch: Partial<GitHubSettings>) => void
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
  onSync,
  onToggleAutoSync,
  canInstall,
  onInstall,
  theme,
  onToggleTheme,
  onSaveSettings
}: SettingsViewProps) {
  const [clientId, setClientId] = useState(settings?.clientId ?? '')
  const [clientSecret, setClientSecret] = useState(settings?.clientSecret ?? '')
  const [relayUrl, setRelayUrl] = useState(settings?.relayUrl ?? '')

  function saveOAuth() {
    onSaveSettings({
      clientId: clientId.trim() || undefined,
      clientSecret: clientSecret.trim() || undefined,
      relayUrl: relayUrl.trim() || undefined
    })
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

        {/* ---- 网页登录（OAuth） ---- */}
        <section className="glass-panel section">
          <div className="section__title">网页登录（OAuth）</div>
          <div className="row__desc">
            用于「登录 GitHub → 网页登录」免输 Token：创建 OAuth App 并部署自建中转后，填写以下配置。
          </div>

          <div className="field">
            <label className="field__label" htmlFor="st-cid">
              OAuth App Client ID
            </label>
            <input
              id="st-cid"
              className="input"
              placeholder="Iv1.xxxxxxxx"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="st-secret">
              Client Secret（可选）
            </label>
            <input
              id="st-secret"
              className="input"
              type="password"
              placeholder="仅在 GitHub 要求时填写"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="st-relay">
              中转地址（Cloudflare Worker）
            </label>
            <input
              id="st-relay"
              className="input"
              placeholder="https://xxx.workers.dev"
              value={relayUrl}
              onChange={(e) => setRelayUrl(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <a
              className="link"
              href="https://github.com/settings/applications/new"
              target="_blank"
              rel="noreferrer"
            >
              创建 OAuth App（勾选 Device flow）↗
            </a>
            <a className="link" href="https://dash.cloudflare.com" target="_blank" rel="noreferrer">
              部署中转 Worker（复制仓库 server/device-flow-worker.js）↗
            </a>
          </div>

          <button className="btn btn--sm" onClick={saveOAuth} style={{ alignSelf: 'flex-start' }}>
            保存 OAuth 配置
          </button>
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
              <div className="row__title">立即同步</div>
              <div className="row__desc">{formatSyncTime(syncState?.lastSyncAt)}</div>
            </div>
            <button className="btn btn--sm" onClick={onSync} disabled={!loggedIn || syncing}>
              {syncing ? '同步中…' : '立即同步'}
            </button>
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
              <div className="row__title">墨辰日记 v1.1.0</div>
              <div className="row__desc">本地优先 · GitHub 私有仓库云存档 · 黑白液态玻璃</div>
            </div>
          </div>
          {canInstall && (
            <button className="btn btn--primary btn--block" onClick={onInstall}>
              安装应用到桌面 / 主屏幕
            </button>
          )}
        </section>
      </div>
    </div>
  )
}
