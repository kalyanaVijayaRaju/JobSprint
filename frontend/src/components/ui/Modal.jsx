import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible modal dialog with focus trap, Escape dismiss, and backdrop click.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {import('react').ReactNode} children
 * @param {import('react').ReactNode} footer - Optional footer actions
 * @param {'sm'|'md'|'lg'} size
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  // Focus trap and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    // Focus the dialog
    const timer = setTimeout(() => {
      dialogRef.current?.focus();
    }, 50);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);

      // Restore focus
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
  }[size] || 'modal-md';

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={`modal-container ${sizeClass} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
