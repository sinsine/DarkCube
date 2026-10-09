// 墨辰日记 · Electron 主进程
// 将构建产物 dist/ 包装为 Windows 桌面应用
const { app, BrowserWindow, shell, session } = require('electron')
const path = require('path')
const { URL } = require('url')

/** 判断是否为应用内部页面（本地文件） */
function isInternalUrl(url) {
  try {
    return new URL(url).protocol === 'file:'
  } catch {
    return false
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1120,
    height: 780,
    minWidth: 380,
    minHeight: 560,
    title: '墨辰DarkCube',
    backgroundColor: '#f4f4f4',
    autoHideMenuBar: true,
    webPreferences: {
      // 安全基线：渲染进程无 Node 能力、启用沙箱与上下文隔离
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      sandbox: true,
      webviewTag: false,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      spellcheck: false
    }
  })

  // 外部链接（GitHub 授权页 / B 站等）交给系统浏览器打开
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalUrl(url)) return { action: 'allow' }
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  // 阻止渲染进程被导航到外部页面（防御钓鱼/劫持）
  win.webContents.on('will-navigate', (event, url) => {
    if (isInternalUrl(url)) return
    event.preventDefault()
    void shell.openExternal(url)
  })

  // 拒绝一切权限请求（摄像头/麦克风/定位/通知等，本应用均不需要）
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => {
    callback(false)
  })
  session.defaultSession.setPermissionCheckHandler(() => false)

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

// 单实例锁：避免多开导致本地数据库 / 同步状态互相干扰
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
