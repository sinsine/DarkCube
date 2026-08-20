/** 日记文件序列化：天气/心情以 front matter 嵌入 Markdown，随正文一同同步 */

export interface EntryMeta {
  weather?: string
  mood?: string
}

export interface ParsedEntry extends EntryMeta {
  body: string
}

/** 正文 + 元数据 → 仓库文件内容（有元数据时生成 front matter） */
export function serializeContent(body: string, meta: EntryMeta): string {
  const lines: string[] = []
  if (meta.weather || meta.mood) {
    lines.push('---')
    if (meta.weather) lines.push(`weather: ${meta.weather}`)
    if (meta.mood) lines.push(`mood: ${meta.mood}`)
    lines.push('---')
  }
  if (lines.length === 0) return body
  return `${lines.join('\n')}\n${body}`
}

/** 仓库文件内容 → 正文 + 元数据（兼容无 front matter 的旧文件） */
export function parseContent(content: string): ParsedEntry {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { body: content }
  const meta: EntryMeta = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) {
      if (kv[1] === 'weather') meta.weather = kv[2].trim()
      if (kv[1] === 'mood') meta.mood = kv[2].trim()
    }
  }
  return { body: content.slice(m[0].length), ...meta }
}
