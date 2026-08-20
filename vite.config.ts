import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // 相对路径：可部署到 GitHub Pages 子路径（username.github.io/repo/），本地开发不受影响
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: '墨辰日记',
        short_name: '墨辰',
        description: '黑白玻璃风格的本地优先日记，GitHub 私有仓库云存档',
        lang: 'zh-CN',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html'
      },
      devOptions: { enabled: false }
    })
  ],
  server: {
    host: true,
    port: 5173,
    watch: {
      // 忽略编辑器原子写入的临时目录，避免 Windows 下 Vite 监听 EBUSY 崩溃
      ignored: ['**/.*.tmpdir/**', '**/*.tmp']
    }
  }
})
