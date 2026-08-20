// 从 package.json 同步 Android 版本号到 android/app/build.gradle
// 避免发布时忘记更新 APK 的 versionName / versionCode
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)
const versionName = pkg.version
// 单调递增：主版本*10000 + 次版本*100 + 修订
const versionCode = major * 10000 + minor * 100 + (patch ?? 0)

const gradlePath = join(root, 'android', 'app', 'build.gradle')
const gradle = readFileSync(gradlePath, 'utf8')
const next = gradle
  .replace(/versionCode \d+/, `versionCode ${versionCode}`)
  .replace(/versionName "[^"]*"/, `versionName "${versionName}"`)

if (next !== gradle) {
  writeFileSync(gradlePath, next)
  console.log(`Android 版本已同步：versionName=${versionName} versionCode=${versionCode}`)
} else {
  console.log('Android build.gradle 未匹配到版本字段，请检查格式')
  process.exitCode = 1
}
