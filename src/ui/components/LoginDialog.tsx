import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { GitHubSettings } from '../../core/types'
import { ensureRepo, friendlyGitHubError, getCurrentUser } from '../../core/github/api'
import { t } from '../../core/i18n'
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
          aria-label={t('login.title')}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="dialog__head">
            <div>
              <div className="dialog__title">{t('login.title')}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
                {t('login.subtitle')}
              </div>
            </div>
            <button className="dialog__close" onClick={onClose} aria-label={t('dialog.close')}>
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
                  {showToken ? t('login.hide') : t('login.show')}
                </button>
              </div>
            </div>

            <div className="field">
              <label className="field__label" htmlFor="lg-repo">
                {t('login.repoName')}
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
              {t('login.tokenHelper')}
            </a>

            {status === 'error' && <div className="note note--error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>
                {t('login.cancel')}
              </button>
              <button type="submit" className="btn btn--primary" disabled={!canSubmit} style={{ flex: 2 }}>
                {status === 'busy' ? t('login.submitting') : t('login.submit')}
              </button>
            </div>
          </form>

          <div className="note" style={{ marginTop: 14 }}>
            {t('login.note')}
          </div>

          <button
            type="button"
            className="btn btn--sm"
            onClick={() => setTutorialOpen(true)}
            style={{ alignSelf: 'center', marginTop: 10 }}
          >
            {t('login.tutorialBtn')}
          </button>
        </div>
      </div>

      <TutorialDialog open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </>
  )
}
