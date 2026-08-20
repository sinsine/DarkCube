import type { DiaryEntry } from '../../core/types'
import { formatDateCN } from '../../core/date'

interface TimelineViewProps {
  entries: DiaryEntry[]
  conflictCount?: number
  onOpen: (date: string) => void
}

function excerpt(body: string): string {
  const plain = body.replace(/[#>*_`~\-[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > 90 ? `${plain.slice(0, 90)}…` : plain
}

export function TimelineView({ entries, conflictCount, onOpen }: TimelineViewProps) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))

  if (sorted.length === 0 && !conflictCount) {
    return (
      <div className="view">
        <div className="glass-panel timeline-wrap">
          <div className="empty">
            <div className="empty__icon">墨</div>
            <div>还没有日记</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>点击「写日记」留下第一篇</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="view">
      <div className="timeline-wrap">
        {conflictCount ? (
          <div className="note">
            ⚠ {conflictCount} 篇冲突备份：同步时本地被远端覆盖的内容已保留为仓库中的
            .conflict.md 文件
          </div>
        ) : null}
        {sorted.map((e) => (
          <button
            key={e.date}
            className="timeline-item glass-panel--flat"
            onClick={() => onOpen(e.date)}
          >
            <div className="timeline-item__date">{formatDateCN(e.date)}</div>
            <div className="timeline-item__title">{e.title || '（无标题）'}</div>
            {e.body && <div className="timeline-item__excerpt">{excerpt(e.body)}</div>}
          </button>
        ))}
      </div>
    </div>
  )
}
