import { t } from '../../core/i18n'

interface UpdateDialogProps {
  open: boolean
  version: string
  onGo: () => void
  onLater: () => void
  onDismiss: () => void
}

/** 发现新版本弹窗：前往 Releases / 稍后再说 / 不再提醒（此版本） */
export function UpdateDialog({ open, version, onGo, onLater, onDismiss }: UpdateDialogProps) {
  if (!open) return null
  return (
    <div className="dialog-mask" role="presentation">
      <div
        className="dialog glass-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('update.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">{t('update.title')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              {t('update.subtitle', { v: version })}
            </div>
          </div>
        </div>
        <div className="note">{t('update.desc', { v: version })}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
          <button className="btn btn--primary btn--block" onClick={onGo}>
            {t('update.go')}
          </button>
          <button className="btn btn--block" onClick={onLater}>
            {t('update.later')}
          </button>
          <button className="btn btn--block" onClick={onDismiss}>
            {t('update.dismiss')}
          </button>
        </div>
      </div>
    </div>
  )
}
