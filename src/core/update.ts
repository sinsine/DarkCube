/** 更新检测：指向本应用公开仓库的最新 Releases */

export const UPDATE_REPO = 'sinsine/DarkCube'

/** 项目 GitHub 主界面 */
export const GITHUB_URL = `https://github.com/${UPDATE_REPO}`

/** 最新 Releases 界面（github.com 会 302 重定向到最新版） */
export const RELEASES_URL = `https://github.com/${UPDATE_REPO}/releases/latest`

/** 指定版本的 Releases 页 */
export function releaseUrl(tag: string): string {
  return `https://github.com/${UPDATE_REPO}/releases/tag/${tag}`
}

export interface ReleaseInfo {
  tag_name: string
  html_url: string
  name?: string
}

/** 查询 GitHub 上最新发布的版本；失败返回 null（静默降级） */
export async function checkLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${UPDATE_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store'
    })
    if (!res.ok) return null
    return (await res.json()) as ReleaseInfo
  } catch {
    return null
  }
}

/** 简单版本比较：a > b 返回 true（形如 "v1.2.1" / "1.2.1"） */
export function isNewer(a: string, b: string): boolean {
  const pa = a.replace(/^v/i, '').split('.').map(Number)
  const pb = b.replace(/^v/i, '').split('.').map(Number)
  const len = Math.max(pa.length, pb.length)
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0
    const y = pb[i] ?? 0
    if (x !== y) return x > y
  }
  return false
}
