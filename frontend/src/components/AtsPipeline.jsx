import { useState } from 'react';
import {
  UsersRound,
  FileText,
  Plus,
  Clock,
  Check,
  X
} from 'lucide-react';
import KanbanBoard from './KanbanBoard.jsx';


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
  setActiveTab,
  onWithdraw,
  withdrawingApplicationId
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
          <div className="ats-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>
              Pipeline Board:{' '}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Kanban Board Column Layout */}
              <KanbanBoard
                applicants={selectedJobApplicants}
                onUpdateStatus={handleStatusChange}
                onSelectApplication={(app) => {
                  setSelectedApplication(app);
                  setRecruiterNote('');
                }}
                selectedApplication={selectedApplication}
              />

              {/* Applicant Detailed Panel below Kanban */}
              <div className="applicant-details-view" style={{ width: '100%', marginTop: '16px' }}>
                {selectedApplication ? (
                  <div className="details-container" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div className="details-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontWeight: '800', fontSize: '20px' }}>
                          {selectedApplication.candidateId?.firstName} {selectedApplication.candidateId?.lastName}
                        </h3>
                        <span className="candidate-sub" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{selectedApplication.candidateId?.userId?.email}</span>
                      </div>
                      <div className="status-selector-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Update Stage:</label>
                        <select
                          value={selectedApplication.status}
                          onChange={e => handleStatusChange(selectedApplication._id, e.target.value)}
                          style={{ padding: '6px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="offered">Offered</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    <div className="details-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                      
                      {/* Left: resume and cover letter */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <section className="details-section">
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700' }}>Application Resume</h4>
                          {selectedApplication.resumeUrl ? (
                            <a
                              href={selectedApplication.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-outline resume-download-link"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                              <FileText size={16} /> View Candidate Resume
                            </a>
                          ) : (
                            <p className="warning-text" style={{ color: 'var(--color-error)', fontSize: '13px' }}>No resume snapshot available.</p>
                          )}
                        </section>

                        {selectedApplication.coverLetter && (
                          <section className="details-section">
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700' }}>Cover Letter</h4>
                            <p className="cover-letter-text" style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', background: 'var(--color-bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--color-border)', fontStyle: 'italic' }}>
                              "{selectedApplication.coverLetter}"
                            </p>
                          </section>
                        )}
                      </div>

                      {/* Right: recruiter notes */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <section className="details-section notes-section">
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700' }}>Internal Interview Notes ({selectedApplication.recruiterNotes?.length || 0})</h4>
                          <div className="notes-log" style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                            {selectedApplication.recruiterNotes?.length === 0 ? (
                              <p className="secondary-text" style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No interview notes written yet.</p>
                            ) : (
                              selectedApplication.recruiterNotes.map((note, index) => (
                                <div key={index} className="note-card" style={{ padding: '12px', background: 'var(--color-bg)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                                  <p className="note-content" style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--color-text-main)' }}>{note.note}</p>
                                  <span className="note-time" style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                                    Added on {new Date(note.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={handleNoteSubmit} className="note-input-form" style={{ display: 'flex', gap: '10px' }}>
                            <input
                              type="text"
                              value={recruiterNote}
                              onChange={e => setRecruiterNote(e.target.value)}
                              placeholder="Add interview feedback or screening notes..."
                              required
                              style={{ flex: 1, padding: '8px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px' }}
                            />
                            <button type="submit" className="btn btn-primary btn-sm" disabled={submittingNote} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Plus size={14} /> Add Note
                            </button>
                          </form>
                        </section>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="details-empty" style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--color-card)', border: '1px dashed var(--color-border)', borderRadius: '24px' }}>
                    <UsersRound size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }} />
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Select a candidate card from the Kanban Board to view resumes and internal interview notes.</p>
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
  const [subTab, setSubTab] = useState('all'); // 'all' | 'active' | 'offered' | 'rejected' | 'withdrawn'

  const filteredApps = myApps.filter(app => {
    const jobTitle = app.jobId?.title || '';
    const companyName = app.jobId?.companyId?.name || '';
    const matchesSearch = jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesSubTab = true;
    if (subTab === 'active') {
      matchesSubTab = ['applied', 'screening', 'interviewing'].includes(app.status);
    } else if (subTab === 'offered') {
      matchesSubTab = app.status === 'offered';
    } else if (subTab === 'rejected') {
      matchesSubTab = app.status === 'rejected';
    } else if (subTab === 'withdrawn') {
      matchesSubTab = app.status === 'withdrawn';
    }

    return matchesSearch && matchesSubTab;
  });

  // Calculate stats for visual funnel
  const stats = {
    applied: myApps.filter(a => a.status === 'applied').length,
    screening: myApps.filter(a => a.status === 'screening').length,
    interviewing: myApps.filter(a => a.status === 'interviewing').length,
    offered: myApps.filter(a => a.status === 'offered').length,
    rejected: myApps.filter(a => a.status === 'rejected').length,
    withdrawn: myApps.filter(a => a.status === 'withdrawn').length
  };

  return (
    <div className="tab-content">
      <div className="candidate-applications-view">
        
        {/* Funnel Overview */}
        {myApps.length > 0 && (
          <div className="funnel-container" style={{ marginBottom: '32px', background: 'var(--color-card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700' }}>Hiring Pipeline Funnel</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'Applied', count: stats.applied, color: 'var(--color-primary)' },
                { label: 'Screening', count: stats.screening, color: 'var(--color-warning)' },
                { label: 'Interviewing', count: stats.interviewing, color: 'var(--color-accent)' },
                { label: 'Offered', count: stats.offered, color: 'var(--color-success)' },
                { label: 'Rejected', count: stats.rejected, color: 'var(--color-error)' },
                { label: 'Withdrawn', count: stats.withdrawn, color: 'var(--color-text-muted)' }
              ].map(item => (
                <div key={item.label} style={{ flex: '1', minWidth: '120px', padding: '12px', background: 'var(--color-bg)', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', textTransform: 'uppercase' }}>{item.label}</span>
                  <strong style={{ fontSize: '24px', fontWeight: '800', color: item.color, display: 'block', marginTop: '4px' }}>{item.count}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Sub-tab Filters */}
          <div className="subtabs-bar" style={{ display: 'flex', gap: '4px', background: 'var(--color-border)', padding: '4px', borderRadius: '10px' }}>
            {['all', 'active', 'offered', 'rejected', 'withdrawn'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setSubTab(tab)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: subTab === tab ? 'var(--color-card)' : 'transparent',
                  color: subTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: subTab === tab ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === 'all' ? myApps.length : tab === 'active' ? stats.applied + stats.screening + stats.interviewing : stats[tab]})
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-input" style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search job or company..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
              />
            </div>
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

                      // Extract date from timeline if present
                      const timelineMatch = app.statusTimeline?.find(t => t.status === stage);
                      const stageDate = timelineMatch 
                        ? new Date(timelineMatch.updatedAt).toLocaleDateString()
                        : stage === 'applied' 
                          ? new Date(app.createdAt).toLocaleDateString() 
                          : null;

                      return (
                        <div key={stage} className={`timeline-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                          <div className="node-circle">
                            {isCompleted ? <Check size={10} /> : idx + 1}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="node-label">{stage}</span>
                            {stageDate && <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{stageDate}</span>}
                          </div>
                        </div>
                      );
                    })}
                    {app.status === 'rejected' && (
                      <div className="timeline-node rejected">
                        <div className="node-circle">
                          <X size={10} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span className="node-label">rejected</span>
                          <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {app.statusTimeline?.find(t => t.status === 'rejected') 
                              ? new Date(app.statusTimeline.find(t => t.status === 'rejected').updatedAt).toLocaleDateString()
                              : new Date(app.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                    {app.status === 'withdrawn' && (
                      <div className="timeline-node rejected">
                        <div className="node-circle"><X size={10} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span className="node-label">withdrawn</span>
                          <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {new Date(app.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
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
                  {!['withdrawn', 'rejected'].includes(app.status) && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => onWithdraw(app)}
                      disabled={withdrawingApplicationId === app._id}
                    >
                      {withdrawingApplicationId === app._id ? 'Withdrawing…' : 'Withdraw application'}
                    </button>
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

