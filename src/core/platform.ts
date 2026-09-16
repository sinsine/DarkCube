/** 运行环境判断 */

import { Capacitor } from '@capacitor/core'

/** 是否运行在原生 App 外壳（Android APK 等 Capacitor 容器）中 */
export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}
