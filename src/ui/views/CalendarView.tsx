import { useMemo, useRef, useState } from 'react'
import type { DiaryEntry } from '../../core/types'
import { WEEKDAYS, buildMonthGrid, formatDateCN, monthTitle, todayStr } from '../../core/date'

interface CalendarViewProps {
  entries: DiaryEntry[]
  selectedDate: string
  onPickDate: (date: string) => void
}

export function CalendarView({ entries, selectedDate, onPickDate }: CalendarViewProps) {
  const today = todayStr()
  const [cursor, setCursor] = useState(() => {
    const t = today.split('-').map(Number)
    return { year: t[0], month: t[1] }
  })

  // 滑动翻页手势
  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])
  const hasEntry = useMemo(() => new Set(entries.map((e) => e.date)), [entries])

  function move(delta: number) {
    setCursor((c) => {
      const d = new Date(c.year, c.month - 1 + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() + 1 }
    })
  }

  function backToToday() {
    const t = today.split('-').map(Number)
    setCursor({ year: t[0], month: t[1] })
  }

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX
    touchY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null || touchY.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    const dy = e.changedTouches[0].clientY - touchY.current
    touchX.current = null
    touchY.current = null
    // 水平滑动且横向占优才翻页：左滑下月、右滑上月
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      move(dx < 0 ? 1 : -1)
    }
  }

  return (
    <div className="view">
      <div
        className="glass-panel calendar-wrap"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="calendar__head">
          <div className="calendar__title">{monthTitle(grid.year, grid.month)}</div>
          <div className="calendar__nav">
            <button className="icon-btn" onClick={() => move(-12)} aria-label="上一年" title="上一年">
              ‹‹
            </button>
            <button className="icon-btn" onClick={() => move(-1)} aria-label="上个月">
              ‹
            </button>
            <button className="icon-btn" onClick={backToToday} aria-label="回到今天" title="今天">
              今
            </button>
            <button className="icon-btn" onClick={() => move(1)} aria-label="下个月">
              ›
            </button>
            <button className="icon-btn" onClick={() => move(12)} aria-label="下一年" title="下一年">
              ››
            </button>
          </div>
        </div>

        <div className="calendar__weekdays">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar__weekday">
              {w}
            </div>
          ))}
        </div>

        <div className="calendar__grid">
          {grid.cells.map((date, i) => {
            if (!date) return <div key={`blank-${i}`} className="day-cell day-cell--blank" />
            const cls = [
              'day-cell',
              date === today ? ' day-cell--today' : '',
              date === selectedDate ? ' day-cell--selected' : ''
            ].join('')
            return (
              <button
                key={date}
                className={cls}
                onClick={() => onPickDate(date)}
                title={formatDateCN(date)}
                style={{ animationDelay: `${Math.min(i * 15, 320)}ms` }}
              >
                <span>{Number(date.slice(8, 10))}</span>
                {hasEntry.has(date) && <span className="day-dot" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
