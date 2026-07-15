import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { jobsApi, applicationsApi, savedJobsApi } from '../../api/client.js';
import JobsBoard from '../../components/JobsBoard.jsx';

export default function JobsPage() {
  const { user } = useAuth();
  const { triggerAlert } = useApp();
  const { profile } = useOutletContext();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [myApps, setMyApps] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);

  const fetchJobs = useCallback((filters = {}) => {
    setLoadingJobs(true);
    jobsApi.list(filters)
      .then((res) => { if (res.success) setJobs(res.data.jobs); })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoadingJobs(false));
  }, [triggerAlert]);

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

  const fetchRecruiterJobs = useCallback(() => {
    jobsApi.list().then((res) => {
      if (res.success) {
        const filtered = res.data.jobs.filter(j => j.recruiterId === user.id || j.recruiterId?._id === user.id);
        setRecruiterJobs(filtered);
      }
    }).catch(() => {});
  }, [user]);

  const fetchJobApplicants = useCallback(() => {}, []);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'candidate') {
      fetchJobs();
      fetchSavedJobs();
      fetchMyApplications();
    } else if (user.role === 'recruiter') {
      fetchRecruiterJobs();
    }
  }, [user, fetchJobs, fetchSavedJobs, fetchMyApplications, fetchRecruiterJobs]);

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

  const handleApplySubmit = async (jobId, coverLetterText, onSuccess) => {
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

  const handleCreateJob = async (jobFormValues, onSuccess) => {
    setSubmittingJob(true);
    try {
      const jobData = {
        title: jobFormValues.title,
        description: jobFormValues.description,
        requirements: jobFormValues.requirements.split('\n').filter(r => r.trim()),
        skillsRequired: jobFormValues.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
        locationType: jobFormValues.locationType,
        location: jobFormValues.location,
        salaryRange: {
          min: Number(jobFormValues.salaryMin) || undefined,
          max: Number(jobFormValues.salaryMax) || undefined,
          currency: jobFormValues.salaryCurrency
        },
        jobType: jobFormValues.jobType,
        expiresAt: jobFormValues.expiresAt ? new Date(jobFormValues.expiresAt).toISOString() : new Date(Date.now() + 30*24*60*60*1000).toISOString()
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
  };

  const handleUpdateJob = async (jobId, data) => {
    try {
      await jobsApi.update(jobId, data);
      triggerAlert('Job status updated successfully');
      if (user.role === 'recruiter') fetchRecruiterJobs(); else fetchJobs();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await jobsApi.delete(jobId);
      triggerAlert('Job archived successfully');
      if (user.role === 'recruiter') fetchRecruiterJobs(); else fetchJobs();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  return (
    <JobsBoard
      user={user}
      profile={profile}
      jobs={jobs}
      myApps={myApps}
      loadingJobs={loadingJobs}
      savedJobs={savedJobs}
      recruiterJobs={recruiterJobs}
      onSearch={fetchJobs}
      onToggleSaveJob={handleToggleSaveJob}
      onApply={handleApplySubmit}
      onPostJob={handleCreateJob}
      onUpdateJob={handleUpdateJob}
      onDeleteJob={handleDeleteJob}
      submittingApplication={submittingApplication}
      submittingJob={submittingJob}
      setActiveTab={(tab) => navigate(`/${tab === 'profile' ? 'profile' : tab}`)}
      setSelectedJobForApplicants={setSelectedJobForApplicants}
      fetchJobApplicants={fetchJobApplicants}
    />
  );
}
