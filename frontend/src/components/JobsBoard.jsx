import { useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Bookmark,
  MapPin,
  DollarSign,
  X,
  Plus,
  Search,
  FileText,
  Clock,
  ExternalLink,
  CircleAlert,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import JobWizard from './JobWizard.jsx';


export default function JobsBoard({
  user,
  profile,
  jobs,
  myApps,
  loadingJobs,
  savedJobs,
  recruiterJobs,
  onSearch,
  onToggleSaveJob,
  onApply,
  onPostJob,
  onUpdateJob,
  onDeleteJob,
  submittingApplication,
  submittingJob,
  setActiveTab,
  setSelectedJobForApplicants,
  fetchJobApplicants,
  pagination
}) {
  const [jobSearch, setJobSearch] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
  const [salaryMinFilter, setSalaryMinFilter] = useState('');
  const [salaryMaxFilter, setSalaryMaxFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [isFilterPaneOpen, setIsFilterPaneOpen] = useState(true);
  const [sortBy, setSortBy] = useState('match');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [showCreateJob, setShowCreateJob] = useState(false);

  const [newJobForm, setNewJobForm] = useState({
    title: '',
    description: '',
    requirements: '',
    skillsRequired: '',
    locationType: 'remote',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    jobType: 'full-time',
    expiresAt: ''
  });

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch({
      search: jobSearch || undefined,
      jobType: jobTypeFilter || undefined,
      locationType: locationTypeFilter || undefined,
      salaryMin: salaryMinFilter ? Number(salaryMinFilter) : undefined,
      salaryMax: salaryMaxFilter ? Number(salaryMaxFilter) : undefined,
      page: 1
    });
  };

  const handleClearFilters = () => {
    setJobSearch('');
    setJobTypeFilter('');
    setLocationTypeFilter('');
    setSalaryMinFilter('');
    setSalaryMaxFilter('');
    setExperienceFilter('');
    onSearch({});
  };

  const hasActiveFilters = Boolean(
    jobSearch || jobTypeFilter || locationTypeFilter || salaryMinFilter || salaryMaxFilter || experienceFilter
  );

  const candidateSkills = useMemo(
    () => (profile?.skills || []).map(skill => skill.trim().toLowerCase()).filter(Boolean),
    [profile?.skills]
  );

  const rankedJobs = useMemo(() => {
    let withMatchData = jobs.map(job => {
      const requiredSkills = job.skillsRequired || [];
      const matchingSkills = requiredSkills.filter(skill => candidateSkills.includes(skill.toLowerCase()));
      const matchScore = requiredSkills.length > 0
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : 0;

      return { job, matchingSkills, matchScore };
    });

    if (experienceFilter) {
      withMatchData = withMatchData.filter(({ job }) => {
        const textToSearch = `${job.title} ${job.description} ${job.requirements?.join(' ') || ''}`.toLowerCase();
        if (experienceFilter === 'entry') {
          return textToSearch.includes('entry') || textToSearch.includes('junior') || textToSearch.includes('intern') || textToSearch.includes('associate');
        }
        if (experienceFilter === 'mid') {
          return textToSearch.includes('mid') || textToSearch.includes('intermediate') || textToSearch.includes('3+') || textToSearch.includes('4+');
        }
        if (experienceFilter === 'senior') {
          return textToSearch.includes('senior') || textToSearch.includes('lead') || textToSearch.includes('5+') || textToSearch.includes('8+');
        }
        if (experienceFilter === 'executive') {
          return textToSearch.includes('executive') || textToSearch.includes('director') || textToSearch.includes('vp') || textToSearch.includes('head of') || textToSearch.includes('manager');
        }
        return true;
      });
    }

    return withMatchData.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.job.createdAt || 0) - new Date(a.job.createdAt || 0);
      }
      if (sortBy === 'salary') {
        return (b.job.salaryRange?.max || 0) - (a.job.salaryRange?.max || 0);
      }
      return b.matchScore - a.matchScore;
    });
  }, [candidateSkills, jobs, sortBy, experienceFilter]);

  const handleCreateJobSubmit = (e) => {
    e.preventDefault();
    onPostJob(newJobForm, () => {
      setShowCreateJob(false);
      setNewJobForm({
        title: '',
        description: '',
        requirements: '',
        skillsRequired: '',
        locationType: 'remote',
        location: '',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'USD',
        jobType: 'full-time',
        expiresAt: ''
      });
    });
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    onApply(selectedJob._id, coverLetter, () => {
      setSelectedJob(null);
      setCoverLetter('');
    });
  };


  if (user.role === 'recruiter') {
    return (
      <div className="tab-content">
        <div className="recruiter-jobs-view">
          <div className="section-header">
            <h2>My Postings</h2>
            <button type="button" className="btn btn-primary" onClick={() => setShowCreateJob(true)}>
              <Plus size={16} /> Post a Job
            </button>
          </div>

          {showCreateJob && (
            <JobWizard
              onPostJob={onPostJob}
              onClose={() => setShowCreateJob(false)}
              submittingJob={submittingJob}
            />
          )}


          <div className="jobs-list">
            {recruiterJobs.length === 0 ? (
              <div className="empty-state">
                <BriefcaseBusiness size={40} />
                <p>You haven't posted any job openings yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Role Details</th>
                      <th>Location type</th>
                      <th>Status</th>
                      <th>Applications</th>
                      <th>Date Posted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiterJobs.map(job => (
                      <tr key={job._id}>
                        <td>
                          <strong className="cell-primary">{job.title}</strong>
                          <span className="cell-secondary">{job.location}</span>
                        </td>
                        <td>
                          <span className="badge location-badge">{job.locationType}</span>
                          <span className="badge job-type-badge">{job.jobType}</span>
                        </td>
                        <td>
                          <span className={`badge status-${job.status}`}>{job.status}</span>
                          {job.expiresAt && new Date(job.expiresAt) < new Date() && (
                            <span className="badge status-rejected" style={{ marginLeft: '6px', fontSize: '10px' }}>Expired</span>
                          )}
                        </td>
                        <td>
                          <strong>{job.applicationsCount || 0}</strong> applicants
                        </td>
                        <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              setSelectedJobForApplicants(job);
                              fetchJobApplicants(job._id);
                              setActiveTab('applications');
                            }}
                          >
                            Manage ATS
                          </button>
                          {job.status === 'active' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{ borderColor: '#d97706', color: '#d97706' }}
                              onClick={() => onUpdateJob(job._id, { status: 'closed' })}
                            >
                              Close
                            </button>
                          ) : job.status === 'closed' ? (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{ borderColor: '#059669', color: '#059669' }}
                              onClick={() => onUpdateJob(job._id, { status: 'active' })}
                            >
                              Activate
                            </button>
                          ) : null}
                          {job.status !== 'archived' && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              style={{ borderColor: '#e11d48', color: '#e11d48' }}
                              onClick={() => {
                                if (window.confirm('Are you sure you want to archive this job posting?')) {
                                  onDeleteJob(job._id);
                                }
                              }}
                            >
                              Archive
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Candidate view
  return (
    <div className="tab-content">
      <div className="candidate-jobs-layout">
        
        {/* Toggle filters button for mobile */}
        <button 
          type="button" 
          className="btn btn-outline toggle-filters-btn"
          onClick={() => setIsFilterPaneOpen(!isFilterPaneOpen)}
        >
          {isFilterPaneOpen ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Collapsible sticky filter pane */}
        <aside className={`filter-pane ${isFilterPaneOpen ? 'open' : 'collapsed'}`}>
          <div className="filter-pane-header">
            <h3>Filters</h3>
            <button 
              type="button" 
              className="close-filters-btn"
              onClick={() => setIsFilterPaneOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="filter-form">
            <div className="form-group">
              <label>Search Keyword</label>
              <div className="search-input">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Title, description or skills..."
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Job Type</label>
              <select value={jobTypeFilter} onChange={e => setJobTypeFilter(e.target.value)}>
                <option value="">All Job Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location Type</label>
              <select value={locationTypeFilter} onChange={e => setLocationTypeFilter(e.target.value)}>
                <option value="">All Location Types</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)}>
                <option value="">All Experience Levels</option>
                <option value="entry">Entry Level / Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive / VP</option>
              </select>
            </div>

            <div className="form-group">
              <label>Min Salary (Annual USD)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={salaryMinFilter}
                onChange={e => setSalaryMinFilter(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Max Salary (Annual USD)</label>
              <input
                type="number"
                placeholder="e.g. 150000"
                value={salaryMaxFilter}
                onChange={e => setSalaryMaxFilter(e.target.value)}
              />
            </div>

            <div className="filter-actions-row">
              <button type="submit" className="btn btn-primary btn-block">
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button type="button" className="btn btn-outline btn-block" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          </form>
        </aside>

        {/* Content area */}
        <div className="jobs-results-pane">
          {candidateSkills.length === 0 && (
            <div className="match-guidance">
              <Sparkles size={18} aria-hidden="true" />
              <div>
                <strong>Unlock personalized job matches</strong>
                <span>Add skills to your profile to rank roles by fit.</span>
              </div>
              <button type="button" onClick={() => setActiveTab('profile')}>Update profile</button>
            </div>
          )}

          <div className="results-header">
            <div className="results-summary" aria-live="polite">
              <span>{loadingJobs ? 'Searching open roles…' : `${pagination?.totalJobs || jobs.length} ${pagination?.totalJobs === 1 ? 'role' : 'roles'} found`}</span>
              {hasActiveFilters && !loadingJobs && <span> • Filtered results</span>}
            </div>

            <label className="sort-control">
              <ArrowUpDown size={14} aria-hidden="true" />
              <span>Sort:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="match">Best match</option>
                <option value="newest">Newest first</option>
                <option value="salary">Highest salary</option>
              </select>
            </label>
          </div>

          {/* Job grid */}
          {loadingJobs ? (
            <div className="jobs-loader">
              <div className="loader-spinner"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <BriefcaseBusiness size={40} />
              <p>No job postings found matching your search.</p>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {rankedJobs.map(({ job, matchingSkills, matchScore }) => {
                  const isBookmarked = savedJobs.some(s => (s.jobId?._id || s.jobId) === job._id);
                  const isApplied = myApps.some(app => (app.jobId?._id || app.jobId) === job._id);
                  return (
                    <article className="job-card" key={job._id}>
                      <div className="job-card-header">
                        <div>
                          <h3>{job.title}</h3>
                          <p className="job-company">{job.companyId?.name || 'Company Details'}</p>
                        </div>
                        <button
                          type="button"
                          className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                          onClick={() => onToggleSaveJob(job._id)}
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
                        >
                          <Bookmark size={18} />
                        </button>
                      </div>

                      {candidateSkills.length > 0 && (
                        <div className={`match-score ${matchScore >= 60 ? 'strong' : ''}`} title={`${matchingSkills.length} matching skills`}>
                          <Sparkles size={14} aria-hidden="true" />
                          <span>{matchScore}% skill match</span>
                        </div>
                      )}

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
                        {(job.skillsRequired || []).map(skill => (
                          <span key={skill} className={`skill-tag ${matchingSkills.includes(skill) ? 'skill-match' : ''}`}>
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="job-card-footer">
                        <button
                          type="button"
                          className="btn btn-outline btn-block"
                          onClick={() => setSelectedJob(job)}
                        >
                          {isApplied ? 'View application details' : 'Details & Apply'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="pagination-wrapper" style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                  <button
                    type="button"
                    disabled={pagination.currentPage === 1}
                    onClick={() => onSearch({
                      search: jobSearch || undefined,
                      jobType: jobTypeFilter || undefined,
                      locationType: locationTypeFilter || undefined,
                      salaryMin: salaryMinFilter ? Number(salaryMinFilter) : undefined,
                      salaryMax: salaryMaxFilter ? Number(salaryMaxFilter) : undefined,
                      page: pagination.currentPage - 1
                    })}
                    className="btn btn-outline"
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => onSearch({
                      search: jobSearch || undefined,
                      jobType: jobTypeFilter || undefined,
                      locationType: locationTypeFilter || undefined,
                      salaryMin: salaryMinFilter ? Number(salaryMinFilter) : undefined,
                      salaryMax: salaryMaxFilter ? Number(salaryMaxFilter) : undefined,
                      page: pagination.currentPage + 1
                    })}
                    className="btn btn-outline"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Slide-in Detail Drawer for desktop/mobile */}
      {selectedJob && (
        <div className="drawer-overlay" onClick={() => setSelectedJob(null)}>
          <div className="drawer-container" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>{selectedJob.title}</h3>
                <p className="job-company">{selectedJob.companyId?.name}</p>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setSelectedJob(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body">
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
                  <div className="already-applied-notice" role="status">
                    You have already applied for this role. Track its progress from Applications.
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
  );

}
