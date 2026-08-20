import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

/** Markdown → 安全 HTML（DOMPurify 消毒，防注入） */
export function renderMarkdown(src: string): string {
  const html = marked.parse(src, { async: false }) as string
  return DOMPurify.sanitize(html)
}

/** 从正文提取标题：取首个 # 一级标题；无则返回空串 */
export function deriveTitle(body: string): string {
  for (const line of body.split('\n')) {
    const m = line.match(/^#\s+(.+?)\s*$/)
    if (m) return m[1].trim()
  }
  return ''
}

/** 字数统计：中文按字计，英文/数字按词计 */
export function countWords(s: string): number {
  const cjk = (s.match(/[\u3400-\u9fff]/g) ?? []).length
  const words = (s.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length
  return cjk + words
}
