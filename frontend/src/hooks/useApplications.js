import { useState, useCallback } from 'react';
import { applicationsApi } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

/**
 * Custom hook for managing candidate/recruiter applications and status updates.
 */
export function useApplications() {
  const { triggerAlert } = useApp();

  const [myApps, setMyApps] = useState([]);
  const [loadingMyApps, setLoadingMyApps] = useState(false);
  const [applicationSummary, setApplicationSummary] = useState(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [withdrawingApplicationId, setWithdrawingApplicationId] = useState(null);

  // Fetch candidate's own applications
  const fetchMyApplications = useCallback(() => {
    setLoadingMyApps(true);
    applicationsApi.myApplications()
      .then((res) => {
        if (res.success) setMyApps(res.data.applications);
      })
      .catch(() => {})
      .finally(() => setLoadingMyApps(false));
  }, []);

  // Fetch application summary stats
  const fetchApplicationSummary = useCallback(() => {
    applicationsApi.summary()
      .then((res) => {
        if (res.success) setApplicationSummary(res.data.summary);
      })
      .catch(() => setApplicationSummary(null));
  }, []);

  // Fetch applicants for a specific job (recruiter)
  const fetchJobApplicants = useCallback((jobId) => {
    if (!jobId) return;
    setLoadingApplicants(true);
    applicationsApi.jobApplications(jobId)
      .then((res) => {
        if (res.success) setSelectedJobApplicants(res.data.applications);
      })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoadingApplicants(false));
  }, [triggerAlert]);

  // Submit job application (candidate)
  const handleApplySubmit = useCallback(async (jobId, coverLetterText, profile, navigate, onSuccess) => {
    if (!profile || !profile.resumeUrl) {
      triggerAlert('Please complete your profile and upload a resume PDF first!', 'error');
      if (navigate) navigate('/profile');
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
  }, [fetchMyApplications, triggerAlert]);

  // Update application status (recruiter)
  const handleUpdateStatus = useCallback(async (appId, newStatus) => {
    try {
      await applicationsApi.updateStatus(appId, newStatus);
      triggerAlert(`Application status updated to ${newStatus}`);
      setSelectedJobApplicants((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  }, [triggerAlert]);

  // Add recruiter note
  const handleAddNote = useCallback(async (appId, noteText, onSuccess) => {
    setSubmittingNote(true);
    try {
      const res = await applicationsApi.addNote(appId, noteText);
      triggerAlert('Note added successfully');
      if (res.success && res.data?.application) {
        const updatedApp = res.data.application;
        setSelectedJobApplicants((prev) =>
          prev.map((app) => (app._id === appId ? updatedApp : app))
        );
        if (onSuccess) onSuccess(updatedApp);
      }
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setSubmittingNote(false);
    }
  }, [triggerAlert]);

  // Withdraw application (candidate)
  const handleWithdraw = useCallback(async (appId) => {
    setWithdrawingApplicationId(appId);
    try {
      await applicationsApi.withdraw(appId);
      triggerAlert('Application withdrawn');
      fetchMyApplications();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setWithdrawingApplicationId(null);
    }
  }, [fetchMyApplications, triggerAlert]);

  return {
    myApps,
    loadingMyApps,
    applicationSummary,
    submittingApplication,
    selectedJobApplicants,
    loadingApplicants,
    submittingNote,
    withdrawingApplicationId,
    fetchMyApplications,
    fetchApplicationSummary,
    fetchJobApplicants,
    handleApplySubmit,
    handleUpdateStatus,
    handleAddNote,
    handleWithdraw,
  };
}

export default useApplications;
