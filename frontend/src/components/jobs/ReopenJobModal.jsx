import { useState } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { Modal, Button } from '../ui';

/**
 * Modal to prompt recruiters for a new future expiration date when reopening a closed job posting.
 */
export default function ReopenJobModal({ job, onClose, onReopen, submitting }) {
  // Default to 30 days from today
  const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const [expiresAt, setExpiresAt] = useState(defaultDate);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const selectedDate = new Date(expiresAt);
    if (isNaN(selectedDate.getTime()) || selectedDate <= new Date()) {
      setError('Please select a valid expiration date in the future.');
      return;
    }

    onReopen(job._id, selectedDate.toISOString());
  };

  return (
    <Modal
      isOpen={Boolean(job)}
      onClose={onClose}
      title={`Reopen "${job?.title || 'Job'}"`}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '14px' }}>
          Reopening this job posting will set its status back to <strong>Active</strong>. Please specify a new expiration date.
        </p>

        {error && (
          <div className="alert alert-error" style={{ fontSize: '13px', padding: '8px 12px' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="reopen-expires-at" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} /> New Expiration Date & Time
          </label>
          <input
            id="reopen-expires-at"
            type="datetime-local"
            className="form-input"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting} icon={<RotateCcw size={16} />}>
            Reopen Posting
          </Button>
        </div>
      </form>
    </Modal>
  );
}
