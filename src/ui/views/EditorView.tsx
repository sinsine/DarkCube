import { useEffect, useRef, useState } from 'react'
import type { DiaryEntry } from '../../core/types'
import { formatDateCN, formatDateDot, pad2 } from '../../core/date'
import { countWords, deriveTitle, renderMarkdown, transformMarkdown, type MdOp } from '../../core/markdown'
import { db } from '../../core/db'
import { MOOD_OPTIONS, WEATHER_OPTIONS, metaBy } from '../../core/meta'
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

export function EditorView({ date, entry, initialMode, onChangeDate, onEntrySaved }: EditorViewProps) {
  const [text, setText] = useState(entry?.body ?? '')
  const [mode, setMode] = useState<Mode>(initialMode ?? 'edit')
  const [status, setStatus] = useState<SaveStatus>(entry ? 'saved' : 'idle')
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

  function shift(delta: number) {
    const [y, m, d] = date.split('-').map(Number)
    const dt = new Date(y, m - 1, d + delta)
    onChangeDate(`${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`)
  }

  const words = countWords(text)
  const statusLabel = status === 'saving' ? '保存中…' : status === 'saved' ? '已保存' : ''

  return (
    <div className="view">
      <div className="glass-panel editor-wrap">
        <div className="editor__date">
          <button className="icon-btn" onClick={() => shift(-1)} aria-label="前一天">
            ‹
          </button>
          <span className="editor__date-text">{formatDateCN(date)}</span>
          <span className="editor__date-short">{formatDateDot(date)}</span>
          <button className="icon-btn" onClick={() => shift(1)} aria-label="后一天">
            ›
          </button>
          <span style={{ flex: 1 }} />
          {entry ? (
            <span className="chip editor__status-chip">
              <span className="chip__dot chip__dot--on" />
              已有日记
            </span>
          ) : (
            <span className="chip editor__status-chip">
              <span className="chip__dot" />
              新日记
            </span>
          )}
        </div>

        {mode === 'edit' ? (
          <div className="editor__meta-row">
            <div className="meta-group">
              <span className="meta-group__label">天气</span>
              {WEATHER_OPTIONS.map((w) => (
                <button
                  key={w.id}
                  className={`meta-chip${entry?.weather === w.id ? ' meta-chip--active' : ''}`}
                  onClick={() => void setMeta('weather', entry?.weather === w.id ? undefined : w.id)}
                  title={w.label}
                  aria-pressed={entry?.weather === w.id}
                >
                  <span aria-hidden="true">{w.icon}</span>
                  <span className="meta-chip__label">{w.label}</span>
                </button>
              ))}
            </div>
            <div className="meta-group">
              <span className="meta-group__label">心情</span>
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  className={`meta-chip${entry?.mood === m.id ? ' meta-chip--active' : ''}`}
                  onClick={() => void setMeta('mood', entry?.mood === m.id ? undefined : m.id)}
                  title={m.label}
                  aria-pressed={entry?.mood === m.id}
                >
                  <span aria-hidden="true">{m.icon}</span>
                  <span className="meta-chip__label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (entry?.weather || entry?.mood) ? (
          // 预览模式：只读展示已选中的天气/心情；未选择则整行隐藏
          <div className="editor__meta-readonly">
            {metaBy(WEATHER_OPTIONS, entry?.weather) && (
              <span className="meta-readonly-chip">
                {metaBy(WEATHER_OPTIONS, entry?.weather)?.icon}{' '}
                {metaBy(WEATHER_OPTIONS, entry?.weather)?.label}
              </span>
            )}
            {metaBy(MOOD_OPTIONS, entry?.mood) && (
              <span className="meta-readonly-chip">
                {metaBy(MOOD_OPTIONS, entry?.mood)?.icon} {metaBy(MOOD_OPTIONS, entry?.mood)?.label}
              </span>
            )}
          </div>
        ) : null}

        <div className="editor__toolbar">
          <div className="seg" role="tablist" aria-label="编辑模式">
            <button
              className={`seg__item${mode === 'edit' ? ' seg__item--active' : ''}`}
              onClick={() => setMode('edit')}
            >
              编辑
            </button>
            <button
              className={`seg__item${mode === 'preview' ? ' seg__item--active' : ''}`}
              onClick={() => setMode('preview')}
            >
              预览
            </button>
          </div>
          <span style={{ flex: 1 }} />
          {words > 0 && <span className="editor__meta">{words} 字</span>}
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
              {mdToolbarOpen ? '收起格式栏 ▴' : '展开格式栏 ▾'}
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
            placeholder={'在这里写下今天的思绪…\n\n支持 Markdown：\n# 标题\n**加粗** · *斜体* · - 列表 · > 引用'}
            spellCheck={false}
          />
        ) : (
          <div
            className="editor__preview md-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
          />
        )}

        {text.trim() === '' && (
          <div className="note">内容将自动保存在本机（IndexedDB），登录 GitHub 后可同步到私有仓库。</div>
        )}
      </div>
    </div>
  )
}
