import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, FileText, Video } from 'lucide-react';
import { Modal, Button } from '../ui';

const INTERVIEW_TYPES = [
  { value: 'video', label: 'Video Call (Google Meet/Zoom)' },
  { value: 'phone', label: 'Phone Screening' },
  { value: 'onsite', label: 'Onsite / In-Person' },
  { value: 'technical', label: 'Technical Assessment' },
  { value: 'culture-fit', label: 'Culture Fit / HR Round' }
];

/**
 * Modal dialog for recruiters to schedule or edit an interview session for a candidate application.
 */
export default function InterviewScheduler({
  isOpen,
  onClose,
  onSchedule,
  application,
  existingInterview = null,
  submitting = false
}) {
  const defaultDate = existingInterview
    ? new Date(existingInterview.scheduledAt).toISOString().slice(0, 16)
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [type, setType] = useState(existingInterview?.type || 'video');
  const [scheduledAt, setScheduledAt] = useState(defaultDate);
  const [durationMinutes, setDurationMinutes] = useState(existingInterview?.durationMinutes || 45);
  const [locationOrLink, setLocationOrLink] = useState(existingInterview?.locationOrLink || '');
  const [notes, setNotes] = useState(existingInterview?.notes || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingInterview) {
      setType(existingInterview.type || 'video');
      setScheduledAt(new Date(existingInterview.scheduledAt).toISOString().slice(0, 16));
      setDurationMinutes(existingInterview.durationMinutes || 45);
      setLocationOrLink(existingInterview.locationOrLink || '');
      setNotes(existingInterview.notes || '');
    }
  }, [existingInterview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
      setError('Please select a valid future date and time for the interview.');
      return;
    }

    onSchedule({
      type,
      scheduledAt: parsedDate.toISOString(),
      durationMinutes: Number(durationMinutes),
      locationOrLink: locationOrLink.trim() || undefined,
      notes: notes.trim() || undefined
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingInterview ? 'Reschedule Interview' : 'Schedule Interview'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {application && (
          <div style={{ background: 'var(--color-bg)', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
            Candidate: <strong>{application.candidateId?.email || application.candidateName || 'Applicant'}</strong>
          </div>
        )}

        {error && (
          <div className="alert alert-error" style={{ fontSize: '13px', padding: '8px 12px' }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="interview-type" className="form-label">
            Interview Type
          </label>
          <select
            id="interview-type"
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            {INTERVIEW_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group">
            <label htmlFor="interview-date" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} /> Date & Time
            </label>
            <input
              id="interview-date"
              type="datetime-local"
              className="form-input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="interview-duration" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> Duration (mins)
            </label>
            <select
              id="interview-duration"
              className="form-select"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={45}>45 mins</option>
              <option value={60}>60 mins (1 hr)</option>
              <option value={90}>90 mins (1.5 hrs)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="interview-location" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> Location / Meeting Link
          </label>
          <input
            id="interview-location"
            type="text"
            className="form-input"
            placeholder="e.g. https://meet.google.com/abc-defg-hij or Office Room 402"
            value={locationOrLink}
            onChange={(e) => setLocationOrLink(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="interview-notes" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={14} /> Notes / Instructions for Candidate
          </label>
          <textarea
            id="interview-notes"
            className="form-textarea"
            rows={3}
            placeholder="Provide any preparation details or instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={submitting} icon={<Video size={16} />}>
            {existingInterview ? 'Update Interview' : 'Send Invite'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
