// 从 package.json 同步 Android 版本号到 android/app/build.gradle
// 避免发布时忘记更新 APK 的 versionName / versionCode（幂等，可重复执行）
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

const hasCode = /versionCode\s+\d+/.test(gradle)
const hasName = /versionName\s+"[^"]*"/.test(gradle)

if (!hasCode || !hasName) {
  console.error('android/app/build.gradle 中未找到 versionCode / versionName 字段，请检查格式')
  process.exit(1)
}

const next = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  .replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`)

if (next !== gradle) {
  writeFileSync(gradlePath, next)
}
console.log(`Android 版本已同步：versionName=${versionName} versionCode=${versionCode}`)
