import { Card, Badge, EmptyState } from '../ui';
import { BriefcaseBusiness, Clock } from 'lucide-react';

/**
 * Recent applications or recent job postings list component for dashboard.
 */
export default function RecentActivity({ user, myApps = [], recruiterJobs = [] }) {
  if (user.role === 'candidate') {
    return (
      <Card variant="elevated">
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>
          Recent Application Statuses
        </h3>
        {myApps.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness size={36} />}
            title="No applications yet"
            description="Explore open jobs and submit your first application."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role Title</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {myApps.slice(0, 5).map((app) => (
                  <tr key={app._id}>
                    <td>
                      <strong className="cell-primary">{app.jobId?.title || 'Job Opening'}</strong>
                    </td>
                    <td>{app.jobId?.companyId?.name || 'Company'}</td>
                    <td>
                      <Badge variant={`status-${app.status}`}>{app.status}</Badge>
                    </td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  }

  if (user.role === 'recruiter') {
    return (
      <Card variant="elevated">
        <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>
          Active Job Openings
        </h3>
        {recruiterJobs.length === 0 ? (
          <EmptyState
            icon={<Clock size={36} />}
            title="No active job postings"
            description="Post a job opening to start receiving applicant pipelines."
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Applicants</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recruiterJobs.slice(0, 5).map((job) => (
                  <tr key={job._id}>
                    <td>
                      <strong className="cell-primary">{job.title}</strong>
                    </td>
                    <td>{job.location}</td>
                    <td>
                      <strong>{job.applicationsCount || 0}</strong> applicants
                    </td>
                    <td>
                      <Badge variant={`status-${job.status}`}>{job.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  }

  return null;
}
