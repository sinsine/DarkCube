/** GitHub REST API 客户端（纯浏览器，无第三方依赖） */

const GH_API = 'https://api.github.com'
const GH_VERSION = '2022-11-28'

export class GitHubError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'GitHubError'
    this.status = status
  }
}

/** 底层请求：统一认证头与错误解析（供 api / git 模块共用） */
export async function ghApiFetch(path: string, token: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${GH_API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': GH_VERSION,
      ...(init?.headers ?? {})
    }
  })
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`
    try {
      const j = (await res.json()) as { message?: string }
      if (j?.message) msg = j.message
    } catch {
      /* 忽略非 JSON 响应 */
    }
    throw new GitHubError(res.status, msg)
  }
  return res
}

export interface GhUser {
  login: string
  avatar_url: string
  name: string | null
}

export interface GhRepo {
  name: string
  full_name: string
  private: boolean
  default_branch: string
  permissions?: { push?: boolean }
}

export async function getCurrentUser(token: string): Promise<GhUser> {
  const res = await ghApiFetch('/user', token)
  return (await res.json()) as GhUser
}

export async function getRepo(token: string, owner: string, repo: string): Promise<GhRepo> {
  const res = await ghApiFetch(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    token
  )
  return (await res.json()) as GhRepo
}

/** 验证登录：校验 Token 身份 + 仓库可访问 */
export async function verifyLogin(
  token: string,
  owner: string,
  repo: string
): Promise<{ user: GhUser; repo: GhRepo }> {
  const user = await getCurrentUser(token)
  const repoInfo = await getRepo(token, owner, repo)
  return { user, repo: repoInfo }
}

/** 创建私有仓库（自动初始化「云存档」） */
export async function createRepo(token: string, name: string): Promise<GhRepo> {
  const res = await ghApiFetch('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name,
      private: true,
      description: '墨辰DarkCube云存档（自动创建）',
      auto_init: false
    })
  })
  return (await res.json()) as GhRepo
}

/** 仓库不存在则自动创建，存在则复用 */
export async function ensureRepo(token: string, owner: string, name: string): Promise<GhRepo> {
  try {
    return await getRepo(token, owner, name)
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) {
      try {
        return await createRepo(token, name)
      } catch (e2) {
        if (e2 instanceof GitHubError && e2.status === 422) {
          throw new Error(`仓库「${name}」已存在但无法访问，或创建失败：请更换仓库名或检查 Token 权限`)
        }
        throw e2
      }
    }
    throw e
  }
}

/** 把 GitHubError 转成用户可读的中文提示 */
export function friendlyGitHubError(e: unknown): string {
  if (e instanceof GitHubError) {
    switch (e.status) {
      case 400:
        return '请求参数错误，请检查输入'
      case 401:
        return 'Token 无效或已过期，请重新生成后输入'
      case 403:
        return '访问被拒绝：请检查 Token 是否勾选「Contents 读写」权限'
      case 404:
        return '仓库不存在，或该 Token 没有访问此仓库的权限'
      case 409:
        return '请求冲突：仓库为空或状态异常，请稍后重试'
      case 422:
        return '请求无效（422）：文件或仓库已存在，或仓库状态异常，请重试'
      default:
        return e.message
    }
  }
  if (e instanceof TypeError) {
    return '网络连接失败，请检查网络后重试'
  }
  return e instanceof Error ? e.message : '发生未知错误'
}
