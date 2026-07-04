import { useState } from 'react';
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
  CircleAlert
} from 'lucide-react';

export default function JobsBoard({
  user,
  profile,
  jobs,
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
  fetchJobApplicants
}) {
  const [jobSearch, setJobSearch] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [locationTypeFilter, setLocationTypeFilter] = useState('');
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
    e.preventDefault();
    onSearch({ search: jobSearch, jobType: jobTypeFilter, locationType: locationTypeFilter });
  };

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
            <div className="modal-backdrop">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Post a New Job Opportunity</h3>
                  <button type="button" onClick={() => setShowCreateJob(false)} aria-label="Close">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateJobSubmit} className="create-job-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        value={newJobForm.title}
                        onChange={e => setNewJobForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                        placeholder="e.g. Senior Full Stack Architect"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location (City, Country)</label>
                      <input
                        type="text"
                        value={newJobForm.location}
                        onChange={e => setNewJobForm(prev => ({ ...prev, location: e.target.value }))}
                        required
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                    <div className="form-group">
                      <label>Location Type</label>
                      <select
                        value={newJobForm.locationType}
                        onChange={e => setNewJobForm(prev => ({ ...prev, locationType: e.target.value }))}
                      >
                        <option value="remote">Remote</option>
                        <option value="onsite">Onsite</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Job Type</label>
                      <select
                        value={newJobForm.jobType}
                        onChange={e => setNewJobForm(prev => ({ ...prev, jobType: e.target.value }))}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Salary Minimum</label>
                      <input
                        type="number"
                        value={newJobForm.salaryMin}
                        onChange={e => setNewJobForm(prev => ({ ...prev, salaryMin: e.target.value }))}
                        placeholder="e.g. 90000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Salary Maximum</label>
                      <input
                        type="number"
                        value={newJobForm.salaryMax}
                        onChange={e => setNewJobForm(prev => ({ ...prev, salaryMax: e.target.value }))}
                        placeholder="e.g. 130000"
                      />
                    </div>
                    <div className="form-group">
                      <label>Skills Required (comma-separated)</label>
                      <input
                        type="text"
                        value={newJobForm.skillsRequired}
                        onChange={e => setNewJobForm(prev => ({ ...prev, skillsRequired: e.target.value }))}
                        required
                        placeholder="e.g. Node.js, Express, React, MongoDB"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expires At</label>
                      <input
                        type="date"
                        value={newJobForm.expiresAt}
                        onChange={e => setNewJobForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label>Job Description</label>
                    <textarea
                      rows={4}
                      value={newJobForm.description}
                      onChange={e => setNewJobForm(prev => ({ ...prev, description: e.target.value }))}
                      required
                      placeholder="Write the responsibilities and scope of the role..."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Key Requirements (One per line)</label>
                    <textarea
                      rows={3}
                      value={newJobForm.requirements}
                      onChange={e => setNewJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                      placeholder="e.g. 5+ years experience building APIs&#10;Excellent communication skills"
                    />
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline" onClick={() => setShowCreateJob(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submittingJob}>
                      {submittingJob ? 'Saving...' : 'Post Job'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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
      <div className="candidate-jobs-view">
        {/* Filters Form */}
        <form onSubmit={handleSearchSubmit} className="filters-bar">
          <div className="search-input">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search title, skills or details..."
              value={jobSearch}
              onChange={e => setJobSearch(e.target.value)}
            />
          </div>
          <select value={jobTypeFilter} onChange={e => setJobTypeFilter(e.target.value)}>
            <option value="">All Job Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
          <select value={locationTypeFilter} onChange={e => setLocationTypeFilter(e.target.value)}>
            <option value="">All Locations</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

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
          <div className="jobs-grid">
            {jobs.map(job => {
              const isBookmarked = savedJobs.some(s => (s.jobId?._id || s.jobId) === job._id);
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
                    {job.skillsRequired.map(skill => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>

                  <div className="job-card-footer">
                    <button
                      type="button"
                      className="btn btn-outline btn-block"
                      onClick={() => setSelectedJob(job)}
                    >
                      Details & Apply
                    </button>
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
                  {profile?.resumeUrl ? (
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
