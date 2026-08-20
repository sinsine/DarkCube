import disclaimerMd from '../../../docs/disclaimer.md?raw'
import { renderMarkdown } from '../../core/markdown'

interface DisclaimerDialogProps {
  open: boolean
  onClose: () => void
}

/** 免责声明弹窗（内容来自 docs/disclaimer.md） */
export function DisclaimerDialog({ open, onClose }: DisclaimerDialogProps) {
  if (!open) return null
  return (
    <div className="dialog-mask" onClick={onClose} role="presentation">
      <div
        className="dialog glass-panel tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="免责声明"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">免责声明</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              请仔细阅读
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div
          className="tutorial-body md-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(disclaimerMd) }}
        />
      </div>
    </div>
  )
}
