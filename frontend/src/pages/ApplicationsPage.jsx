import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { jobsApi, applicationsApi } from '../../api/client.js';
import AtsPipeline from '../../components/AtsPipeline.jsx';

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
      setActiveTab={(tab) => navigate(`/${tab === 'jobs' ? 'jobs' : tab}`)}
    />
  );
}
