import { Plus, BriefcaseBusiness } from 'lucide-react';
import { Button, Badge, EmptyState } from '../ui';
import JobWizard from '../JobWizard.jsx';

/**
 * Table view for recruiters to manage posted jobs, ATS actions, and status updates.
 */
export default function RecruiterJobsTable({
  recruiterJobs = [],
  showCreateJob,
  setShowCreateJob,
  onPostJob,
  submittingJob,
  onManageAts,
  onUpdateJobStatus,
  onArchiveJob,
}) {
  return (
    <div className="tab-content">
      <div className="recruiter-jobs-view">
        <div className="section-header">
          <h2>My Postings</h2>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowCreateJob(true)}>
            Post a Job
          </Button>
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
            <EmptyState
              icon={<BriefcaseBusiness size={40} />}
              title="No job postings yet"
              description="You haven't posted any job openings yet."
              action={
                <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowCreateJob(true)}>
                  Post Your First Job
                </Button>
              }
            />
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
                  {recruiterJobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <strong className="cell-primary">{job.title}</strong>
                        <span className="cell-secondary">{job.location}</span>
                      </td>
                      <td>
                        <Badge variant="location">{job.locationType}</Badge>
                        <Badge variant="job-type">{job.jobType}</Badge>
                      </td>
                      <td>
                        <Badge variant={`status-${job.status}`}>{job.status}</Badge>
                        {job.expiresAt && new Date(job.expiresAt) < new Date() && (
                          <Badge variant="error" style={{ marginLeft: '6px', fontSize: '10px' }}>
                            Expired
                          </Badge>
                        )}
                      </td>
                      <td>
                        <strong>{job.applicationsCount || 0}</strong> applicants
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onManageAts(job)}
                        >
                          Manage ATS
                        </Button>
                        {job.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ borderColor: '#d97706', color: '#d97706' }}
                            onClick={() => onUpdateJobStatus(job._id, 'closed')}
                          >
                            Close
                          </Button>
                        ) : job.status === 'closed' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ borderColor: '#059669', color: '#059669' }}
                            onClick={() => onUpdateJobStatus(job._id, 'active')}
                          >
                            Activate
                          </Button>
                        ) : null}
                        {job.status !== 'archived' && (
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ borderColor: '#e11d48', color: '#e11d48' }}
                            onClick={() => onArchiveJob(job._id)}
                          >
                            Archive
                          </Button>
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
