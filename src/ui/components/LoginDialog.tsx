import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { GitHubSettings } from '../../core/types'
import { verifyLogin, friendlyGitHubError } from '../../core/github/api'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  /** 预填的既有配置 */
  initial: GitHubSettings | null
  /** 登录成功回调（已持久化） */
  onSaved: (s: GitHubSettings) => void
}

type Status = 'idle' | 'busy' | 'error' | 'ok'

/** 手动登录 GitHub：owner + repo + PAT，调用 API 实测校验 */
export function LoginDialog({ open, onClose, initial, onSaved }: LoginDialogProps) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setOwner(initial?.owner ?? '')
      setRepo(initial?.repo ?? '')
      setToken(initial?.token ?? '')
      setShowToken(false)
      setStatus('idle')
      setError('')
    }
  }, [open, initial])

  if (!open) return null

  const canSubmit = owner.trim() !== '' && repo.trim() !== '' && token.trim() !== '' && status !== 'busy'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('busy')
    setError('')
    try {
      const { user, repo: repoInfo } = await verifyLogin(token.trim(), owner.trim(), repo.trim())
      const saved: GitHubSettings = {
        id: 1,
        owner: owner.trim(),
        repo: repo.trim(),
        token: token.trim(),
        userLogin: user.login,
        userAvatar: user.avatar_url,
        defaultBranch: repoInfo.default_branch,
        autoSync: initial?.autoSync ?? false
      }
      setStatus('ok')
      onSaved(saved)
      onClose()
    } catch (e) {
      setStatus('error')
      setError(friendlyGitHubError(e))
    }
  }

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
              手动登录 · 使用私有仓库云存档日记
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="field__label" htmlFor="lg-owner">
              GitHub 用户名 / 组织
            </label>
            <input
              id="lg-owner"
              className="input"
              placeholder="例如 zhang-san"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="lg-repo">
              仓库名
            </label>
            <input
              id="lg-repo"
              className="input"
              placeholder="例如 my-diary（私有仓库）"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

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
                style={{ fontFamily: 'var(--font-ui)' }}
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

          {status === 'error' && <div className="note note--error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>
              取消
            </button>
            <button type="submit" className="btn btn--primary" disabled={!canSubmit} style={{ flex: 2 }}>
              {status === 'busy' ? '验证中…' : '验证并登录'}
            </button>
          </div>
        </form>

        <div className="note" style={{ marginTop: 14 }}>
          提示：Token 只在「设置 → GitHub 开发者设置 → 细粒度 Token」中生成，勾选目标仓库的
          Contents 读写权限即可。Token 仅保存在本机浏览器。
        </div>
      </div>
    </div>
  )
}
