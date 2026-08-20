import { useEffect, useMemo, useRef, useState } from 'react'
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

  // 滑动翻页手势 + 左右滑动动画
  const gridRef = useRef<HTMLDivElement | null>(null)
  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)
  const animTimer = useRef<number | undefined>(undefined)
  const suppressTimer = useRef<number | undefined>(undefined)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  // 滑动翻页后不再播放渐显动画（只保留滑动过渡）
  const [suppressAnim, setSuppressAnim] = useState(false)

  useEffect(() => {
    return () => {
      if (animTimer.current !== undefined) clearTimeout(animTimer.current)
      if (suppressTimer.current !== undefined) clearTimeout(suppressTimer.current)
    }
  }, [])

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
    setDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchX.current === null || touchY.current === null) return
    const dx = e.touches[0].clientX - touchX.current
    const dy = e.touches[0].clientY - touchY.current
    // 横向为主时跟随手指拖动
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragX(Math.max(-260, Math.min(260, dx)))
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null || touchY.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    const dy = e.changedTouches[0].clientY - touchY.current
    touchX.current = null
    touchY.current = null
    setDragging(false)

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      const dir = dx < 0 ? 1 : -1 // 左滑→下月，右滑→上月
      const width = gridRef.current?.clientWidth ?? 320
      // 先滑出屏幕，再切换月份并反向滑入
      setDragX(dir * -width)
      animTimer.current = window.setTimeout(() => {
        move(dir)
        // 滑动翻页后：新月份只做滑动过渡，不播放渐显动画
        setSuppressAnim(true)
        if (suppressTimer.current !== undefined) clearTimeout(suppressTimer.current)
        suppressTimer.current = window.setTimeout(() => setSuppressAnim(false), 500)
        setDragging(true) // 无过渡，先放到反方向
        setDragX(dir * width)
        requestAnimationFrame(() => {
          setDragging(false)
          setDragX(0)
        })
      }, 230)
    } else {
      setDragX(0) // 回弹
    }
  }

  return (
    <div className="view">
      <div
        className="glass-panel calendar-wrap"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
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

        <div
          ref={gridRef}
          className={`calendar__grid${dragging ? ' calendar__grid--dragging' : ''}${suppressAnim ? ' calendar__grid--no-anim' : ''}`}
          style={{ transform: `translateX(${dragX}px)` }}
        >
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
