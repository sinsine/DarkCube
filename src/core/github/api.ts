/** GitHub REST API 客户端（纯浏览器，无第三方依赖） */

import { t } from '../i18n'

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
          throw new Error(t('errors.repoExists', { name }))
        }
        throw e2
      }
    }
    throw e
  }
}

/** 把 GitHubError 转成用户可读的提示（随语言） */
export function friendlyGitHubError(e: unknown): string {
  if (e instanceof GitHubError) {
    switch (e.status) {
      case 400:
        return t('errors.badRequest')
      case 401:
        return t('errors.tokenInvalid')
      case 403:
        return t('errors.forbidden')
      case 404:
        return t('errors.notFound')
      case 409:
        return t('errors.conflict409')
      case 422:
        return t('errors.invalid422')
      default:
        return e.message
    }
  }
  if (e instanceof TypeError) {
    return t('errors.network')
  }
  return e instanceof Error ? e.message : t('errors.unknown')
}
