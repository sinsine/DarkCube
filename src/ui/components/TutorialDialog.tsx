import tutorialZhCN from '../../../docs/login-tutorial.md?raw'
import tutorialZhTW from '../../../docs/login-tutorial.zh-TW.md?raw'
import tutorialEn from '../../../docs/login-tutorial.en.md?raw'
import tutorialJa from '../../../docs/login-tutorial.ja.md?raw'
import { getLang, t } from '../../core/i18n'
import { renderMarkdown } from '../../core/markdown'

interface TutorialDialogProps {
  open: boolean
  onClose: () => void
}

const TUTORIAL: Record<string, string> = {
  'zh-CN': tutorialZhCN,
  'zh-TW': tutorialZhTW,
  en: tutorialEn,
  ja: tutorialJa
}

/** 面向小白的 GitHub 登录教程弹窗（按语言切换文档） */
export function TutorialDialog({ open, onClose }: TutorialDialogProps) {
  if (!open) return null
  const content = TUTORIAL[getLang()] ?? tutorialZhCN
  return (
    <div className="dialog-mask" onClick={onClose} role="presentation">
      <div
        className="dialog glass-panel tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t('dialog.tutorial')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">{t('dialog.tutorial')}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              {t('dialog.tutorialSub')}
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
