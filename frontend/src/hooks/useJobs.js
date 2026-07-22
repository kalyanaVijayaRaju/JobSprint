import { useState, useCallback, useMemo } from 'react';
import { jobsApi } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

/**
 * Custom hook for job search, filtering, pagination, and recruiter CRUD operations.
 *
 * @param {object} options
 * @param {object} options.user - Current auth user
 * @param {object} options.searchParams - URLSearchParams instance
 * @param {function} options.setSearchParams - Function to update URLSearchParams
 */
export function useJobs({ user, searchParams, setSearchParams } = {}) {
  const { triggerAlert } = useApp();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0, limit: 10 });

  // Extract query filters from URL search params
  const queryFilters = useMemo(() => {
    if (!searchParams) {
      return { search: '', companyId: '', location: '', jobType: '', locationType: '', salaryMin: '', salaryMax: '', experience: '', sort: 'match', page: 1 };
    }
    return {
      search: searchParams.get('search') || '',
      companyId: searchParams.get('companyId') || '',
      location: searchParams.get('location') || '',
      jobType: searchParams.get('jobType') || '',
      locationType: searchParams.get('locationType') || '',
      salaryMin: searchParams.get('salaryMin') || '',
      salaryMax: searchParams.get('salaryMax') || '',
      experience: searchParams.get('experience') || '',
      sort: searchParams.get('sort') || 'match',
      page: Number(searchParams.get('page')) || 1,
    };
  }, [searchParams]);

  // Fetch job listing with filters
  const fetchJobs = useCallback((filters = {}) => {
    setLoadingJobs(true);
    jobsApi.list(filters)
      .then((res) => {
        if (res.success) {
          setJobs(res.data.jobs);
          if (res.data.pagination) {
            setPagination(res.data.pagination);
          }
        }
      })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoadingJobs(false));
  }, [triggerAlert]);

  // Update URL search parameters
  const updateSearch = useCallback((nextFilters) => {
    if (!setSearchParams) return;
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && !(key === 'page' && Number(value) === 1) && !(key === 'sort' && value === 'match')) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  // Fetch recruiter's posted jobs
  const fetchRecruiterJobs = useCallback(() => {
    if (!user || user.role !== 'recruiter') return;
    jobsApi.list().then((res) => {
      if (res.success) {
        const userId = user.id || user._id;
        const filtered = res.data.jobs.filter(j => j.recruiterId === userId || j.recruiterId?._id === userId);
        setRecruiterJobs(filtered);
      }
    }).catch(() => {});
  }, [user]);

  // Post a new job
  const handleCreateJob = useCallback(async (jobFormValues, onSuccess) => {
    setSubmittingJob(true);
    try {
      const jobData = {
        title: jobFormValues.title,
        description: jobFormValues.description,
        requirements: typeof jobFormValues.requirements === 'string'
          ? jobFormValues.requirements.split('\n').filter(r => r.trim())
          : jobFormValues.requirements,
        skillsRequired: typeof jobFormValues.skillsRequired === 'string'
          ? jobFormValues.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
          : jobFormValues.skillsRequired,
        locationType: jobFormValues.locationType,
        location: jobFormValues.location,
        salaryRange: {
          min: Number(jobFormValues.salaryMin) || undefined,
          max: Number(jobFormValues.salaryMax) || undefined,
          currency: jobFormValues.salaryCurrency || 'USD',
        },
        jobType: jobFormValues.jobType,
        expiresAt: jobFormValues.expiresAt
          ? new Date(jobFormValues.expiresAt).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await jobsApi.create(jobData);
      triggerAlert('Job posted successfully!');
      if (onSuccess) onSuccess();
      fetchRecruiterJobs();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmittingJob(false);
    }
  }, [fetchRecruiterJobs, triggerAlert]);

  // Update existing job status
  const handleUpdateJob = useCallback(async (jobId, data) => {
    try {
      await jobsApi.update(jobId, data);
      triggerAlert('Job status updated successfully');
      if (user?.role === 'recruiter') fetchRecruiterJobs(); else fetchJobs(queryFilters);
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  }, [user, fetchRecruiterJobs, fetchJobs, queryFilters, triggerAlert]);

  // Delete / archive job
  const handleDeleteJob = useCallback(async (jobId) => {
    try {
      await jobsApi.delete(jobId);
      triggerAlert('Job archived successfully');
      if (user?.role === 'recruiter') fetchRecruiterJobs(); else fetchJobs(queryFilters);
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  }, [user, fetchRecruiterJobs, fetchJobs, queryFilters, triggerAlert]);

  return {
    jobs,
    loadingJobs,
    recruiterJobs,
    submittingJob,
    pagination,
    queryFilters,
    fetchJobs,
    updateSearch,
    fetchRecruiterJobs,
    handleCreateJob,
    handleUpdateJob,
    handleDeleteJob,
  };
}

export default useJobs;
