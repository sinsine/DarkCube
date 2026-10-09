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

/** Wails 桌面壳暴露的绑定方法（存在即为桌面版） */
interface WailsBindings {
  main?: {
    App?: {
      LegacyDataInfo?: () => Promise<string>
    }
  }
}

function wailsMain(): WailsBindings['main'] | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { go?: WailsBindings }).go?.main
}

/** 是否运行在桌面版（Wails 外壳）中 */
export function isDesktopShell(): boolean {
  return wailsMain()?.App?.LegacyDataInfo !== undefined
}

/**
 * 查询旧版本（Electron 版 / v1.5.0 轻量版）的本地数据目录。
 * 仅桌面版可用；未检测到或非桌面环境返回空字符串。
 */
export async function getLegacyDataPath(): Promise<string> {
  const fn = wailsMain()?.App?.LegacyDataInfo
  if (typeof fn !== 'function') return ''
  try {
    const path = await fn()
    return typeof path === 'string' ? path : ''
  } catch {
    return ''
  }
}
