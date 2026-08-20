import { useEffect, useRef, useState } from 'react'
import type { DiaryEntry } from '../../core/types'
import { formatDateDot, pad2 } from '../../core/date'
import { countWords, deriveTitle, renderMarkdown, transformMarkdown, type MdOp } from '../../core/markdown'
import { db } from '../../core/db'
import { serializeContent } from '../../core/sync/frontmatter'
import { MOOD_OPTIONS, WEATHER_OPTIONS, metaBy } from '../../core/meta'
import { formatDate, t } from '../../core/i18n'
import { MarkdownToolbar } from '../components/MarkdownToolbar'

interface EditorViewProps {
  date: string
  entry: DiaryEntry | null
  /** 打开时的初始模式（时间线进入为 preview） */
  initialMode?: 'edit' | 'preview'
  onChangeDate: (date: string) => void
  /** 保存完成后通知上层刷新条目列表 */
  onEntrySaved: () => void
}

type SaveStatus = 'idle' | 'saving' | 'saved'
type Mode = 'edit' | 'preview'

const SAVE_DELAY = 600

export function EditorView({
  date,
  entry,
  initialMode,
  onChangeDate,
  onEntrySaved
}: EditorViewProps) {
  const [text, setText] = useState(entry?.body ?? '')
  const [mode, setMode] = useState<Mode>(initialMode ?? 'edit')
  const [status, setStatus] = useState<SaveStatus>(entry ? 'saved' : 'idle')
  const [dateJumpOpen, setDateJumpOpen] = useState(false)
  // 竖屏默认折叠 Markdown 工具栏
  const [mdToolbarOpen, setMdToolbarOpen] = useState(
    () => !(typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches)
  )
  const timer = useRef<number | undefined>(undefined)
  const textRef = useRef(text)
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  textRef.current = text

  // 日期变化：先立即落盘旧日期的未保存内容
  useEffect(() => {
    return () => {
      if (timer.current !== undefined) {
        clearTimeout(timer.current)
        void doSave(date, textRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  // 载入新日期的内容
  useEffect(() => {
    setText(entry?.body ?? '')
    setStatus(entry ? 'saved' : 'idle')
    setMode(initialMode ?? 'edit')
    setDateJumpOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  function handleChange(v: string) {
    setText(v)
    setStatus('saving')
    if (timer.current !== undefined) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void doSave(date, v), SAVE_DELAY)
  }

  /** 图形化工具栏：对当前选区应用 Markdown 操作并保留焦点 */
  function applyMd(op: MdOp) {
    const ta = taRef.current
    if (!ta) return
    const { value, start, end } = transformMarkdown(text, ta.selectionStart, ta.selectionEnd, op)
    setText(value)
    setStatus('saving')
    if (timer.current !== undefined) clearTimeout(timer.current)
    timer.current = window.setTimeout(() => void doSave(date, value), SAVE_DELAY)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start, end)
    })
  }

  /** 设置天气 / 心情（随正文同步：序列化为 front matter 上传） */
  async function setMeta(field: 'weather' | 'mood', value: string | undefined) {
    const base: DiaryEntry = entry ?? {
      date,
      title: deriveTitle(text),
      body: text,
      updatedAt: Date.now()
    }
    const next: DiaryEntry = { ...base, updatedAt: Date.now(), dirty: true }
    if (field === 'weather') next.weather = value
    else next.mood = value
    await db.entries.put(next)
    onEntrySaved()
  }

  async function doSave(saveDate: string, body: string) {
    timer.current = undefined
    try {
      if (body.trim() === '') {
        const exists = await db.entries.get(saveDate)
        if (exists) {
          // 若该日记曾同步过，记墓碑防止远端文件被重新拉回
          if (exists.blobSha) {
            const st = await db.syncState.get(1)
            const deleted = [...(st?.deleted ?? []).filter((d) => d !== saveDate), saveDate]
            await db.syncState.put({ ...(st ?? { id: 1 }), deleted })
          }
          await db.entries.delete(saveDate)
        }
      } else {
        await db.entries.put({
          date: saveDate,
          title: deriveTitle(body),
          body,
          updatedAt: Date.now(),
          dirty: true
        })
      }
      setStatus('saved')
      onEntrySaved()
    } catch {
      setStatus('saved')
    }
  }

  /** 预览模式：导出当前日记为 .md 文件（含 front matter，与仓库格式一致） */
  function exportMd() {
    const content = serializeContent(text, { weather: entry?.weather, mood: entry?.mood })
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${date}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function shift(delta: number) {
    const [y, m, d] = date.split('-').map(Number)
    const dt = new Date(y, m - 1, d + delta)
    onChangeDate(`${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`)
  }

  const words = countWords(text)
  const statusLabel = status === 'saving' ? t('editor.saving') : status === 'saved' ? t('editor.saved') : ''
  const w = metaBy(WEATHER_OPTIONS, entry?.weather)
  const m = metaBy(MOOD_OPTIONS, entry?.mood)

  return (
    <div className="view">
      <div className="glass-panel editor-wrap">
        <div className="editor__date">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label={t('editor.prevDay')}>
            ‹
          </button>
          <span className="editor__date-text">{formatDate(date)}</span>
          <span className="editor__date-short">{formatDateDot(date)}</span>
          <button className="icon-btn" onClick={() => shift(1)} aria-label={t('editor.nextDay')}>
            ›
          </button>
          <button
            className="icon-btn"
            onClick={() => setDateJumpOpen((v) => !v)}
            title={t('editor.jumpDate')}
            aria-label={t('editor.jumpDate')}
          >
            📅
          </button>
          <span style={{ flex: 1 }} />
          {entry ? (
            <span className="chip editor__status-chip">
              <span className="chip__dot chip__dot--on" />
              {t('editor.hasEntry')}
            </span>
          ) : (
            <span className="chip editor__status-chip">
              <span className="chip__dot" />
              {t('editor.newEntry')}
            </span>
          )}
        </div>

        {dateJumpOpen && (
          <div className="editor__jump-row">
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => {
                if (e.target.value) onChangeDate(e.target.value)
                setDateJumpOpen(false)
              }}
              aria-label={t('editor.jumpDate')}
            />
          </div>
        )}

        {mode === 'edit' ? (
          <div className="editor__meta-row">
            <div className="meta-group">
              <span className="meta-group__label">{t('editor.weather')}</span>
              <div className="meta-group__scroll">
                {WEATHER_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    className={`meta-chip${entry?.weather === o.id ? ' meta-chip--active' : ''}`}
                    onClick={() => void setMeta('weather', entry?.weather === o.id ? undefined : o.id)}
                    title={t(`weather.${o.id}`)}
                    aria-pressed={entry?.weather === o.id}
                  >
                    <span aria-hidden="true">{o.icon}</span>
                    <span className="meta-chip__label">{t(`weather.${o.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="meta-group">
              <span className="meta-group__label">{t('editor.mood')}</span>
              <div className="meta-group__scroll">
                {MOOD_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    className={`meta-chip${entry?.mood === o.id ? ' meta-chip--active' : ''}`}
                    onClick={() => void setMeta('mood', entry?.mood === o.id ? undefined : o.id)}
                    title={t(`mood.${o.id}`)}
                    aria-pressed={entry?.mood === o.id}
                  >
                    <span aria-hidden="true">{o.icon}</span>
                    <span className="meta-chip__label">{t(`mood.${o.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : entry?.weather || entry?.mood ? (
          // 预览模式：只读展示已选中的天气/心情；未选择则整行隐藏
          <div className="editor__meta-readonly">
            {w && (
              <span className="meta-readonly-chip">
                {w.icon} {t(`weather.${w.id}`)}
              </span>
            )}
            {m && (
              <span className="meta-readonly-chip">
                {m.icon} {t(`mood.${m.id}`)}
              </span>
            )}
          </div>
        ) : null}

        <div className="editor__toolbar">
          <div className="seg" role="tablist" aria-label={t('editor.edit')}>
            <button
              className={`seg__item${mode === 'edit' ? ' seg__item--active' : ''}`}
              onClick={() => setMode('edit')}
            >
              {t('editor.edit')}
            </button>
            <button
              className={`seg__item${mode === 'preview' ? ' seg__item--active' : ''}`}
              onClick={() => setMode('preview')}
            >
              {t('editor.preview')}
            </button>
          </div>
          <span style={{ flex: 1 }} />
          {mode === 'preview' && text.trim() !== '' && (
            <button className="btn btn--sm" onClick={exportMd} title={t('editor.exportMd')}>
              {t('editor.exportMd')}
            </button>
          )}
          {words > 0 && <span className="editor__meta">{t('editor.words', { n: words })}</span>}
          {statusLabel && (
            <span className={`editor__status${status === 'saving' ? ' editor__status--busy' : ''}`}>
              {statusLabel}
            </span>
          )}
        </div>

        {mode === 'edit' && (
          <div className="md-toolbar-wrap">
            <button
              className="md-toolbar-toggle"
              onClick={() => setMdToolbarOpen((v) => !v)}
              aria-expanded={mdToolbarOpen}
            >
              {mdToolbarOpen ? t('editor.collapseToolbar') : t('editor.expandToolbar')}
            </button>
            {mdToolbarOpen && <MarkdownToolbar onApply={applyMd} />}
          </div>
        )}

        {mode === 'edit' ? (
          <textarea
            ref={taRef}
            className="editor__body"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={t('editor.placeholder')}
            spellCheck={false}
          />
        ) : (
          <div
            className="editor__preview md-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
          />
        )}

        {text.trim() === '' && <div className="note">{t('editor.note')}</div>}
      </div>
    </div>
  )
}
