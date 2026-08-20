import tutorialMd from '../../../docs/login-tutorial.md?raw'
import { renderMarkdown } from '../../core/markdown'

interface TutorialDialogProps {
  open: boolean
  onClose: () => void
}

/** 面向小白的 GitHub 登录教程弹窗（内容来自 docs/login-tutorial.md） */
export function TutorialDialog({ open, onClose }: TutorialDialogProps) {
  if (!open) return null
  return (
    <div className="dialog-mask" onClick={onClose} role="presentation">
      <div
        className="dialog glass-panel tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="GitHub 登录教程"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">GitHub 登录教程（小白向）</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              从零开始，约 10 分钟完成配置
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div
          className="tutorial-body md-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(tutorialMd) }}
        />
      </div>
    </div>
  )
}
