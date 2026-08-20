import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { GitHubSettings } from '../../core/types'
import { ensureRepo, friendlyGitHubError, getCurrentUser } from '../../core/github/api'
import {
  PendingError,
  pollAccessToken,
  requestDeviceCode,
  type DeviceCodeResponse
} from '../../core/github/oauth'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  /** 预填的既有配置 */
  initial: GitHubSettings | null
  /** 登录成功回调（由上层持久化） */
  onSaved: (s: GitHubSettings) => void
}

type Tab = 'token' | 'web'
type TokenStatus = 'idle' | 'busy' | 'error'
type WebPhase = 'config' | 'waiting' | 'error'

const DEFAULT_REPO = 'darkcube-diary'

/** 手动 Token / 网页辅助登录；登录成功后自动创建或复用私有仓库 */
export function LoginDialog({ open, onClose, initial, onSaved }: LoginDialogProps) {
  const [tab, setTab] = useState<Tab>('token')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [repoName, setRepoName] = useState(DEFAULT_REPO)
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('idle')
  const [tokenError, setTokenError] = useState('')

  // 网页登录（Device Flow）
  const [clientId, setClientId] = useState('')
  const [relayUrl, setRelayUrl] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [webPhase, setWebPhase] = useState<WebPhase>('config')
  const [webError, setWebError] = useState('')
  const [device, setDevice] = useState<DeviceCodeResponse | null>(null)
  const [remaining, setRemaining] = useState(0)

  const pollTimer = useRef<number | undefined>(undefined)
  const countTimer = useRef<number | undefined>(undefined)
  const deviceCodeRef = useRef('')
  const expiresAtRef = useRef(0)

  useEffect(() => {
    if (open) {
      setTab('token')
      setToken(initial?.token ?? '')
      setShowToken(false)
      setRepoName(initial?.repo ?? DEFAULT_REPO)
      setTokenStatus('idle')
      setTokenError('')
      setClientId(initial?.clientId ?? '')
      setRelayUrl(initial?.relayUrl ?? '')
      setClientSecret(initial?.clientSecret ?? '')
      setShowSecret(false)
      setWebPhase('config')
      setWebError('')
      setDevice(null)
      setRemaining(0)
      stopPolling()
    }
  }, [open, initial])

  useEffect(() => {
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!open) return null

  function stopPolling() {
    if (pollTimer.current !== undefined) {
      clearTimeout(pollTimer.current)
      pollTimer.current = undefined
    }
    if (countTimer.current !== undefined) {
      clearInterval(countTimer.current)
      countTimer.current = undefined
    }
  }

  /** 取消网页登录：停止轮询并回到配置界面 */
  function cancelWeb() {
    stopPolling()
    setDevice(null)
    setWebPhase('config')
    setWebError('')
  }

  /** 拿到 Token 后：验证身份 → 自动创建/复用仓库 → 保存配置 */
  async function finishLogin(accessToken: string) {
    const user = await getCurrentUser(accessToken)
    const repo = await ensureRepo(accessToken, user.login, repoName.trim() || DEFAULT_REPO)
    const saved: GitHubSettings = {
      id: 1,
      token: accessToken,
      owner: user.login,
      repo: repo.name,
      defaultBranch: repo.default_branch,
      userLogin: user.login,
      userAvatar: user.avatar_url,
      autoSync: initial?.autoSync ?? false,
      clientId: clientId.trim() || undefined,
      clientSecret: clientSecret.trim() || undefined,
      relayUrl: relayUrl.trim() || undefined
    }
    onSaved(saved)
    onClose()
  }

  async function handleTokenSubmit(e: FormEvent) {
    e.preventDefault()
    if (token.trim() === '') return
    setTokenStatus('busy')
    setTokenError('')
    try {
      await finishLogin(token.trim())
    } catch (err) {
      setTokenStatus('error')
      setTokenError(friendlyGitHubError(err))
    }
  }

  async function handleWebStart() {
    if (clientId.trim() === '' || relayUrl.trim() === '') {
      setWebPhase('error')
      setWebError('请先填写 Client ID 与中转地址')
      return
    }
    setWebError('')
    try {
      const d = await requestDeviceCode(relayUrl.trim(), clientId.trim())
      setDevice(d)
      deviceCodeRef.current = d.device_code
      expiresAtRef.current = Date.now() + d.expires_in * 1000
      setWebPhase('waiting')
      setRemaining(d.expires_in)
      countTimer.current = window.setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            stopPolling()
            setWebPhase('error')
            setWebError('设备码已过期，请重新开始登录')
            return 0
          }
          return r - 1
        })
      }, 1000)
      startPolling(d.interval)
    } catch (err) {
      setWebPhase('error')
      setWebError(err instanceof Error ? err.message : '请求设备码失败')
    }
  }

  function startPolling(intervalSec: number) {
    let interval = Math.max(5, intervalSec)
    const tick = async () => {
      if (Date.now() > expiresAtRef.current) return
      try {
        const accessToken = await pollAccessToken(
          relayUrl.trim(),
          clientId.trim(),
          deviceCodeRef.current,
          clientSecret.trim() || undefined
        )
        stopPolling()
        await finishLogin(accessToken)
      } catch (err) {
        if (err instanceof PendingError) {
          if (err.slowDown) interval += 5
          pollTimer.current = window.setTimeout(() => void tick(), interval * 1000)
        } else {
          stopPolling()
          setWebPhase('error')
          setWebError(err instanceof Error ? err.message : '获取访问令牌失败')
        }
      }
    }
    pollTimer.current = window.setTimeout(() => void tick(), interval * 1000)
  }

  function openDevicePage() {
    window.open('https://github.com/login/device', '_blank', 'noopener')
  }

  const tokenReady = token.trim() !== '' && repoName.trim() !== '' && tokenStatus !== 'busy'

  return (
    <div className="dialog-mask" onClick={onClose} role="presentation">
      <div
        className="dialog glass-panel"
        role="dialog"
        aria-modal="true"
        aria-label="登录 GitHub"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">登录 GitHub</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              云存档 · 自动创建私有仓库
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="seg" style={{ marginBottom: 14 }}>
          <button
            className={`seg__item${tab === 'token' ? ' seg__item--active' : ''}`}
            onClick={() => {
              cancelWeb()
              setTab('token')
            }}
          >
            手动 Token
          </button>
          <button
            className={`seg__item${tab === 'web' ? ' seg__item--active' : ''}`}
            onClick={() => setTab('web')}
          >
            网页登录
          </button>
        </div>

        {/* ===== 手动 Token ===== */}
        <form
          onSubmit={handleTokenSubmit}
          style={{ display: tab === 'token' ? 'flex' : 'none', flexDirection: 'column', gap: 14 }}
        >
          <div className="field">
            <label className="field__label" htmlFor="lg-token">
              Personal Access Token
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="lg-token"
                className="input"
                type={showToken ? 'text' : 'password'}
                placeholder="github_pat_…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => setShowToken((v) => !v)}
                aria-pressed={showToken}
                style={{ flexShrink: 0 }}
              >
                {showToken ? '隐藏' : '显示'}
              </button>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor="lg-repo">
              仓库名（不存在则自动创建私有仓库）
            </label>
            <input
              id="lg-repo"
              className="input"
              placeholder={DEFAULT_REPO}
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <a
            className="link"
            href="https://github.com/settings/personal-access-tokens/new"
            target="_blank"
            rel="noreferrer"
          >
            没有 Token？打开 GitHub 生成细粒度 Token ↗
          </a>

          {tokenStatus === 'error' && <div className="note note--error">{tokenError}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>
              取消
            </button>
            <button type="submit" className="btn btn--primary" disabled={!tokenReady} style={{ flex: 2 }}>
              {tokenStatus === 'busy' ? '登录中…' : '登录并创建仓库'}
            </button>
          </div>
        </form>

        {/* ===== 网页登录（Device Flow） ===== */}
        <div style={{ display: tab === 'web' ? 'flex' : 'none', flexDirection: 'column', gap: 14 }}>
          {webPhase === 'waiting' && device ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="note note--ok">
                1. 点击下方按钮打开 GitHub 授权页（新窗口）
                <br />
                2. 输入设备码：<strong>{device.user_code}</strong>，点击 Authorize
                <br />
                3. 授权成功后本页会自动完成登录
              </div>
              <div className="device-code">{device.user_code}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn btn--primary" onClick={openDevicePage} style={{ flex: 1 }}>
                  打开 GitHub 授权页
                </button>
                <span className="editor__meta">剩余 {remaining}s</span>
              </div>
              <button className="btn" onClick={cancelWeb}>
                取消并返回
              </button>
            </div>
          ) : (
            <>
              <div className="field">
                <label className="field__label" htmlFor="lg-cid">
                  OAuth App Client ID
                </label>
                <input
                  id="lg-cid"
                  className="input"
                  placeholder="Iv1.xxxxxxxx"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="lg-relay">
                  中转地址（自建 Cloudflare Worker）
                </label>
                <input
                  id="lg-relay"
                  className="input"
                  placeholder="https://xxx.workers.dev"
                  value={relayUrl}
                  onChange={(e) => setRelayUrl(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="lg-secret">
                  Client Secret（可选，仅在 GitHub 要求时填写）
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="lg-secret"
                    className="input"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="可选"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => setShowSecret((v) => !v)}
                    style={{ flexShrink: 0 }}
                  >
                    {showSecret ? '隐藏' : '显示'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a
                  className="link"
                  href="https://github.com/settings/applications/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  第一步：创建 OAuth App（勾选 Device flow）↗
                </a>
                <a
                  className="link"
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  第二步：部署中转 Worker（复制仓库 server/device-flow-worker.js）↗
                </a>
              </div>

              {webPhase === 'error' && <div className="note note--error">{webError}</div>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>
                  取消
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => void handleWebStart()}
                  style={{ flex: 2 }}
                >
                  开始网页登录
                </button>
              </div>
            </>
          )}
        </div>

        <div className="note" style={{ marginTop: 14 }}>
          提示：Token 或 OAuth 配置仅保存在本机浏览器。仓库不存在时会自动创建为私有仓库。
        </div>
      </div>
    </div>
  )
}
