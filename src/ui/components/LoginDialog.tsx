import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { GitHubSettings } from '../../core/types'
import { ensureRepo, friendlyGitHubError, getCurrentUser } from '../../core/github/api'
import { TutorialDialog } from './TutorialDialog'

interface LoginDialogProps {
  open: boolean
  onClose: () => void
  /** 预填的既有配置 */
  initial: GitHubSettings | null
  /** 登录成功回调（由上层持久化） */
  onSaved: (s: GitHubSettings) => void
}

type Status = 'idle' | 'busy' | 'error'

const DEFAULT_REPO = 'darkcube-diary'

/** 手动 Token 登录：验证身份，仓库不存在时自动创建私有仓库 */
export function LoginDialog({ open, onClose, initial, onSaved }: LoginDialogProps) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [repoName, setRepoName] = useState(DEFAULT_REPO)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [tutorialOpen, setTutorialOpen] = useState(false)

  useEffect(() => {
    if (open) {
      setToken(initial?.token ?? '')
      setShowToken(false)
      setRepoName(initial?.repo ?? DEFAULT_REPO)
      setStatus('idle')
      setError('')
    }
  }, [open, initial])

  if (!open) return null

  const canSubmit = token.trim() !== '' && repoName.trim() !== '' && status !== 'busy'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('busy')
    setError('')
    try {
      const user = await getCurrentUser(token.trim())
      const repo = await ensureRepo(token.trim(), user.login, repoName.trim())
      const saved: GitHubSettings = {
        id: 1,
        token: token.trim(),
        owner: user.login,
        repo: repo.name,
        defaultBranch: repo.default_branch,
        userLogin: user.login,
        userAvatar: user.avatar_url,
        autoSync: initial?.autoSync ?? false
      }
      onSaved(saved)
      onClose()
    } catch (err) {
      setStatus('error')
      setError(friendlyGitHubError(err))
    }
  }

  return (
    <>
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
              云存档 · 仓库不存在时自动创建私有仓库
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

          {status === 'error' && <div className="note note--error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>
              取消
            </button>
            <button type="submit" className="btn btn--primary" disabled={!canSubmit} style={{ flex: 2 }}>
              {status === 'busy' ? '登录中…' : '登录并创建仓库'}
            </button>
          </div>
        </form>

        <div className="note" style={{ marginTop: 14 }}>
          提示：Token 仅保存在本机浏览器。仓库不存在时会自动创建为私有仓库。
        </div>

        <button
          type="button"
          className="btn btn--sm"
          onClick={() => setTutorialOpen(true)}
          style={{ alignSelf: 'center', marginTop: 10 }}
        >
          📖 不会操作 GitHub？查看新手登录教程
        </button>
      </div>
      </div>

      <TutorialDialog open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  )
}
