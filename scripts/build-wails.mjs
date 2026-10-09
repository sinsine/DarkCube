// 构建轻量桌面版（Wails + 系统 WebView2）
// 步骤：1) 复用仓库根的 dist/ 产物  2) 调用 wails build
//
// 依赖：Go 1.21+ 与 wails CLI（go install github.com/wailsapp/wails/v2/cmd/wails@latest）
import { execFileSync, execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcDist = join(root, 'dist')
const wailsDir = join(root, 'desktop-wails')
const dstDist = join(wailsDir, 'frontend', 'dist')

if (!existsSync(srcDist)) {
  console.error('未找到 dist/，请先执行 npm run build')
  process.exit(1)
}

// 1) 复制前端产物
rmSync(dstDist, { recursive: true, force: true })
mkdirSync(dstDist, { recursive: true })
cpSync(srcDist, dstDist, { recursive: true })
console.log('已复制前端产物 →', dstDist)

// 2) 构建
const isWin = process.platform === 'win32'
const wails = isWin ? 'wails.exe' : 'wails'
try {
  execFileSync(wails, ['build', '-platform', 'windows/amd64', '-clean'], {
    cwd: wailsDir,
    stdio: 'inherit'
  })
} catch (e) {
  if (e.code === 'ENOENT') {
    console.error('\n未找到 wails CLI，请先安装：go install github.com/wailsapp/wails/v2/cmd/wails@latest')
  }
  process.exit(1)
}

const out = join(wailsDir, 'build', 'bin', '墨辰DarkCube-Lite.exe')
if (existsSync(out)) {
  const mb = statSync(out).size / 1048576
  console.log(`\n构建完成：${out}  (${mb.toFixed(2)} MB)`)
} else {
  // 兼容非 Windows 平台的产物名
  console.log('\n构建完成，产物位于 desktop-wails/build/bin/')
}

// 3) 拷贝一份到成品目录（与 Electron 产物同处）
const releaseDir = 'D:/Data/Documents/软件工程/成品'
if (isWin && existsSync(out) && existsSync(releaseDir)) {
  try {
    execSync(`copy /Y "${out}" "${releaseDir}\\DarkCubeDiary-Lite-portable.exe" >nul`, { shell: 'cmd.exe' })
    console.log('已拷贝到成品目录：DarkCubeDiary-Lite-portable.exe')
  } catch {
    console.warn('拷贝到成品目录失败（不影响构建结果）')
  }
}
