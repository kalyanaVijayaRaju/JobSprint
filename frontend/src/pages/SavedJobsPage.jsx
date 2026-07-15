import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { savedJobsApi, applicationsApi } from '../../api/client.js';
import SavedJobs from '../../components/SavedJobs.jsx';

export default function SavedJobsPage() {
  const { user } = useAuth();
  const { triggerAlert } = useApp();
  const { profile } = useOutletContext();
  const navigate = useNavigate();

  const [savedJobs, setSavedJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [submittingApplication, setSubmittingApplication] = useState(false);

  const fetchSavedJobs = useCallback(() => {
    savedJobsApi.list()
      .then((res) => { if (res.success) setSavedJobs(res.data.savedJobs); })
      .catch(() => {});
  }, []);

  const fetchMyApplications = useCallback(() => {
    applicationsApi.myApplications()
      .then((res) => { if (res.success) setMyApps(res.data.applications); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchSavedJobs();
    fetchMyApplications();
  }, [fetchSavedJobs, fetchMyApplications]);

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
    />
  );
}
