export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** 本地时区的今天，YYYY-MM-DD */
export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** YYYY-MM-DD → 「2025 年 1 月 15 日」 */
export function formatDateCN(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${y} 年 ${m} 月 ${d} 日`
}

/** YYYY-MM-DD → 「周五」等中文星期 */
export function weekdayCN(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const w = new Date(y, m - 1, d).getDay()
  return `周${'日一二三四五六'[w]}`
}

/** 月历标题 */
export function monthTitle(year: number, month: number): string {
  return `${year} 年 ${month} 月`
}

export interface MonthGrid {
  year: number
  month: number
  /** 每格日期字符串，空字符串表示占位 */
  cells: string[]
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

/** 生成某月月历格子（周一为首列） */
export function buildMonthGrid(year: number, month: number): MonthGrid {
  const first = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const lead = (first.getDay() + 6) % 7 // 周一为首列
  const cells: string[] = []
  for (let i = 0; i < lead; i++) cells.push('')
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${pad2(month)}-${pad2(d)}`)
  }
  while (cells.length % 7 !== 0) cells.push('')
  return { year, month, cells }
}

export { WEEKDAYS }
