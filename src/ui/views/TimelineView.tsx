import type { DiaryEntry } from '../../core/types'
import { weekdayCN } from '../../core/date'
import { firstSentence } from '../../core/markdown'
import { MOOD_OPTIONS, WEATHER_OPTIONS, metaBy } from '../../core/meta'

interface TimelineViewProps {
  entries: DiaryEntry[]
  conflictCount?: number
  onOpen: (date: string) => void
}

function excerpt(body: string): string {
  const plain = body.replace(/[#>*_`~\-[\]]/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > 90 ? `${plain.slice(0, 90)}…` : plain
}

/** YYYY-MM-DD → 「1 月 15 日」 */
function dayLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${m} 月 ${d} 日`
}

interface YearGroup {
  year: string
  items: DiaryEntry[]
}

export function TimelineView({ entries, conflictCount, onOpen }: TimelineViewProps) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))

  // 按年份分组
  const groups: YearGroup[] = []
  for (const e of sorted) {
    const year = e.date.slice(0, 4)
    const last = groups[groups.length - 1]
    if (last && last.year === year) last.items.push(e)
    else groups.push({ year, items: [e] })
  }

  if (groups.length === 0 && !conflictCount) {
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

  let animIndex = 0

  return (
    <div className="view">
      <div className="timeline-wrap">
        {conflictCount ? (
          <div className="note">
            ⚠ {conflictCount} 篇冲突备份：同步时本地被远端覆盖的内容已保留为仓库中的
            .conflict.md 文件
          </div>
        ) : null}

        {groups.map((g) => (
          <section key={g.year} className="timeline-year">
            <div className="timeline-year__head">
              <span className="timeline-year__title">{g.year} 年</span>
              <span className="timeline-year__count">{g.items.length} 篇</span>
            </div>

            {g.items.map((e) => {
              const delay = Math.min(animIndex * 50, 420)
              animIndex++
              const w = metaBy(WEATHER_OPTIONS, e.weather)
              const m = metaBy(MOOD_OPTIONS, e.mood)
              return (
                <button
                  key={e.date}
                  className="timeline-item glass-panel--flat"
                  onClick={() => onOpen(e.date)}
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <div className="timeline-item__date">
                    <div className="timeline-item__day">{dayLabel(e.date)}</div>
                    <div className="timeline-item__week">{weekdayCN(e.date)}</div>
                  </div>
                  <div className="timeline-item__content">
                    {(w || m) && (
                      <div className="timeline-item__meta">
                        {w && (
                          <span>
                            {w.icon} {w.label}
                          </span>
                        )}
                        {m && (
                          <span>
                            {m.icon} {m.label}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="timeline-item__title">
                      {e.body ? firstSentence(e.body) || '（无标题）' : e.title || '（无标题）'}
                    </div>
                    {e.body && <div className="timeline-item__excerpt">{excerpt(e.body)}</div>}
                  </div>
                </button>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
