import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { ErrorBoundary } from './ui/components/ErrorBoundary'
import './styles/tokens.css'
import './styles/base.css'
import './styles/glass.css'
import './styles/app.css'

// 渲染前应用主题，避免闪烁（默认日间模式）
document.documentElement.dataset.theme =
  localStorage.getItem('darkcube-theme') === 'dark' ? 'dark' : 'light'

// 全局异常兜底：避免未捕获错误静默失败（仅记录，不上报）
window.addEventListener('error', (e) => {
  console.error('[DarkCube] uncaught error:', e.error ?? e.message)
})
window.addEventListener('unhandledrejection', (e) => {
  console.error('[DarkCube] unhandled rejection:', e.reason)
})

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
