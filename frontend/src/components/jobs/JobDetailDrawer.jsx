import { X, MapPin, Clock, DollarSign, FileText, ExternalLink, CircleAlert } from 'lucide-react';
import { Button, CompanyLogo } from '../ui';

/**
 * Slide-in detail drawer for viewing full job details and applying.
 */
export default function JobDetailDrawer({
  selectedJob,
  onClose,
  isApplied,
  profile,
  coverLetter,
  setCoverLetter,
  onApplySubmit,
  submittingApplication,
  onNavigateToProfile,
}) {
  if (!selectedJob) return null;

  const companyName = selectedJob.companyId?.name || selectedJob.companyName || 'Company Details';
  const companyLogo = selectedJob.companyId?.logo || selectedJob.companyLogo;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CompanyLogo logo={companyLogo} name={companyName} size={44} />
            <div>
              <h3>{selectedJob.title}</h3>
              <p className="job-company">{companyName}</p>
            </div>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          <section className="detail-meta">
            <div className="meta-item">
              <MapPin size={16} />
              <span>
                {selectedJob.location} ({selectedJob.locationType})
              </span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{selectedJob.jobType}</span>
            </div>
            {selectedJob.salaryRange && (
              <div className="meta-item">
                <DollarSign size={16} />
                <span>
                  {selectedJob.salaryRange.min?.toLocaleString()} -{' '}
                  {selectedJob.salaryRange.max?.toLocaleString()}{' '}
                  {selectedJob.salaryRange.currency}
                </span>
              </div>
            )}
          </section>

          <section className="detail-section">
            <h4>Job Description</h4>
            <p className="detail-description">{selectedJob.description}</p>
          </section>

          {selectedJob.requirements?.length > 0 && (
            <section className="detail-section">
              <h4>Requirements</h4>
              <ul>
                {selectedJob.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="detail-section apply-section">
            <h4>Apply for this role</h4>
            {isApplied ? (
              <div className="already-applied-notice" role="status">
                You have already applied for this role. Track its progress from Applications.
              </div>
            ) : profile?.resumeUrl ? (
              <form onSubmit={onApplySubmit}>
                <div className="form-group">
                  <label htmlFor="cover-letter">Cover Letter (Optional)</label>
                  <textarea
                    id="cover-letter"
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Introduce yourself and explain why you're a good fit for this role..."
                  />
                </div>
                <div className="resume-info-pill">
                  <FileText size={16} />
                  <span>Resume on file: </span>
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
                    View Resume <ExternalLink size={12} />
                  </a>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  block
                  loading={submittingApplication}
                >
                  Submit Application
                </Button>
              </form>
            ) : (
              <div className="resume-warning">
                <CircleAlert size={20} />
                <div>
                  <p>You must upload a resume before you can apply.</p>
                  <button type="button" onClick={onNavigateToProfile}>
                    Go to Profile & Upload Resume
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
