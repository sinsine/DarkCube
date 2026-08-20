import { useRef, useState } from 'react'
import type { DiaryEntry } from '../../core/types'
import { firstSentence } from '../../core/markdown'
import { metaBy, MOOD_OPTIONS, WEATHER_OPTIONS } from '../../core/meta'
import { formatWeekday, getLang, t } from '../../core/i18n'

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

/** YYYY-MM-DD → 语言化的「月 日」 */
function dayLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  const lang = getLang()
  if (lang === 'en') {
    return new Date(Number(date.slice(0, 4)), m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
  if (lang === 'ja') return `${m}月${d}日`
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

/** 单条时间线卡片：左滑露出删除按钮（纵向滚动不会误触发） */
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
  const startY = useRef<number | null>(null)

  const w = metaBy(WEATHER_OPTIONS, e.weather)
  const m = metaBy(MOOD_OPTIONS, e.mood)
  const translate = swiped ? -SWIPE_WIDTH : Math.min(0, dx)

  function onPointerDown(ev: React.PointerEvent) {
    startX.current = ev.clientX
    startY.current = ev.clientY
    // 捕获指针：拖动过程中光标移出卡片也不中断（鼠标左滑可完整拉出删除按钮）
    try {
      ev.currentTarget.setPointerCapture(ev.pointerId)
    } catch {
      /* 某些环境不支持，忽略 */
    }
  }

  function onPointerMove(ev: React.PointerEvent) {
    if (startX.current === null || startY.current === null) return
    const dxNow = ev.clientX - startX.current
    const dyNow = ev.clientY - startY.current
    // 纵向位移占优 → 判定为滚动，取消滑动（修复上下滑动误触发左滑删除）
    if (Math.abs(dyNow) > Math.abs(dxNow) * 1.2) {
      startX.current = null
      startY.current = null
      setDx(0)
      return
    }
    if (dxNow < 0) setDx(Math.max(-SWIPE_WIDTH, dxNow))
  }

  function onPointerUp(ev: React.PointerEvent) {
    if (startX.current === null) return
    const d = ev.clientX - startX.current
    startX.current = null
    startY.current = null
    setDx(0)
    if (d < -40) onSwipeOpen()
    else if (d > 40) onSwipeClose()
    try {
      ev.currentTarget.releasePointerCapture(ev.pointerId)
    } catch {
      /* ignore */
    }
  }

  function handleClick() {
    if (swiped) {
      onSwipeClose()
    } else {
      onNavigate()
    }
  }

  function handleDelete() {
    if (window.confirm(t('timeline.confirmDelete'))) {
      onDelete()
    }
  }

  return (
    <div className="timeline-item-swipe">
      <button
        className={`swipe-delete${swiped ? ' swipe-delete--open' : ''}`}
        onClick={handleDelete}
        aria-label={t('timeline.delete')}
      >
        {t('timeline.delete')}
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
            startY.current = null
            setDx(0)
          }
        }}
        onClick={handleClick}
        draggable={false}
      >
        <div className="timeline-item__date">
          <div className="timeline-item__day">{dayLabel(e.date)}</div>
          <div className="timeline-item__week">{formatWeekday(e.date)}</div>
        </div>
        <div className="timeline-item__content">
          {(w || m) && (
            <div className="timeline-item__meta">
              {w && (
                <span>
                  {w.icon} {t(`weather.${w.id}`)}
                </span>
              )}
              {m && (
                <span>
                  {m.icon} {t(`mood.${m.id}`)}
                </span>
              )}
            </div>
          )}
          <div className="timeline-item__title">
            {e.body ? firstSentence(e.body) || t('timeline.untitled') : e.title || t('timeline.untitled')}
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
            <div>{t('timeline.empty')}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{t('timeline.emptyHint')}</div>
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
          <div className="note">{t('timeline.conflicts', { n: conflictCount })}</div>
        ) : null}

        {groups.map((g) => (
          <section key={g.year} className="timeline-year">
            <div className="timeline-year__head">
              <span className="timeline-year__title">{g.year} 年</span>
              <span className="timeline-year__count">{t('timeline.count', { n: g.items.length })}</span>
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
