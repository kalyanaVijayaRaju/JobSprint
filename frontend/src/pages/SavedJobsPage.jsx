import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { savedJobsApi, applicationsApi } from '../api/client.js';
import SavedJobs from '../components/SavedJobs.jsx';

export default function SavedJobsPage() {
  const { user } = useAuth();
  const { triggerAlert } = useApp();
  const { profile } = useOutletContext();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [loadingSavedJobs, setLoadingSavedJobs] = useState(false);

  // Filter/Sort/Pagination state
  const [search, setSearch] = useState('');
  const [locationType, setLocationType] = useState('');
  const [jobType, setJobType] = useState('');
  const [status, setStatus] = useState('active');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalSavedJobs: 0, limit: 6 });

  // Reset page to 1 on filters change
  useEffect(() => {
    setPage(1);
  }, [search, locationType, jobType, status, sortBy, sortOrder]);

  const fetchSavedJobs = useCallback(() => {
    setLoadingSavedJobs(true);
    savedJobsApi.list({
      page,
      limit: 6,
      search: search || undefined,
      locationType: locationType || undefined,
      jobType: jobType || undefined,
      status: status || undefined,
      sortBy,
      sortOrder
    })
      .then((res) => {
        if (res.success && res.data) {
          setSavedJobs(res.data.savedJobs);
          setPagination(res.data.pagination);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSavedJobs(false));
  }, [page, search, locationType, jobType, status, sortBy, sortOrder]);

  const fetchMyApplications = useCallback(() => {
    applicationsApi.myApplications()
      .then((res) => { if (res.success) setMyApps(res.data.applications); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSavedJobs();
  }, [fetchSavedJobs]);

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);


  const handleToggleSaveJob = async (jobId) => {
    const isSaved = savedJobs.some(s => (s.jobId?._id || s.jobId) === jobId);
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
  };

  const handleApply = async (jobId, coverLetterText, onSuccess) => {
    if (!profile || !profile.resumeUrl) {
      triggerAlert('Please complete your profile and upload a resume PDF first!', 'error');
      navigate('/profile');
      return;
    }
    setSubmittingApplication(true);
    try {
      await applicationsApi.apply(jobId, { coverLetter: coverLetterText });
      triggerAlert('Application submitted successfully!');
      if (onSuccess) onSuccess();
      fetchMyApplications();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmittingApplication(false);
    }
  };

  return (
    <SavedJobs
      user={user}
      profile={profile}
      savedJobs={savedJobs}
      myApps={myApps}
      onToggleSaveJob={handleToggleSaveJob}
      onApply={handleApply}
      submittingApplication={submittingApplication}
      setActiveTab={(tab) => navigate(`/${tab}`)}
      loadingSavedJobs={loadingSavedJobs}
      search={search}
      setSearch={setSearch}
      locationType={locationType}
      setLocationType={setLocationType}
      jobType={jobType}
      setJobType={setJobType}
      status={status}
      setStatus={setStatus}
      sortBy={sortBy}
      setSortBy={setSortBy}
      sortOrder={sortOrder}
      setSortOrder={setSortOrder}
      page={page}
      setPage={setPage}
      pagination={pagination}
    />
  );
}
