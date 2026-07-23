import { useState } from 'react';
import { Plus, BriefcaseBusiness, Lock, RotateCcw } from 'lucide-react';
import { Button, Badge, EmptyState, ConfirmDialog } from '../ui';
import JobWizard from '../JobWizard.jsx';
import ReopenJobModal from './ReopenJobModal.jsx';

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
  onCloseJob,
  onReopenJob,
  onArchiveJob,
}) {
  const [jobToReopen, setJobToReopen] = useState(null);
  const [jobToClose, setJobToClose] = useState(null);
  const [submittingReopen, setSubmittingReopen] = useState(false);

  const handleReopenSubmit = async (jobId, expiresAt) => {
    setSubmittingReopen(true);
    try {
      if (onReopenJob) {
        await onReopenJob(jobId, expiresAt);
      } else {
        await onUpdateJobStatus(jobId, 'active');
      }
      setJobToReopen(null);
    } finally {
      setSubmittingReopen(false);
    }
  };

  const handleCloseConfirm = async () => {
    if (!jobToClose) return;
    if (onCloseJob) {
      await onCloseJob(jobToClose._id);
    } else {
      await onUpdateJobStatus(jobToClose._id, 'closed');
    }
    setJobToClose(null);
  };

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

        {jobToReopen && (
          <ReopenJobModal
            job={jobToReopen}
            onClose={() => setJobToReopen(null)}
            onReopen={handleReopenSubmit}
            submitting={submittingReopen}
          />
        )}

        <ConfirmDialog
          isOpen={Boolean(jobToClose)}
          onClose={() => setJobToClose(null)}
          onConfirm={handleCloseConfirm}
          title="Close Job Posting"
          message={`Are you sure you want to close "${jobToClose?.title}"? Candidate applications will no longer be accepted, but existing records will be retained.`}
          confirmText="Close Posting"
          confirmVariant="danger"
        />

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
                            icon={<Lock size={13} />}
                            onClick={() => setJobToClose(job)}
                          >
                            Close
                          </Button>
                        ) : job.status === 'closed' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            style={{ borderColor: '#059669', color: '#059669' }}
                            icon={<RotateCcw size={13} />}
                            onClick={() => setJobToReopen(job)}
                          >
                            Reopen
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
