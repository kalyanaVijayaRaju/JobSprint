import { useState } from 'react';
import {
  BriefcaseBusiness,
  Bookmark,
  MapPin,
  DollarSign,
  X,
  FileText,
  Clock,
  ExternalLink,
  CircleAlert
} from 'lucide-react';

export default function SavedJobs({
  user,
  profile,
  savedJobs,
  myApps,
  onToggleSaveJob,
  onApply,
  submittingApplication,
  setActiveTab
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  const handleApplySubmit = (e) => {
    e.preventDefault();
    onApply(selectedJob._id, coverLetter, () => {
      setSelectedJob(null);
      setCoverLetter('');
    });
  };

  return (
    <div className="tab-content">
      <div className="candidate-saved-jobs-view">
        {savedJobs.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={40} />
            <p>You haven't bookmarked any jobs yet.</p>
            <button type="button" className="btn btn-primary" onClick={() => setActiveTab('jobs')}>
              Discover Jobs
            </button>
          </div>
        ) : (
          <div className="jobs-grid">
            {savedJobs.map(item => {
              const job = item.jobId;
              if (!job) return null; // Safety check in case a job was hard-deleted from db
              
              const isApplied = myApps.some(app => (app.jobId?._id || app.jobId) === job._id);

              return (
                <article className="job-card" key={item._id}>
                  <div className="job-card-header">
                    <div>
                      <h3>{job.title}</h3>
                      <p className="job-company">{job.companyId?.name || 'Company Details'}</p>
                    </div>
                    <button
                      type="button"
                      className="bookmark-btn active"
                      onClick={() => onToggleSaveJob(job._id)}
                      aria-label="Remove bookmark"
                    >
                      <Bookmark size={18} />
                    </button>
                  </div>

                  <div className="job-tags">
                    <span className="badge job-type-badge">{job.jobType}</span>
                    <span className="badge location-badge">{job.locationType}</span>
                  </div>

                  <div className="job-metadata">
                    <div className="meta-item">
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </div>
                    {job.salaryRange && (
                      <div className="meta-item">
                        <DollarSign size={14} />
                        <span>
                          {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()} {job.salaryRange.currency}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="job-skills">
                    {job.skillsRequired?.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>

                  <div className="job-card-footer">
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                      onClick={() => setSelectedJob(job)}
                    >
                      View Details
                    </button>
                    {isApplied ? (
                      <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'default' }} disabled>
                        Applied
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => setSelectedJob(job)}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Job Detail Modal & Cover Letter Apply */}
        {selectedJob && (
          <div className="modal-backdrop">
            <div className="modal-content job-detail-modal">
              <div className="modal-header">
                <div>
                  <h3>{selectedJob.title}</h3>
                  <p className="job-company">{selectedJob.companyId?.name}</p>
                </div>
                <button type="button" onClick={() => setSelectedJob(null)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <section className="detail-meta">
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span>{selectedJob.location} ({selectedJob.locationType})</span>
                  </div>
                  <div className="meta-item">
                    <Clock size={16} />
                    <span>{selectedJob.jobType}</span>
                  </div>
                  {selectedJob.salaryRange && (
                    <div className="meta-item">
                      <DollarSign size={16} />
                      <span>
                        {selectedJob.salaryRange.min?.toLocaleString()} - {selectedJob.salaryRange.max?.toLocaleString()} {selectedJob.salaryRange.currency}
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
                  {myApps.some(app => (app.jobId?._id || app.jobId) === selectedJob._id) ? (
                    <div className="success-text" style={{ padding: '12px', background: '#ecfdf5', borderRadius: '8px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>You have already applied for this job!</span>
                    </div>
                  ) : profile?.resumeUrl ? (
                    <form onSubmit={handleApplySubmit}>
                      <div className="form-group">
                        <label htmlFor="cover-letter">Cover Letter (Optional)</label>
                        <textarea
                          id="cover-letter"
                          rows={4}
                          value={coverLetter}
                          onChange={e => setCoverLetter(e.target.value)}
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
                      <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={submittingApplication}
                      >
                        {submittingApplication ? 'Submitting Application...' : 'Submit Application'}
                      </button>
                    </form>
                  ) : (
                    <div className="resume-warning">
                      <CircleAlert size={20} />
                      <div>
                        <p>You must upload a resume before you can apply.</p>
                        <button type="button" onClick={() => { setActiveTab('profile'); setSelectedJob(null); }}>
                          Go to Profile & Upload Resume
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
