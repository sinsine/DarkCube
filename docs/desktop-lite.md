# 轻量桌面版（Wails + WebView2）

> 本文档说明 `desktop-wails/` 目录的用途、构建方式，以及**数据迁移的注意事项**。

## 为什么有两条桌面构建

| 构建 | 技术栈 | 下载体积 | 安装后体积 | 运行时依赖 |
|---|---|---|---|---|
| 标准版（推荐） | Electron | ≈ 100 MB | ≈ 315 MB | 无（自带 Chromium） |
| **轻量版** | Wails + 系统 WebView2 | **≈ 11.7 MB** | ≈ 11.7 MB | 需 WebView2 Runtime |

两者**共用同一份前端代码与构建产物**（仓库根的 `dist/`），差异只在桌面外壳：

- 标准版：`electron/main.cjs`（Electron 40 余行主进程）
- 轻量版：`desktop-wails/main.go`（Wails + Go，约 100 行）

## 体积为何差这么多

Electron 会把整个 Chromium + Node.js 一起打包（本项目的 `win-unpacked` 中，Chromium 相关文件约占 300 MB）。
Wails 则复用系统已安装的 **WebView2 Runtime**（Windows 10 1803+ / Windows 11 默认随 Edge 预装），
因此产物只有一个约 12 MB 的可执行文件。

## ⚠️ 数据不互通（重要）

两个外壳的浏览器存储 origin 不同，**本地数据无法互相读取**：

| 外壳 | IndexedDB origin | 数据目录 |
|---|---|---|
| Electron | `file__0` | `%APPDATA%\darkcube-diary\IndexedDB\` |
| 轻量版 | `http_wails.localhost_0` | `%APPDATA%\墨辰DarkCube-Lite.exe\EBWebView\Default\IndexedDB\` |

**在切换外壳前，请先用旧版导出、在新版导入：**

1. 打开旧版本：设置 → 数据 → **导出备份**（生成 `darkcube-backup-YYYY-MM-DD.json`）
2. 打开新版本：设置 → 数据 → **导入备份**，选择该 JSON 文件
3. 确认日记数量无误后，即可继续使用新版本

> 反之亦然（从轻量版切回 Electron 同样需要导出/导入）。

## 构建方式

### 一次性准备工具链

```powershell
# 1) Go（1.21+）：使用阿里云镜像下载便携版 zip，解压后加入 PATH
#    https://mirrors.aliyun.com/golang/go1.27.2.windows-amd64.zip
# 2) Wails CLI
$env:GOPROXY="https://goproxy.cn,direct"
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 构建

```powershell
npm run dist:wails
```

该命令会：构建前端 → 把 `dist/` 复制到 `desktop-wails/frontend/dist` → 调用 `wails build` →
输出 `desktop-wails/build/bin/墨辰DarkCube-Lite.exe`（并拷贝一份到成品目录）。

## 实现要点

- 前端产物通过 Go 的 `//go:embed all:frontend/dist` 编译进单一可执行文件
- **单实例锁**：避免多开互相干扰本地数据与同步状态
- **外链桥接**：`OnDomReady` 注入脚本，把 `window.open` 与 `target="_blank"` 链接交给系统默认浏览器，
  避免在应用内弹出新窗口，也阻断了应用内导航到外部页面
- 内容安全策略（CSP）由前端 `index.html` 提供，两个外壳一致
- 窗口规格与 Electron 版保持一致（1120×780，最小 380×560）
