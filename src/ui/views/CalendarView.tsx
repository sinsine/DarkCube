import { useEffect, useMemo, useRef, useState } from 'react'
import type { DiaryEntry } from '../../core/types'
import { buildMonthGrid, todayStr } from '../../core/date'
import { firstSentence } from '../../core/markdown'
import { formatMonth, formatDate, getLang, t } from '../../core/i18n'

interface CalendarViewProps {
  entries: DiaryEntry[]
  selectedDate: string
  onPickDate: (date: string) => void
  /** 打开某篇日记（预览模式，例如「那年今天」） */
  onOpenPreview?: (date: string) => void
}

// 会话内记住上次浏览的月份（离开视图再回来时保持）
let savedCursor: { year: number; month: number } | null = null

function todayCursor(): { year: number; month: number } {
  const t = todayStr().split('-').map(Number)
  return { year: t[0], month: t[1] }
}

export function CalendarView({ entries, selectedDate, onPickDate, onOpenPreview }: CalendarViewProps) {
  const today = todayStr()
  const [cursor, setCursor] = useState<{ year: number; month: number }>(() => savedCursor ?? todayCursor())

  // 滑动翻页手势 + 左右滑动动画
  const gridRef = useRef<HTMLDivElement | null>(null)
  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)
  const animTimer = useRef<number | undefined>(undefined)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  // 滑动翻页后不再播放渐显动画（只保留滑动过渡）；
  // 通过「在挂载时一次性决定」避免动画类中途切换导致的二次播放
  const [suppressAnim, setSuppressAnim] = useState(false)

  useEffect(() => {
    return () => {
      if (animTimer.current !== undefined) clearTimeout(animTimer.current)
    }
  }, [])

  const grid = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor])
  const hasEntry = useMemo(() => new Set(entries.map((e) => e.date)), [entries])

  /** 那年今天：往年同月同日的一篇日记（多篇时随机挑一年） */
  const onThisDay = useMemo(() => {
    const todayYear = Number(today.slice(0, 4))
    const md = today.slice(5) // MM-DD
    const past = entries.filter(
      (e) => e.date.slice(5) === md && Number(e.date.slice(0, 4)) < todayYear
    )
    if (past.length === 0) return null
    const pick = past[Math.floor(Math.random() * past.length)]
    return { pick, yearsAgo: todayYear - Number(pick.date.slice(0, 4)) }
  }, [entries, today])

  /** 切换月份：按钮导航恢复渐显动画；滑动翻页会在之后覆盖为抑制 */
  function move(delta: number) {
    setSuppressAnim(false)
    setCursor((c) => {
      const d = new Date(c.year, c.month - 1 + delta, 1)
      const next = { year: d.getFullYear(), month: d.getMonth() + 1 }
      savedCursor = next
      return next
    })
  }

  function backToToday() {
    setSuppressAnim(false)
    const next = todayCursor()
    savedCursor = next
    setCursor(next)
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
        // 覆盖 move 的恢复：滑动翻页的新月份只做滑动过渡，不播放渐显动画
        setSuppressAnim(true)
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
          <div className="calendar__title">{formatMonth(grid.year, grid.month)}</div>
          <div className="calendar__nav">
            <button className="icon-btn" onClick={() => move(-12)} aria-label={t('calendar.prevYear')} title={t('calendar.prevYear')}>
              ‹‹
            </button>
            <button className="icon-btn" onClick={() => move(-1)} aria-label={t('calendar.prevMonth')}>
              ‹
            </button>
            <button className="icon-btn" onClick={backToToday} aria-label={t('calendar.today')} title={t('calendar.today')}>
              {t('calendar.todayBtn')}
            </button>
            <button className="icon-btn" onClick={() => move(1)} aria-label={t('calendar.nextMonth')}>
              ›
            </button>
            <button className="icon-btn" onClick={() => move(12)} aria-label={t('calendar.nextYear')} title={t('calendar.nextYear')}>
              ››
            </button>
          </div>
        </div>

        <div className="calendar__weekdays">
          {weekdayHeaders.map((w) => (
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
                title={formatDate(date)}
                style={{ animationDelay: `${Math.min(i * 15, 320)}ms` }}
              >
                <span>{Number(date.slice(8, 10))}</span>
                {hasEntry.has(date) && <span className="day-dot" />}
              </button>
            )
          })}
        </div>

        {onThisDay && (
          <button
            className="on-this-day glass-panel--flat"
            onClick={() => (onOpenPreview ? onOpenPreview(onThisDay.pick.date) : onPickDate(onThisDay.pick.date))}
            title={formatDate(onThisDay.pick.date)}
          >
            <div className="on-this-day__head">
              <span className="on-this-day__badge">
                {t('calendar.onThisDay')} · {t('calendar.yearsAgo', { n: onThisDay.yearsAgo })}
              </span>
              <span className="on-this-day__arrow">→</span>
            </div>
            <div className="on-this-day__title">
              {onThisDay.pick.body
                ? firstSentence(onThisDay.pick.body) || t('timeline.untitled')
                : onThisDay.pick.title || t('timeline.untitled')}
            </div>
            {onThisDay.pick.body && (
              <div className="on-this-day__excerpt">
                {onThisDay.pick.body.replace(/[#>*_`~\-[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70)}
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

/** 星期表头（按语言） */
const weekdayHeaders: string[] = (() => {
  const lang = getLang()
  if (lang === 'en') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  if (lang === 'ja') return ['月', '火', '水', '木', '金', '土', '日']
  return ['一', '二', '三', '四', '五', '六', '日']
})()
