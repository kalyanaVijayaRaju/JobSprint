import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { jobsApi, applicationsApi } from '../api/client.js';
import AtsPipeline from '../components/applications/AtsPipeline.jsx';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { triggerAlert } = useApp();
  const navigate = useNavigate();

  const [myApps, setMyApps] = useState([]);
  const [loadingMyApps, setLoadingMyApps] = useState(false);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [withdrawingApplicationId, setWithdrawingApplicationId] = useState(null);

  const fetchMyApplications = useCallback(() => {
    setLoadingMyApps(true);
    applicationsApi.myApplications()
      .then((res) => { if (res.success) setMyApps(res.data.applications); })
      .catch(() => {})
      .finally(() => setLoadingMyApps(false));
  }, []);

  const fetchRecruiterJobs = useCallback(() => {
    jobsApi.list().then((res) => {
      if (res.success) {
        const filtered = res.data.jobs.filter(j => j.recruiterId === user.id || j.recruiterId?._id === user.id);
        setRecruiterJobs(filtered);
      }
    }).catch(() => {});
  }, [user]);

  const fetchJobApplicants = useCallback((jobId) => {
    setLoadingApplicants(true);
    applicationsApi.jobApplications(jobId)
      .then((res) => { if (res.success) setSelectedJobApplicants(res.data.applications); })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoadingApplicants(false));
  }, [triggerAlert]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'candidate') {
      fetchMyApplications();
    } else if (user.role === 'recruiter') {
      fetchRecruiterJobs();
    }
  }, [user, fetchMyApplications, fetchRecruiterJobs]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      triggerAlert(`Application status updated to ${newStatus}`);
      if (selectedJobForApplicants) {
        fetchJobApplicants(selectedJobForApplicants._id);
      }
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  const handleAddNote = async (appId, noteText, onSuccess) => {
    setSubmittingNote(true);
    try {
      const res = await applicationsApi.addNote(appId, noteText);
      triggerAlert('Note added successfully');
      if (onSuccess) {
        onSuccess(res.data.application || {
          ...selectedJobApplicants.find(a => a._id === appId),
          recruiterNotes: res.data.notes
        });
      }
      if (selectedJobForApplicants) {
        fetchJobApplicants(selectedJobForApplicants._id);
      }
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleWithdraw = async (application) => {
    const jobTitle = application.jobId?.title || 'this application';
    if (!window.confirm(`Withdraw your application for ${jobTitle}? This action cannot be undone.`)) return;

    setWithdrawingApplicationId(application._id);
    try {
      await applicationsApi.withdraw(application._id);
      triggerAlert('Application withdrawn successfully');
      fetchMyApplications();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setWithdrawingApplicationId(null);
    }
  };

  const [submittingInterview, setSubmittingInterview] = useState(false);
  const [submittingResponseId, setSubmittingResponseId] = useState(null);
  const [applicationInterviews, setApplicationInterviews] = useState({});

  const handleScheduleInterview = async (appId, interviewData, existingInterviewId) => {
    setSubmittingInterview(true);
    try {
      if (existingInterviewId) {
        await applicationsApi.updateInterview(appId, existingInterviewId, interviewData);
        triggerAlert('Interview rescheduled successfully');
      } else {
        await applicationsApi.scheduleInterview(appId, interviewData);
        triggerAlert('Interview invitation sent to candidate!');
      }

      // Fetch fresh interviews for this application
      const res = await applicationsApi.getInterviews(appId);
      if (res.success) {
        setApplicationInterviews((prev) => ({ ...prev, [appId]: res.data.interviews }));
      }

      if (selectedJobForApplicants) {
        fetchJobApplicants(selectedJobForApplicants._id);
      }
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmittingInterview(false);
    }
  };

  const handleRespondToInterview = async (appId, interviewId, responseStatus, candidateNotes) => {
    setSubmittingResponseId(interviewId);
    try {
      await applicationsApi.respondToInterview(appId, interviewId, {
        candidateResponseStatus: responseStatus,
        candidateNotes
      });
      triggerAlert(`Interview invitation ${responseStatus.replace('_', ' ')}!`);
      fetchMyApplications();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmittingResponseId(null);
    }
  };

  return (
    <AtsPipeline
      user={user}
      selectedJobForApplicants={selectedJobForApplicants}
      setSelectedJobForApplicants={setSelectedJobForApplicants}
      recruiterJobs={recruiterJobs}
      selectedJobApplicants={selectedJobApplicants}
      loadingApplicants={loadingApplicants}
      onUpdateStatus={handleUpdateStatus}
      onAddNote={handleAddNote}
      submittingNote={submittingNote}
      fetchJobApplicants={fetchJobApplicants}
      myApps={myApps}
      loadingMyApps={loadingMyApps}
      onWithdraw={handleWithdraw}
      withdrawingApplicationId={withdrawingApplicationId}
      setActiveTab={(tab) => navigate(`/${tab === 'jobs' ? 'jobs' : tab}`)}
      onScheduleInterview={handleScheduleInterview}
      onRespondToInterview={handleRespondToInterview}
      submittingInterview={submittingInterview}
      submittingResponseId={submittingResponseId}
      applicationInterviews={applicationInterviews}
    />
  );
}
