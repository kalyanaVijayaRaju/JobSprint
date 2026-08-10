import { useState, useEffect } from 'react';
import { jobsApi } from '../../api/client.js';
import JobCard from '../jobs/JobCard.jsx';
import { Spinner, Pagination, EmptyState } from '../ui';

/**
 * Paginated jobs listing component specifically for a single company's open roles.
 */
export default function CompanyJobs({ companyId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });

  useEffect(() => {
    if (!companyId) return;
    loadJobs(1);
  }, [companyId]);

  const loadJobs = (page = 1) => {
    setLoading(true);
    jobsApi
      .list({ companyId, page, limit: 6, status: 'active' })
      .then((res) => {
        if (res.success && res.data) {
          setJobs(res.data.jobs || []);
          setPagination(res.data.pagination || { currentPage: 1, totalPages: 1, totalJobs: 0 });
        }
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spinner size="md" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No active openings"
        description="This company doesn't have any active job postings right now. Check back soon!"
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={loadJobs}
        />
      )}
    </div>
  );
}
