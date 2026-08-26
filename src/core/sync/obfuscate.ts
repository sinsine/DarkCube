/** 云端混淆存储：日记内容 Base64url 编码，避免仓库中明文直读。
 *  注意：这是可逆编码（无密钥），并非加密——防「直读/爬虫」，不防有意逆向。
 *  格式：darkcube-enc:v1:<base64url(UTF-8 字节)>
 */

const PREFIX = 'darkcube-enc:v1:'

const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8')

/** UTF-8 字节 → Base64url（无 padding） */
function bytesToBase64url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Base64url → UTF-8 字节 */
function base64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const bin = atob(b64 + pad)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** 是否带混淆前缀（用于区分新旧格式） */
export function isObfuscated(payload: string): boolean {
  return payload.startsWith(PREFIX)
}

/** 明文 → 云端混淆内容 */
export function obfuscate(text: string): string {
  return PREFIX + bytesToBase64url(encoder.encode(text))
}

/** 云端内容 → 明文（兼容旧明文文件：无前缀时原样返回） */
export function deobfuscate(payload: string): string {
  if (!payload.startsWith(PREFIX)) return payload
  return decoder.decode(base64urlToBytes(payload.slice(PREFIX.length)))
}
