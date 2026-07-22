import { X, FileText, ExternalLink, Clock } from 'lucide-react';
import { Button, Badge } from '../ui';

/**
 * Slide-in detail drawer for viewing full applicant details, updating status, and adding recruiter notes.
 */
export default function ApplicantDetail({
  application,
  onClose,
  onUpdateStatus,
  recruiterNote,
  setRecruiterNote,
  onAddNoteSubmit,
  submittingNote,
}) {
  if (!application) return null;

  const candidateName =
    application.candidateId?.firstName && application.candidateId?.lastName
      ? `${application.candidateId.firstName} ${application.candidateId.lastName}`
      : application.candidateId?.email?.split('@')[0] || 'Applicant';

  const statuses = ['applied', 'screening', 'interviewing', 'offered', 'rejected', 'withdrawn'];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3>{candidateName}</h3>
            <p className="job-company">{application.candidateId?.email}</p>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close detail panel"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Status changer */}
          <section className="detail-section">
            <h4>Application Stage</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateStatus(application._id, status)}
                  className={`btn btn-sm ${application.status === status ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          {/* Resume link */}
          {application.resumeUrl && (
            <section className="detail-section">
              <h4>Submitted Resume</h4>
              <div className="resume-info-pill" style={{ marginTop: '8px' }}>
                <FileText size={16} />
                <a href={application.resumeUrl} target="_blank" rel="noreferrer">
                  View PDF Resume <ExternalLink size={12} />
                </a>
              </div>
            </section>
          )}

          {/* Cover letter */}
          {application.coverLetter && (
            <section className="detail-section">
              <h4>Cover Letter</h4>
              <p className="detail-description" style={{ whiteSpace: 'pre-line' }}>
                {application.coverLetter}
              </p>
            </section>
          )}

          {/* Timeline history */}
          {application.statusTimeline?.length > 0 && (
            <section className="detail-section">
              <h4>Status Timeline History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {application.statusTimeline.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '13px',
                      padding: '8px 12px',
                      background: 'var(--color-bg)',
                      borderRadius: '8px',
                    }}
                  >
                    <Badge variant={`status-${item.status}`}>{item.status}</Badge>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                      {new Date(item.updatedAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recruiter Notes */}
          <section className="detail-section">
            <h4>Recruiter Internal Notes</h4>
            {application.recruiterNotes?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {application.recruiterNotes.map((n, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--color-bg)',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border)',
                      fontSize: '13px',
                    }}
                  >
                    <p style={{ margin: '0 0 4px' }}>{n.note}</p>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      <Clock size={10} /> {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={onAddNoteSubmit}>
              <div className="form-group">
                <textarea
                  rows={3}
                  value={recruiterNote}
                  onChange={(e) => setRecruiterNote(e.target.value)}
                  placeholder="Add private evaluation notes for this applicant..."
                />
              </div>
              <Button type="submit" variant="primary" size="sm" loading={submittingNote}>
                Add Note
              </Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
