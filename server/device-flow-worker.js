// 墨辰日记 · Device Flow 中转（Cloudflare Worker，免费版即可）
//
// GitHub 出于安全原因不允许浏览器直连 device flow 接口（无 CORS 头），
// 本 Worker 仅做两个端点的透传转发，不存储任何数据。
//
// 部署：https://dash.cloudflare.com → Workers & Pages → 创建 Worker →
// 粘贴本文件内容 → 部署 → 复制生成的 worker 地址（如 https://xxx.workers.dev）
// 填入应用「设置 → 网页登录（OAuth）→ 中转地址」。
//
// 注意：中转地址是公开的，任何拿到地址的人都能用它发起 device flow，
// 但最终授权仍需账号本人确认，无 Token 泄露风险。

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() })
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405)
    }

    let body = {}
    try {
      body = await request.json()
    } catch {
      /* 非法请求体 */
    }

    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '')

    if (path.endsWith('/device-code')) {
      const params = new URLSearchParams({ client_id: body.client_id ?? '' })
      if (body.scope) params.set('scope', body.scope)
      const res = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })
      return json(await res.json(), res.status)
    }

    if (path.endsWith('/token')) {
      const params = new URLSearchParams({
        client_id: body.client_id ?? '',
        device_code: body.device_code ?? '',
        grant_type: body.grant_type ?? ''
      })
      if (body.client_secret) params.set('client_secret', body.client_secret)
      const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      })
      return json(await res.json(), res.status)
    }

    return json({ error: 'not_found' }, 404)
  }
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(), 'Content-Type': 'application/json' }
  })
}
