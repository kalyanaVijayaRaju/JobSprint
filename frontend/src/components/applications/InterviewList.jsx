import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle2, XCircle, AlertCircle, Edit3 } from 'lucide-react';
import { Badge, Button } from '../ui';

const RESPONSE_STATUS_BADGES = {
  pending: { variant: 'warning', label: 'Pending Response' },
  accepted: { variant: 'success', label: 'Accepted' },
  declined: { variant: 'error', label: 'Declined' },
  needs_reschedule: { variant: 'info', label: 'Requested Reschedule' },
};

/**
 * Renders a list/timeline of interviews scheduled for an application.
 * Candidate view includes Accept / Decline / Request Reschedule buttons.
 * Recruiter view includes Reschedule / Edit options.
 */
export default function InterviewList({
  interviews = [],
  userRole,
  onRespond,
  onEditInterview,
  submittingResponseId = null
}) {
  const [respondingId, setRespondingId] = useState(null);
  const [candidateNotes, setCandidateNotes] = useState('');
  const [responseAction, setResponseAction] = useState(null);

  if (!interviews || interviews.length === 0) {
    return (
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontStyle: 'italic', padding: '12px 0' }}>
        No interviews scheduled yet.
      </div>
    );
  }

  const handleActionClick = (interviewId, action) => {
    setRespondingId(interviewId);
    setResponseAction(action);
    if (action === 'accepted') {
      onRespond(interviewId, 'accepted', '');
      setRespondingId(null);
      setResponseAction(null);
    }
  };

  const handleResponseSubmit = (e, interviewId) => {
    e.preventDefault();
    if (!responseAction) return;
    onRespond(interviewId, responseAction, candidateNotes);
    setRespondingId(null);
    setResponseAction(null);
    setCandidateNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {interviews.map((interview) => {
        const dateObj = new Date(interview.scheduledAt);
        const statusMeta = RESPONSE_STATUS_BADGES[interview.candidateResponseStatus] || {
          variant: 'info',
          label: interview.candidateResponseStatus
        };

        return (
          <div
            key={interview._id || interview.scheduledAt}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px',
              background: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Video size={18} />
                </div>
                <div>
                  <strong style={{ fontSize: '15px', textTransform: 'capitalize' }}>
                    {interview.type} Interview
                  </strong>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {interview.durationMinutes} mins duration
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                {userRole === 'recruiter' && onEditInterview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Edit3 size={14} />}
                    onClick={() => onEditInterview(interview)}
                    title="Reschedule / Edit"
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--color-text)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} style={{ color: 'var(--color-primary)' }} />
                {dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} style={{ color: 'var(--color-primary)' }} />
                {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {interview.locationOrLink && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                  {interview.locationOrLink.startsWith('http') ? (
                    <a href={interview.locationOrLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                      Join Meeting Link
                    </a>
                  ) : (
                    interview.locationOrLink
                  )}
                </span>
              )}
            </div>

            {interview.notes && (
              <div style={{ fontSize: '13px', background: 'var(--color-bg)', padding: '10px 12px', borderRadius: '6px', color: 'var(--color-text-secondary)' }}>
                <strong>Recruiter Notes:</strong> {interview.notes}
              </div>
            )}

            {/* Candidate Action Row */}
            {userRole === 'candidate' && interview.candidateResponseStatus === 'pending' && (
              <div style={{ marginTop: '4px' }}>
                {respondingId === interview._id && responseAction !== 'accepted' ? (
                  <form onSubmit={(e) => handleResponseSubmit(e, interview._id)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      className="form-textarea"
                      rows={2}
                      placeholder={responseAction === 'declined' ? 'Reason for declining (optional)...' : 'Preferred alternate dates/times...'}
                      value={candidateNotes}
                      onChange={(e) => setCandidateNotes(e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button variant="outline" size="sm" type="button" onClick={() => setRespondingId(null)}>
                        Cancel
                      </Button>
                      <Button variant={responseAction === 'declined' ? 'danger' : 'primary'} size="sm" type="submit" loading={submittingResponseId === interview._id}>
                        Submit {responseAction === 'declined' ? 'Decline' : 'Request'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 size={14} />}
                      onClick={() => handleActionClick(interview._id, 'accepted')}
                      loading={submittingResponseId === interview._id}
                    >
                      Accept Invite
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<AlertCircle size={14} />}
                      onClick={() => handleActionClick(interview._id, 'needs_reschedule')}
                    >
                      Request Reschedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<XCircle size={14} />}
                      style={{ color: 'var(--color-error)' }}
                      onClick={() => handleActionClick(interview._id, 'declined')}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
