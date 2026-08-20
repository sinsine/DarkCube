/** GitHub OAuth Device Flow 客户端（经自有中转访问，绕过浏览器 CORS 限制） */

export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

/** 轮询未完成时的等待信号 */
export class PendingError extends Error {
  slowDown: boolean

  constructor(slowDown = false) {
    super('等待用户授权')
    this.name = 'PendingError'
    this.slowDown = slowDown
  }
}

function relayBase(relayUrl: string): string {
  return relayUrl.replace(/\/+$/, '')
}

/** 1. 请求设备码（经中转） */
export async function requestDeviceCode(
  relayUrl: string,
  clientId: string
): Promise<DeviceCodeResponse> {
  const res = await fetch(`${relayBase(relayUrl)}/device-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, scope: 'repo' })
  })
  if (!res.ok) {
    let msg = `请求设备码失败（${res.status}）`
    try {
      const j = (await res.json()) as { error?: string; error_description?: string }
      if (j?.error) msg = `${msg}：${j.error_description ?? j.error}`
    } catch {
      /* 忽略 */
    }
    throw new Error(msg)
  }
  return (await res.json()) as DeviceCodeResponse
}

/** 2. 轮询授权结果（经中转）；未完成抛 PendingError，成功返回 access_token */
export async function pollAccessToken(
  relayUrl: string,
  clientId: string,
  deviceCode: string,
  clientSecret?: string
): Promise<string> {
  const res = await fetch(`${relayBase(relayUrl)}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      client_secret: clientSecret || undefined
    })
  })
  if (!res.ok) {
    throw new Error(`获取访问令牌失败（${res.status}）`)
  }
  const j = (await res.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }
  if (j.access_token) return j.access_token
  switch (j.error) {
    case 'authorization_pending':
      throw new PendingError()
    case 'slow_down':
      throw new PendingError(true)
    case 'expired_token':
      throw new Error('设备码已过期，请重新开始登录')
    case 'access_denied':
      throw new Error('授权被拒绝')
    case 'incorrect_client_credentials':
      throw new Error('OAuth 应用配置有误：请检查 Client ID（及 Client Secret）')
    default:
      throw new Error(`GitHub 返回错误：${j.error_description ?? j.error ?? '未知'}`)
  }
}
