import { AlertTriangle } from 'lucide-react';

/**
 * Confirmation dialog replacing window.confirm() for a premium UX.
 *
 * @param {boolean} isOpen
 * @param {function} onConfirm
 * @param {function} onCancel
 * @param {string} title
 * @param {string} message
 * @param {string} confirmLabel - Text for confirm button (default: 'Confirm')
 * @param {string} cancelLabel - Text for cancel button (default: 'Cancel')
 * @param {'danger'|'warning'|'info'} variant
 */
export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) {
  if (!isOpen) return null;

  const iconColor = {
    danger: 'var(--color-error)',
    warning: 'var(--color-warning)',
    info: 'var(--color-primary)',
  }[variant] || 'var(--color-error)';

  const confirmBtnClass = {
    danger: 'btn btn-danger',
    warning: 'btn btn-primary',
    info: 'btn btn-primary',
  }[variant] || 'btn btn-danger';

  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div
        className="modal-container modal-sm"
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-body">
          <div className="confirm-dialog-icon" style={{ color: iconColor }}>
            <AlertTriangle size={32} />
          </div>
          <h3 className="confirm-dialog-title">{title}</h3>
          {message && <p className="confirm-dialog-message">{message}</p>}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={confirmBtnClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
