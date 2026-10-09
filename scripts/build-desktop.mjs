// 构建桌面版（Wails + 系统 WebView2）—— 本项目唯一的桌面构建
// 步骤：1) 复用仓库根的 dist/ 产物  2) 调用 wails build  3) 按版本号归档到成品目录
//
// 依赖：Go 1.21+ 与 wails CLI（go install github.com/wailsapp/wails/v2/cmd/wails@latest）
// 详见 docs/desktop.md
import { execFileSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcDist = join(root, 'dist')
const dstDist = join(root, 'desktop-wails', 'frontend', 'dist')
const builtExe = join(root, 'desktop-wails', 'build', 'bin', 'DarkCubeDiary.exe')
/** 成品归档目录（仅本机存在时生效；CI 上会跳过） */
const releaseDir = 'D:/Data/Documents/软件工程/成品'

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

if (!existsSync(srcDist)) {
  console.error('未找到 dist/，请先执行 npm run build')
  process.exit(1)
}

// 1) 复制前端产物（Wails 通过 //go:embed 打包进 exe）
rmSync(dstDist, { recursive: true, force: true })
mkdirSync(dstDist, { recursive: true })
cpSync(srcDist, dstDist, { recursive: true })
console.log('已复制前端产物 →', dstDist)

// 2) 构建
const wails = process.platform === 'win32' ? 'wails.exe' : 'wails'
try {
  execFileSync(wails, ['build', '-platform', 'windows/amd64', '-clean'], {
    cwd: join(root, 'desktop-wails'),
    stdio: 'inherit'
  })
} catch (e) {
  if (e.code === 'ENOENT') {
    console.error('\n未找到 wails CLI，请先安装：go install github.com/wailsapp/wails/v2/cmd/wails@latest')
  }
  process.exit(1)
}

// 3) 归档（产物名带版本号，与 Release 资产命名一致）
if (!existsSync(builtExe)) {
  console.error('未找到构建产物：' + builtExe)
  process.exit(1)
}
console.log(`\n构建完成：${builtExe}  (${(statSync(builtExe).size / 1048576).toFixed(2)} MB)`)

const artifact = `DarkCubeDiary-${version}-portable.exe`
if (existsSync(releaseDir)) {
  copyFileSync(builtExe, join(releaseDir, artifact))
  console.log(`已归档 → ${join(releaseDir, artifact)}`)
} else {
  console.log('（无成品目录，跳过归档）')
}
