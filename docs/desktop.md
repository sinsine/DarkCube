# 桌面版（Wails + WebView2）

> 本项目唯一的桌面构建。源码位于 `desktop-wails/`，与 PWA / Android 共用同一份前端代码与构建产物（仓库根的 `dist/`）。

## 为什么不用 Electron

早期版本使用 Electron，会把整个 Chromium + Node.js 一起打包：

| 方案 | 下载体积 | 安装后体积 | 运行时依赖 |
|---|---|---|---|
| Electron（v1.5.0 及更早） | ≈ 100 MB | ≈ 315 MB | 无（自带 Chromium） |
| **Wails + 系统 WebView2（当前）** | **≈ 12 MB** | **≈ 12 MB** | 需 WebView2 Runtime |

Wails 复用系统已安装的 **WebView2 Runtime**（Windows 10 1803+ / Windows 11 默认随 Edge 预装），
产物只有一个约 12 MB 的单文件可执行程序；构建耗时也从约 2 分钟降到约 4 秒。

## ⚠️ 从旧版本升级的数据迁移（重要）

不同外壳的浏览器存储 **origin 不同**，旧版本的本地日记无法被新版本直接读取：

| 版本 | IndexedDB origin | 数据目录 |
|---|---|---|
| Electron 版（≤ 1.5.0 标准版） | `file__0` | `%APPDATA%\darkcube-diary\IndexedDB\` |
| 1.5.0 轻量版 | `http_wails.localhost_0` | `%APPDATA%\墨辰DarkCube-Lite.exe\EBWebView\Default\IndexedDB\` |
| **2.0.0 桌面版** | `http_wails.localhost_0` | `%APPDATA%\DarkCube\EBWebView\Default\IndexedDB\` |

**迁移步骤（数据不会丢失）：**

1. 打开旧版本 → 设置 → 数据 → **导出备份**（生成 `darkcube-backup-YYYY-MM-DD.json`）
2. 打开新版本 → 设置 → 数据 → **导入备份**，选择该 JSON 文件
3. 确认日记数量无误后即可继续使用

> 新版本启动时若检测到旧版本数据且本地为空，会自动弹出迁移提示（`App.LegacyDataInfo`），
> 并显示检测到的旧数据目录路径。

> 自 2.0.0 起 WebView2 数据目录被**固定**为 `%APPDATA%\DarkCube`（见 `main.go` 的 `WebviewUserDataPath`），
> 以后即使修改 exe 文件名也不会再更换存储位置。

## 构建方式

### 一次性准备工具链

```powershell
# 1) Go 1.21+：可用阿里云镜像下载便携版 zip，解压后加入 PATH
#    https://mirrors.aliyun.com/golang/go1.27.2.windows-amd64.zip
# 2) Wails CLI
$env:GOPROXY="https://goproxy.cn,direct"
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 构建

```powershell
npm run dist:desktop
```

该命令会：构建前端 → 把 `dist/` 复制到 `desktop-wails/frontend/dist` → 调用 `wails build` →
输出 `desktop-wails/build/bin/DarkCubeDiary.exe`，并归档为 `DarkCubeDiary-<版本>-portable.exe`。

> CI 尚未自动化桌面构建（需要 Go + Wails 工具链）；发版时本地构建后上传 Release。
> 另注意 `desktop-wails/wails.json` 的 `info.productVersion` 需与 `package.json` 手工同步。

## 实现要点

- 前端产物通过 Go 的 `//go:embed all:frontend/dist` 编译进单一可执行文件
- **单实例锁**：避免多开互相干扰本地数据与同步状态
- **外链桥接**：`OnDomReady` 注入脚本，把 `window.open` 与 `target="_blank"` 链接交给系统默认浏览器，
  同时阻断应用内导航到外部页面
- **固定 WebView2 数据目录**：`%APPDATA%\DarkCube`，避免改名导致本地数据"消失"
- **旧版数据检测**：`App.LegacyDataInfo()` 供界面提示迁移
- 内容安全策略（CSP）由前端 `index.html` 提供，与 Web/Android 完全一致
- 窗口规格：1120×780，最小 380×560
