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
  CircleAlert,
  Search,
  SlidersHorizontal
} from 'lucide-react';

export default function SavedJobs({
  user,
  profile,
  savedJobs,
  myApps,
  onToggleSaveJob,
  onApply,
  submittingApplication,
  setActiveTab,
  loadingSavedJobs,
  search,
  setSearch,
  locationType,
  setLocationType,
  jobType,
  setJobType,
  status,
  setStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  page,
  setPage,
  pagination
}) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    onApply(selectedJob._id, coverLetter, () => {
      setSelectedJob(null);
      setCoverLetter('');
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setLocationType('');
    setJobType('');
    setStatus('active');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <div className="tab-content">
      <div className="candidate-saved-jobs-view" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Sticky Collapsible Filters Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'var(--color-card)', padding: '16px 24px', borderRadius: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bookmark className="text-primary" size={24} />
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Bookmarked Opportunities</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Track and organize roles you are interested in ({pagination.totalSavedJobs} total)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline toggle-filters-btn"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setActiveTab('jobs')}>
              Discover More Jobs
            </button>
          </div>
        </div>

        {/* Sidebar & Grid Split Layout */}
        <div className="candidate-jobs-layout" style={{ position: 'relative' }}>
          
          {/* Filters Sidebar Pane */}
          <aside className={`filter-pane ${showMobileFilters ? 'open' : ''}`} style={{ zIndex: 120 }}>
            <div className="filter-pane-header">
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} /> Filter Bookmarks
              </h3>
              <button type="button" className="close-filters-btn" onClick={() => setShowMobileFilters(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="filter-form">
              {/* Keyword Search */}
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>Keyword Search</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Title, skills, keyword..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '32px', fontSize: '12px' }}
                  />
                </div>
              </div>

              {/* Location Type */}
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>Location type</label>
                <select value={locationType} onChange={e => setLocationType(e.target.value)} style={{ fontSize: '12px' }}>
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Job Type */}
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>Job type</label>
                <select value={jobType} onChange={e => setJobType(e.target.value)} style={{ fontSize: '12px' }}>
                  <option value="">All Job Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>Listing Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ fontSize: '12px' }}>
                  <option value="">All Statuses</option>
                  <option value="active">Active Posting</option>
                  <option value="closed">Closed Posting</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>Sort Bookmarks By</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={e => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  style={{ fontSize: '12px' }}
                >
                  <option value="createdAt-desc">Newest Bookmarked</option>
                  <option value="createdAt-asc">Oldest Bookmarked</option>
                </select>
              </div>

              <div className="filter-actions-row">
                <button type="button" className="btn btn-outline btn-block btn-sm" onClick={handleResetFilters}>
                  Reset Filters
                </button>
              </div>
            </div>
          </aside>

          {/* Bookmarks Grid Pane */}
          <div className="jobs-results-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            
            {loadingSavedJobs ? (
              <div className="jobs-loader">
                <div className="loader-spinner"></div>
              </div>
            ) : savedJobs.length === 0 ? (
              <div className="empty-state" style={{ background: 'var(--color-card)', border: '1px dashed var(--color-border)', borderRadius: '24px', padding: '48px 24px' }}>
                <Bookmark size={40} className="text-muted" style={{ marginBottom: '12px' }} />
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  No bookmarked jobs found matching your filters.
                </p>
                <button type="button" className="btn btn-outline" onClick={handleResetFilters}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="jobs-grid">
                  {savedJobs.map(item => {
                    const job = item.jobId;
                    if (!job) return null; // Safety check for hard-deleted jobs
                    
                    const isApplied = myApps.some(app => (app.jobId?._id || app.jobId) === job._id);

                    return (
                      <article className="job-card" key={item._id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div className="job-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{job.title}</h3>
                              <p className="job-company" style={{ fontSize: '12px', color: 'var(--color-primary)' }}>{job.companyId?.name || 'Company Details'}</p>
                            </div>
                            <button
                              type="button"
                              className="bookmark-btn active"
                              onClick={() => onToggleSaveJob(job._id)}
                              aria-label="Remove bookmark"
                              style={{ color: 'var(--color-primary)' }}
                            >
                              <Bookmark size={18} fill="var(--color-primary)" />
                            </button>
                          </div>

                          <div className="job-tags" style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                            <span className="badge job-type-badge">{job.jobType}</span>
                            <span className="badge location-badge">{job.locationType}</span>
                            <span className={`badge status-${job.status}`} style={{ textTransform: 'capitalize' }}>{job.status}</span>
                          </div>

                          <div className="job-metadata" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                            <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={12} />
                              <span>{job.location}</span>
                            </div>
                            {job.salaryRange && (
                              <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <DollarSign size={12} />
                                <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>
                                  {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()} {job.salaryRange.currency}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="job-skills" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {job.skillsRequired?.map(skill => (
                              <span key={skill} className="skill-tag" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>{skill}</span>
                            ))}
                          </div>
                        </div>

                        <div className="job-card-footer" style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                            onClick={() => setSelectedJob(job)}
                          >
                            Details
                          </button>
                          {isApplied ? (
                            <button type="button" className="btn" style={{ flex: 1, backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)', cursor: 'default', fontSize: '12px', padding: '8px' }} disabled>
                              Applied
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ flex: 1, fontSize: '12px', padding: '8px' }}
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

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', background: 'var(--color-card)', padding: '12px 20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Page <strong>{pagination.currentPage}</strong> of {pagination.totalPages} ({pagination.totalSavedJobs} bookmarked)
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage(p => Math.max(p - 1, 1))}
                        disabled={pagination.currentPage === 1}
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

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
