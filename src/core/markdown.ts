import { marked } from 'marked'
import DOMPurify from 'dompurify'

marked.setOptions({ gfm: true, breaks: true })

/** Markdown → 安全 HTML（DOMPurify 消毒，防注入） */
export function renderMarkdown(src: string): string {
  const html = marked.parse(src, { async: false }) as string
  return DOMPurify.sanitize(html)
}

/** 从正文提取标题：优先首个 # 标题，否则取第一句话 */
export function deriveTitle(body: string): string {
  for (const line of body.split('\n')) {
    const m = line.match(/^#\s+(.+?)\s*$/)
    if (m) return m[1].trim()
  }
  return firstSentence(body)
}

/** 正文的第一句话（去 Markdown 符号，按句读切分，超长截断） */
export function firstSentence(body: string): string {
  const plain = body.replace(/[#>*_`~\-[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!plain) return ''
  const sentence = plain.split(/[。！？!?；;]/)[0]?.trim() ?? ''
  return sentence.length > 28 ? `${sentence.slice(0, 28)}…` : sentence
}

/** 字数统计：中文按字计，英文/数字按词计 */
export function countWords(s: string): number {
  const cjk = (s.match(/[\u3400-\u9fff]/g) ?? []).length
  const words = (s.replace(/[\u3400-\u9fff]/g, ' ').match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length
  return cjk + words
}

/* ---------- 编辑器图形化 Markdown 辅助 ---------- */

export type MdOp =
  | 'bold'
  | 'italic'
  | 'strike'
  | 'code'
  | 'link'
  | 'codeblock'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'quote'
  | 'ul'
  | 'ol'
  | 'task'
  | 'hr'

export interface MdTransform {
  value: string
  start: number
  end: number
}

/** 对选中文本应用 Markdown 操作，返回新文本与光标选区 */
export function transformMarkdown(text: string, selStart: number, selEnd: number, op: MdOp): MdTransform {
  const sel = text.slice(selStart, selEnd)

  switch (op) {
    case 'bold':
      return wrap('**', '**')
    case 'italic':
      return wrap('*', '*')
    case 'strike':
      return wrap('~~', '~~')
    case 'code':
      return wrap('`', '`')
    case 'link': {
      if (sel) {
        return {
          value: text.slice(0, selStart) + '[' + sel + '](https://)' + text.slice(selEnd),
          start: selStart + 1,
          end: selEnd + 1
        }
      }
      const v = text.slice(0, selStart) + '[链接文字](https://)' + text.slice(selEnd)
      return { value: v, start: selStart + 1, end: selStart + 5 }
    }
    case 'codeblock': {
      if (sel) {
        const before = '\n```\n'
        const after = '\n```\n'
        return {
          value: text.slice(0, selStart) + before + sel + after + text.slice(selEnd),
          start: selStart + before.length,
          end: selEnd + before.length
        }
      }
      const v = text.slice(0, selStart) + '\n```\n\n```\n' + text.slice(selEnd)
      const p = selStart + '\n```\n'.length
      return { value: v, start: p, end: p }
    }
    case 'hr': {
      const insert = '\n\n---\n\n'
      const p = selStart + insert.length
      return { value: text.slice(0, selStart) + insert + text.slice(selEnd), start: p, end: p }
    }
    case 'h1':
      return toggleLines('# ')
    case 'h2':
      return toggleLines('## ')
    case 'h3':
      return toggleLines('### ')
    case 'quote':
      return toggleLines('> ')
    case 'ul':
      return toggleLines('- ')
    case 'ol':
      return toggleLines('1. ')
    case 'task':
      return toggleLines('- [ ] ')
  }

  function wrap(before: string, after: string): MdTransform {
    if (sel) {
      return {
        value: text.slice(0, selStart) + before + sel + after + text.slice(selEnd),
        start: selStart + before.length,
        end: selEnd + before.length
      }
    }
    const p = selStart + before.length
    return { value: text.slice(0, selStart) + before + after + text.slice(selEnd), start: p, end: p }
  }

  function toggleLines(prefix: string): MdTransform {
    const lineStart = text.lastIndexOf('\n', selStart - 1) + 1
    let lineEnd = text.indexOf('\n', selEnd)
    if (lineEnd === -1) lineEnd = text.length
    const block = text.slice(lineStart, lineEnd)
    const lines = block.split('\n')
    const allPrefixed = lines.length > 0 && lines.every((l) => l.startsWith(prefix))
    const newLines = lines.map((l) => (allPrefixed ? l.slice(prefix.length) : prefix + l))
    const joined = newLines.join('\n')
    return {
      value: text.slice(0, lineStart) + joined + text.slice(lineEnd),
      start: lineStart,
      end: lineStart + joined.length
    }
  }
}
