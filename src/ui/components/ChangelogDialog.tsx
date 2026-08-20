import { CHANGELOG } from '../../core/changelog'
import { releaseUrl } from '../../core/update'

interface ChangelogDialogProps {
  open: boolean
  onClose: () => void
}

/** 历史更新日志弹窗：各版本说明 + 直达 Releases */
export function ChangelogDialog({ open, onClose }: ChangelogDialogProps) {
  if (!open) return null
  return (
    <div className="dialog-mask" onClick={onClose} role="presentation">
      <div
        className="dialog glass-panel tutorial-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="历史更新日志"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__head">
          <div>
            <div className="dialog__title">历史更新日志</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>
              点击版本号可直达该版本的 Releases 页面
            </div>
          </div>
          <button className="dialog__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="tutorial-body changelog-body">
          {CHANGELOG.map((entry) => (
            <section key={entry.tag} className="changelog-entry">
              <div className="changelog-entry__head">
                <a
                  className="changelog-entry__version"
                  href={releaseUrl(entry.tag)}
                  target="_blank"
                  rel="noreferrer"
                >
                  v{entry.version}
                </a>
                <span className="changelog-entry__date">{entry.date}</span>
                <a
                  className="changelog-entry__link"
                  href={releaseUrl(entry.tag)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Releases ↗
                </a>
              </div>
              <ul className="changelog-entry__notes">
                {entry.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
