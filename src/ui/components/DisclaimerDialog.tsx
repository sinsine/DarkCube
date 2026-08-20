import disclaimerZhCN from '../../../docs/disclaimer.md?raw'
import disclaimerZhTW from '../../../docs/disclaimer.zh-TW.md?raw'
import disclaimerEn from '../../../docs/disclaimer.en.md?raw'
import disclaimerJa from '../../../docs/disclaimer.ja.md?raw'
import { getLang, t } from '../../core/i18n'
import { renderMarkdown } from '../../core/markdown'

interface DisclaimerDialogProps {
  open: boolean
  onClose: () => void
}

const DISCLAIMER: Record<string, string> = {
  'zh-CN': disclaimerZhCN,
  'zh-TW': disclaimerZhTW,
  en: disclaimerEn,
  ja: disclaimerJa
}

/** 免责声明弹窗（按语言切换文档） */
export function DisclaimerDialog({ open, onClose }: DisclaimerDialogProps) {
  if (!open) return null
  const content = DISCLAIMER[getLang()] ?? disclaimerZhCN
  return (
    <div className="dialog-mask" onClick={onClose} role="presentation">
      <div
        className="dialog glass-panel tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('dialog.disclaimer')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">{t('dialog.disclaimer')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              {t('dialog.disclaimerSub')}
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label={t('dialog.close')}>
            ×
          </button>
        </div>
        <div
          className="tutorial-body md-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </div>
    </div>
  )
}
