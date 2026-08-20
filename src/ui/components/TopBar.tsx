import type { GitHubSettings, ViewId } from '../../core/types'
import { version } from '../../../package.json'
import { t } from '../../core/i18n'

interface TopBarProps {
  view: ViewId
  onNavigate: (view: ViewId) => void
  onWrite: () => void
  settings: GitHubSettings | null
  loggedIn: boolean
  onOpenLogin: () => void
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

const NAV_ITEMS: { id: ViewId; labelKey: string }[] = [
  { id: 'calendar', labelKey: 'nav.calendar' },
  { id: 'timeline', labelKey: 'nav.timeline' },
  { id: 'settings', labelKey: 'nav.settings' }
]

/** 顶栏：品牌 + 桌面导航 + 写日记 + 主题切换 + 登录状态 */
export function TopBar({
  view,
  onNavigate,
  onWrite,
  settings,
  loggedIn,
  onOpenLogin,
  theme,
  onToggleTheme
}: TopBarProps) {
  return (
    <header className="glass-panel topbar">
      <div className="brand">
        <span className="brand__logo">墨</span>
        <span className="brand__name brand__name--full">墨辰DarkCube</span>
        <span className="brand__name brand__name--short">墨辰</span>
        <span className="brand__version">v{version}</span>
      </div>

      <nav className="topbar__nav glass-panel--flat" aria-label={t('nav.settings')}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${view === item.id ? ' nav-item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </nav>

      <div className="topbar__right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? t('topbar.theme.light') : t('topbar.theme.dark')}
          aria-label={theme === 'dark' ? t('topbar.theme.light') : t('topbar.theme.dark')}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="btn btn--primary topbar__write" onClick={onWrite}>
          {t('nav.write')}
        </button>
        {loggedIn && settings ? (
          <button className="chip" onClick={() => onNavigate('settings')} title={t('nav.settings')}>
            {settings.userAvatar ? (
              <img className="chip__avatar" src={settings.userAvatar} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span className="chip__dot chip__dot--on" />
            )}
            <span className="chip__text">
              {settings.userLogin} · {settings.repo}
            </span>
          </button>
        ) : (
          <button className="btn btn--sm" onClick={onOpenLogin}>
            <span className="chip__dot" />
            {t('nav.login')}
          </button>
        )}
      </div>
    </header>
  )
}

interface BottomNavProps {
  view: ViewId
  onNavigate: (view: ViewId) => void
  onWrite: () => void
}

const MOBILE_ITEMS: { id: ViewId; labelKey: string; glyph: string }[] = [
  { id: 'calendar', labelKey: 'nav.calendar', glyph: '◫' },
  { id: 'editor', labelKey: 'nav.write', glyph: '✎' },
  { id: 'timeline', labelKey: 'nav.timeline', glyph: '≡' },
  { id: 'settings', labelKey: 'nav.settings', glyph: '⚙' }
]

/** 底部导航（移动端） */
export function BottomNav({ view, onNavigate, onWrite }: BottomNavProps) {
  return (
    <nav className="bottomnav" aria-label={t('nav.settings')}>
      {MOBILE_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottomnav__item${view === item.id ? ' bottomnav__item--active' : ''}`}
          onClick={() => (item.id === 'editor' ? onWrite() : onNavigate(item.id))}
        >
          <span className="bottomnav__icon" aria-hidden="true">
            {item.glyph}
          </span>
          <span className="bottomnav__label">{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  )
}
