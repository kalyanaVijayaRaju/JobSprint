import { Modal, Button } from '../ui';

/**
 * Dialog for activating or deactivating a user account with a mandatory reason.
 */
export default function StatusChangeDialog({
  isOpen,
  onClose,
  targetUser,
  isActive,
  reason,
  setReason,
  onSubmit,
  submitting,
}) {
  if (!isOpen || !targetUser) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isActive ? 'Activate' : 'Deactivate'} User Account`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={isActive ? 'primary' : 'danger'}
            onClick={onSubmit}
            loading={submitting}
            disabled={!reason.trim()}
          >
            {isActive ? 'Activate User' : 'Deactivate User'}
          </Button>
        </>
      }
    >
      <p style={{ marginBottom: '16px', color: 'var(--color-text-secondary)' }}>
        Are you sure you want to {isActive ? 'activate' : 'deactivate'}{' '}
        <strong>{targetUser.email}</strong>?
      </p>
      <div className="form-group">
        <label htmlFor="status-reason">Reason for status change *</label>
        <textarea
          id="status-reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Specify reason for audit logs..."
          required
        />
      </div>
    </Modal>
  );
}
