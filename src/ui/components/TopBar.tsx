import type { GitHubSettings, ViewId } from '../../core/types'
import { version } from '../../../package.json'

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

const NAV_ITEMS: { id: ViewId; label: string }[] = [
  { id: 'calendar', label: '日历' },
  { id: 'timeline', label: '时间线' },
  { id: 'settings', label: '设置' }
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
        <span>墨辰日记</span>
        <span className="brand__version">v{version}</span>
      </div>

      <nav className="topbar__nav glass-panel--flat" aria-label="主导航">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${view === item.id ? ' nav-item--active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="topbar__right">
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? '切换日间模式' : '切换夜间模式'}
          aria-label="切换主题"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="btn btn--primary topbar__write" onClick={onWrite}>
          写日记
        </button>
        {loggedIn && settings ? (
          <button className="chip" onClick={() => onNavigate('settings')} title="点击进入设置">
            {settings.userAvatar ? (
              <img className="chip__avatar" src={settings.userAvatar} alt="" referrerPolicy="no-referrer" />
            ) : (
              <span className="chip__dot chip__dot--on" />
            )}
            <span>
              {settings.userLogin} · {settings.repo}
            </span>
          </button>
        ) : (
          <button className="btn btn--sm" onClick={onOpenLogin}>
            <span className="chip__dot" />
            登录 GitHub
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

const MOBILE_ITEMS: { id: ViewId; label: string; glyph: string }[] = [
  { id: 'calendar', label: '日历', glyph: '◫' },
  { id: 'editor', label: '写日记', glyph: '✎' },
  { id: 'timeline', label: '时间线', glyph: '≡' },
  { id: 'settings', label: '设置', glyph: '⚙' }
]

/** 底部导航（移动端） */
export function BottomNav({ view, onNavigate, onWrite }: BottomNavProps) {
  return (
    <nav className="bottomnav" aria-label="底部导航">
      {MOBILE_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottomnav__item${view === item.id ? ' bottomnav__item--active' : ''}`}
          onClick={() => (item.id === 'editor' ? onWrite() : onNavigate(item.id))}
        >
          <span aria-hidden="true">{item.glyph}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
