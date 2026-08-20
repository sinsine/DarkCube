import { useRef, useState } from 'react'
import type { DiaryEntry } from '../../core/types'
import { weekdayCN } from '../../core/date'
import { firstSentence } from '../../core/markdown'
import { MOOD_OPTIONS, WEATHER_OPTIONS, metaBy } from '../../core/meta'

interface TimelineViewProps {
  entries: DiaryEntry[]
  conflictCount?: number
  onOpen: (date: string) => void
  /** 删除日记（本地 + 云端） */
  onDelete: (date: string) => void
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

const SWIPE_WIDTH = 80

interface TimelineItemProps {
  entry: DiaryEntry
  swiped: boolean
  animDelay: number
  onSwipeOpen: () => void
  onSwipeClose: () => void
  onNavigate: () => void
  onDelete: () => void
}

/** 单条时间线卡片：左滑露出删除按钮 */
function TimelineItem({
  entry: e,
  swiped,
  animDelay,
  onSwipeOpen,
  onSwipeClose,
  onNavigate,
  onDelete
}: TimelineItemProps) {
  const [dx, setDx] = useState(0)
  const startX = useRef<number | null>(null)

  const w = metaBy(WEATHER_OPTIONS, e.weather)
  const m = metaBy(MOOD_OPTIONS, e.mood)
  const translate = swiped ? -SWIPE_WIDTH : Math.min(0, dx)

  function onPointerDown(ev: React.PointerEvent) {
    startX.current = ev.clientX
  }

  function onPointerMove(ev: React.PointerEvent) {
    if (startX.current === null) return
    const d = ev.clientX - startX.current
    if (d < 0) setDx(Math.max(-SWIPE_WIDTH, d))
  }

  function onPointerUp(ev: React.PointerEvent) {
    if (startX.current === null) return
    const d = ev.clientX - startX.current
    startX.current = null
    setDx(0)
    if (d < -40) onSwipeOpen()
    else if (d > 40) onSwipeClose()
  }

  function handleClick() {
    if (swiped) {
      onSwipeClose()
    } else {
      onNavigate()
    }
  }

  function handleDelete() {
    if (window.confirm('确定删除这篇日记？此操作会同步删除云端备份，且不可恢复。')) {
      onDelete()
    }
  }

  return (
    <div className="timeline-item-swipe">
      <button
        className={`swipe-delete${swiped ? ' swipe-delete--open' : ''}`}
        onClick={handleDelete}
        aria-label="删除日记"
      >
        删除
      </button>
      <button
        className={`timeline-item glass-panel--flat${swiped ? ' timeline-item--swiped' : ''}`}
        style={{
          transform: `translateX(${translate}px)`,
          animationDelay: `${animDelay}ms`
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => {
          if (startX.current !== null) {
            startX.current = null
            setDx(0)
          }
        }}
        onClick={handleClick}
        draggable={false}
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
    </div>
  )
}

export function TimelineView({ entries, conflictCount, onOpen, onDelete }: TimelineViewProps) {
  const [swipedDate, setSwipedDate] = useState<string | null>(null)
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
              return (
                <TimelineItem
                  key={e.date}
                  entry={e}
                  swiped={swipedDate === e.date}
                  animDelay={delay}
                  onSwipeOpen={() => setSwipedDate(e.date)}
                  onSwipeClose={() => setSwipedDate(null)}
                  onNavigate={() => onOpen(e.date)}
                  onDelete={() => onDelete(e.date)}
                />
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
