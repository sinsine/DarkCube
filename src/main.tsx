import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/glass.css'
import './styles/app.css'

// 渲染前应用主题，避免闪烁（默认日间模式）
document.documentElement.dataset.theme =
  localStorage.getItem('darkcube-theme') === 'dark' ? 'dark' : 'light'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
