import type { MdOp } from '../../core/markdown'

interface MarkdownToolbarProps {
  onApply: (op: MdOp) => void
}

const TOOLS: { id: MdOp; label: string; title: string }[] = [
  { id: 'h1', label: 'H1', title: '一级标题' },
  { id: 'h2', label: 'H2', title: '二级标题' },
  { id: 'h3', label: 'H3', title: '三级标题' },
  { id: 'bold', label: 'B', title: '加粗' },
  { id: 'italic', label: 'I', title: '斜体' },
  { id: 'strike', label: 'S', title: '删除线' },
  { id: 'quote', label: '❝', title: '引用' },
  { id: 'ul', label: '•', title: '无序列表' },
  { id: 'ol', label: '1.', title: '有序列表' },
  { id: 'task', label: '☑', title: '待办事项' },
  { id: 'code', label: '</>', title: '行内代码' },
  { id: 'codeblock', label: '{ }', title: '代码块' },
  { id: 'link', label: '🔗', title: '插入链接' },
  { id: 'hr', label: '―', title: '分割线' }
]

/** 图形化 Markdown 辅助工具栏：作用于编辑器选区 */
export function MarkdownToolbar({ onApply }: MarkdownToolbarProps) {
  return (
    <div className="md-toolbar" role="toolbar" aria-label="Markdown 格式">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className="md-btn"
          title={t.title}
          aria-label={t.title}
          // 防止按钮抢焦点，保持 textarea 选区
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onApply(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
