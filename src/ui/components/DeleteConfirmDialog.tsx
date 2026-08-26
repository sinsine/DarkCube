import { t } from '../../core/i18n'

interface DeleteConfirmDialogProps {
  open: boolean
  /** 待删除日记的日期（用于标题展示） */
  date?: string
  onConfirm: () => void
  onCancel: () => void
}

/** 删除日记确认弹窗：液态玻璃样式，按钮多语言适配 */
export function DeleteConfirmDialog({ open, date, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="dialog-mask" onClick={onCancel} role="presentation">
      <div
        className="dialog glass-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('dialog.deleteTitle')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">{t('dialog.deleteTitle')}</div>
            {date && (
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>{date}</div>
            )}
          </div>
          <button className="dialog__close" onClick={onCancel} aria-label={t('dialog.cancel')}>
            ×
          </button>
        </div>
        <div className="delete-dialog__body">{t('timeline.confirmDelete')}</div>
        <div className="delete-dialog__actions">
          <button className="btn" onClick={onCancel}>
            {t('dialog.cancel')}
          </button>
          <button className="btn btn--danger" onClick={onConfirm}>
            {t('dialog.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
