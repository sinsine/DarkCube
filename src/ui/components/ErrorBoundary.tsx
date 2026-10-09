import { Component, type ErrorInfo, type ReactNode } from 'react'
import { t } from '../../core/i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** 渲染异常兜底：避免白屏，给出恢复入口（本地数据不受影响） */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 仅记录到控制台，便于排查；不上报任何数据
    console.error('[DarkCube] render error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="crash">
        <div className="crash__card glass-panel">
          <div className="crash__icon">墨</div>
          <div className="crash__title">{t('crash.title')}</div>
          <div className="crash__desc">{t('crash.desc')}</div>
          <button className="btn btn--primary" onClick={() => window.location.reload()}>
            {t('crash.reload')}
          </button>
        </div>
      </div>
    )
  }
}
