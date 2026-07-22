import { useState, useCallback } from 'react';
import { savedJobsApi } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

/**
 * Custom hook for bookmarking / saving jobs.
 */
export function useSavedJobs() {
  const { triggerAlert } = useApp();

  const [savedJobs, setSavedJobs] = useState([]);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);

  const fetchSavedJobs = useCallback(() => {
    setLoadingSavedJobs(true);
    savedJobsApi.list()
      .then((res) => {
        if (res.success) setSavedJobs(res.data.savedJobs);
      })
      .catch(() => {})
      .finally(() => setLoadingSavedJobs(false));
  }, []);

  const handleToggleSaveJob = useCallback(async (jobId) => {
    const isSaved = savedJobs.some((s) => (s.jobId?._id || s.jobId) === jobId);
    try {
      if (isSaved) {
        await savedJobsApi.unsave(jobId);
        triggerAlert('Job removed from bookmarks');
      } else {
        await savedJobsApi.save(jobId);
        triggerAlert('Job bookmarked successfully');
      }
      fetchSavedJobs();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  }, [savedJobs, fetchSavedJobs, triggerAlert]);

  return {
    savedJobs,
    loadingSavedJobs,
    fetchSavedJobs,
    handleToggleSaveJob,
  };
}

export default useSavedJobs;
