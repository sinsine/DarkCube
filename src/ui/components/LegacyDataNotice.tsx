import { t } from '../../core/i18n'

interface LegacyDataNoticeProps {
  open: boolean
  /** 检测到的旧版数据目录 */
  path: string
  onClose: () => void
}

/** 旧版本数据迁移提示：Electron 版 / v1.5.0 轻量版的数据无法被本版直接读取 */
export function LegacyDataNotice({ open, path, onClose }: LegacyDataNoticeProps) {
  if (!open) return null
  return (
    <div className="dialog-mask" onClick={onClose} role="presentation">
      <div
        className="dialog glass-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t('legacy.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">{t('legacy.title')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              {t('legacy.sub')}
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label={t('dialog.close')}>
            ×
          </button>
        </div>

        <div className="delete-dialog__body">
          {t('legacy.desc')}
          <ol className="legacy-steps">
            <li>{t('legacy.step1')}</li>
            <li>{t('legacy.step2')}</li>
          </ol>
          {path && <div className="legacy-path">{path}</div>}
        </div>

        <div className="delete-dialog__actions">
          <button className="btn btn--primary" onClick={onClose}>
            {t('legacy.gotIt')}
          </button>
        </div>
      </div>
    </div>
  )
}
