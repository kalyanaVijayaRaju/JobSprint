import { useState } from 'react';
import {
  UsersRound,
  FileText,
  Plus,
  Clock,
  Check,
  X
} from 'lucide-react';

export default function AtsPipeline({
  user,
  selectedJobForApplicants,
  setSelectedJobForApplicants,
  recruiterJobs,
  selectedJobApplicants,
  loadingApplicants,
  onUpdateStatus,
  onAddNote,
  submittingNote,
  fetchJobApplicants,
  myApps,
  loadingMyApps,
  setActiveTab
}) {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [recruiterNote, setRecruiterNote] = useState('');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!recruiterNote.trim()) return;
    onAddNote(selectedApplication._id, recruiterNote, (updatedApp) => {
      setRecruiterNote('');
      setSelectedApplication(updatedApp);
    });
  };

  const handleStatusChange = async (appId, newStatus) => {
    await onUpdateStatus(appId, newStatus);
    // Sync local selected application status
    if (selectedApplication && selectedApplication._id === appId) {
      setSelectedApplication(prev => ({ ...prev, status: newStatus }));
    }
  };

  if (user.role === 'recruiter') {
    return (
      <div className="tab-content">
        <div className="recruiter-ats-view">
          <div className="ats-header">
            <h2>
              Applicants for:{' '}
              <select
                value={selectedJobForApplicants?._id || ''}
                onChange={e => {
                  const targetJob = recruiterJobs.find(j => j._id === e.target.value);
                  setSelectedJobForApplicants(targetJob);
                  setSelectedApplication(null);
                  if (targetJob) fetchJobApplicants(targetJob._id);
                }}
              >
                <option value="">-- Choose Job Posting --</option>
                {recruiterJobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title}</option>
                ))}
              </select>
            </h2>
          </div>

          {!selectedJobForApplicants ? (
            <div className="empty-state">
              <UsersRound size={40} />
              <p>Select a job posting above to manage applicant pipelines.</p>
            </div>
          ) : loadingApplicants ? (
            <div className="jobs-loader">
              <div className="loader-spinner"></div>
            </div>
          ) : selectedJobApplicants.length === 0 ? (
            <div className="empty-state">
              <UsersRound size={40} />
              <p>No candidate has applied to this job posting yet.</p>
            </div>
          ) : (
            <div className="ats-layout">
              {/* Applicant List */}
              <div className="applicants-sidebar-list">
                <h3>Applicants ({selectedJobApplicants.length})</h3>
                <div className="search-input" style={{ marginBottom: '12px', padding: '6px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Filter by name/email..."
                    value={applicantSearch}
                    onChange={e => setApplicantSearch(e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
                  />
                </div>
                <div className="applicant-items">
                  {selectedJobApplicants
                    .filter(app => {
                      const firstName = app.candidateId?.firstName || '';
                      const lastName = app.candidateId?.lastName || '';
                      const fullName = `${firstName} ${lastName}`;
                      const email = app.candidateId?.userId?.email || '';
                      return fullName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
                             email.toLowerCase().includes(applicantSearch.toLowerCase());
                    })
                    .map(app => (
                      <div
                        key={app._id}
                        className={`applicant-item-card ${selectedApplication?._id === app._id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedApplication(app);
                          setRecruiterNote('');
                        }}
                      >
                        <div>
                          <strong>{app.candidateId?.firstName} {app.candidateId?.lastName}</strong>
                          <span className="applicant-email">{app.candidateId?.userId?.email || 'Candidate email'}</span>
                        </div>
                        <span className={`badge status-${app.status}`}>{app.status}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Applicant Details & Timeline */}
              <div className="applicant-details-view">
                {selectedApplication ? (
                  <div className="details-container">
                    <div className="details-header">
                      <div>
                        <h3>
                          {selectedApplication.candidateId?.firstName} {selectedApplication.candidateId?.lastName}
                        </h3>
                        <span className="candidate-sub">{selectedApplication.candidateId?.userId?.email}</span>
                      </div>
                      <div className="status-selector-wrapper">
                        <label>Update Stage:</label>
                        <select
                          value={selectedApplication.status}
                          onChange={e => handleStatusChange(selectedApplication._id, e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div className="details-body">
                      {/* Resume */}
                      <section className="details-section">
                        <h4>Application Resume</h4>
                        {selectedApplication.resumeUrl ? (
                          <a
                            href={selectedApplication.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline resume-download-link"
                          >
                            <FileText size={16} /> View Candidate Resume
                          </a>
                        ) : (
                          <p className="warning-text">No resume snapshot available.</p>
                        )}
                      </section>

                      {/* Cover Letter */}
                      {selectedApplication.coverLetter && (
                        <section className="details-section">
                          <h4>Cover Letter</h4>
                          <p className="cover-letter-text">"{selectedApplication.coverLetter}"</p>
                        </section>
                      )}

                      {/* Recruiter Notes */}
                      <section className="details-section notes-section">
                        <h4>Internal Interview Notes ({selectedApplication.recruiterNotes?.length || 0})</h4>
                        <div className="notes-log">
                          {selectedApplication.recruiterNotes?.length === 0 ? (
                            <p className="secondary-text">No interview notes written yet.</p>
                          ) : (
                            selectedApplication.recruiterNotes.map((note, index) => (
                              <div key={index} className="note-card">
                                <p className="note-content">{note.note}</p>
                                <span className="note-time">
                                  Added on {new Date(note.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>

                        <form onSubmit={handleNoteSubmit} className="note-input-form">
                          <input
                            type="text"
                            value={recruiterNote}
                            onChange={e => setRecruiterNote(e.target.value)}
                            placeholder="Add interview feedback or screening notes..."
                            required
                          />
                          <button type="submit" className="btn btn-primary btn-sm" disabled={submittingNote}>
                            <Plus size={14} /> Add Note
                          </button>
                        </form>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="details-empty">
                    <UsersRound size={40} />
                    <p>Select a candidate from the list to view their pipeline progression, resumes, and internal notes.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Candidate View
  const filteredApps = myApps.filter(app => {
    const jobTitle = app.jobId?.title || '';
    const companyName = app.jobId?.companyId?.name || '';
    const matchesSearch = jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="tab-content">
      <div className="candidate-applications-view">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>My Submitted Applications</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="search-input" style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search job or company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {loadingMyApps ? (
          <div className="jobs-loader">
            <div className="loader-spinner"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="empty-state">
            <Clock size={40} />
            <p>No submitted job applications found matching your criteria.</p>
            {myApps.length === 0 && (
              <button type="button" className="btn btn-primary" onClick={() => setActiveTab('jobs')}>
                Browse Job Openings
              </button>
            )}
          </div>
        ) : (
          <div className="applications-timeline-grid">
            {filteredApps.map(app => (
              <div className="app-timeline-card" key={app._id}>
                <div className="app-card-header">
                  <div>
                    <h3>{app.jobId?.title || 'Job Role'}</h3>
                    <p className="job-company">{app.jobId?.companyId?.name || 'Company details'}</p>
                  </div>
                  <span className={`badge status-${app.status}`}>{app.status}</span>
                </div>

                <div className="app-card-timeline">
                  <p className="timeline-eyebrow">Progression stage</p>
                  <div className="timeline-nodes">
                    {['applied', 'screening', 'interviewing', 'offered'].map((stage, idx) => {
                      const activeIdx = ['applied', 'screening', 'interviewing', 'offered', 'rejected'].indexOf(app.status);
                      const isCompleted = activeIdx >= idx && app.status !== 'rejected';
                      const isCurrent = app.status === stage;

                      return (
                        <div key={stage} className={`timeline-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                          <div className="node-circle">
                            {isCompleted ? <Check size={10} /> : idx + 1}
                          </div>
                          <span className="node-label">{stage}</span>
                        </div>
                      );
                    })}
                    {app.status === 'rejected' && (
                      <div className="timeline-node rejected">
                        <div className="node-circle">
                          <X size={10} />
                        </div>
                        <span className="node-label">rejected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="app-card-footer">
                  <span className="apply-date">Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  {app.resumeUrl && (
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="resume-attachment-link">
                      <FileText size={14} /> Resume snapshot
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
