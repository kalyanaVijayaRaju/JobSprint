import { useEffect, useState } from 'react';
import {
  Activity,
  BriefcaseBusiness,
  UsersRound,
  Bookmark,
  LogOut,
  Clock,
  User
} from 'lucide-react';
import {
  getReadiness,
  authApi,
  jobsApi,
  profileApi,
  applicationsApi,
  savedJobsApi,
  notificationsApi
} from './api/client.js';

// Modular component imports
import AuthScreen from './components/AuthScreen.jsx';
import NotificationsBell from './components/NotificationsBell.jsx';
import OverviewTab from './components/OverviewTab.jsx';
import JobsBoard from './components/JobsBoard.jsx';
import AtsPipeline from './components/AtsPipeline.jsx';
import ProfileSettings from './components/ProfileSettings.jsx';

import './styles.css';

function App() {
  // Session & Global State
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [readiness, setReadiness] = useState({
    loading: true,
    ok: false,
    status: 'CHECKING',
    timestamp: null
  });

  // UI Toast Alerts
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Data collections
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loadingMyApps, setLoadingMyApps] = useState(false);
  const [recruiterJobs, setRecruiterJobs] = useState([]);

  // Recruiter ATS State
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    summary: '',
    skills: '',
    companyId: '',
    jobTitle: ''
  });
  const [resumeUploadStatus, setResumeUploadStatus] = useState(null);
  const [resumeUploadError, setResumeUploadError] = useState(null);

  // Submitting States
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);

  // ---------------------------------------------------------------------------
  // Load Session and Global Status on Mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    getReadiness()
      .then((res) => setReadiness({ loading: false, ...res }))
      .catch(() => setReadiness({ loading: false, ok: false, status: 'OFFLINE', timestamp: null }));

    authApi.getMe()
      .then((res) => {
        if (res.success && res.data.user) {
          setUser(res.data.user);
        }
        setLoadingSession(false);
      })
      .catch(() => {
        setLoadingSession(false);
      });
  }, []);

  // ---------------------------------------------------------------------------
  // Fetch Data on User Login
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    fetchProfile();

    if (user.role === 'candidate') {
      fetchJobs();
      fetchSavedJobs();
      fetchMyApplications();
    } else if (user.role === 'recruiter') {
      fetchRecruiterJobs();
    }

    return () => clearInterval(interval);
  }, [user]);

  // ---------------------------------------------------------------------------
  // Data Fetch Helpers
  // ---------------------------------------------------------------------------
  const triggerAlert = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const fetchNotifications = () => {
    notificationsApi.list({ limit: 10 })
      .then((res) => {
        if (res.success) setNotifications(res.data.notifications);
      })
      .catch(() => {});

    notificationsApi.unreadCount()
      .then((res) => {
        if (res.success) setUnreadCount(res.data.count);
      })
      .catch(() => {});
  };

  const fetchProfile = () => {
    setLoadingProfile(true);
    profileApi.get()
      .then((res) => {
        if (res.success && res.data.profile) {
          setProfile(res.data.profile);
          setProfileForm({
            firstName: res.data.profile.firstName || '',
            lastName: res.data.profile.lastName || '',
            phone: res.data.profile.phone || '',
            summary: res.data.profile.summary || '',
            skills: res.data.profile.skills ? res.data.profile.skills.join(', ') : '',
            companyId: res.data.profile.companyId?._id || res.data.profile.companyId || '',
            jobTitle: res.data.profile.jobTitle || ''
          });
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  };

  const fetchJobs = (filters = {}) => {
    setLoadingJobs(true);
    jobsApi.list(filters)
      .then((res) => {
        if (res.success) setJobs(res.data.jobs);
      })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoadingJobs(false));
  };

  const fetchSavedJobs = () => {
    savedJobsApi.list()
      .then((res) => {
        if (res.success) setSavedJobs(res.data.savedJobs);
      })
      .catch(() => {});
  };

  const fetchMyApplications = () => {
    setLoadingMyApps(true);
    applicationsApi.myApplications()
      .then((res) => {
        if (res.success) setMyApps(res.data.applications);
      })
      .catch(() => {})
      .finally(() => setLoadingMyApps(false));
  };

  const fetchRecruiterJobs = () => {
    jobsApi.list()
      .then((res) => {
        if (res.success) {
          const filtered = res.data.jobs.filter(j => j.recruiterId === user.id || j.recruiterId?._id === user.id);
          setRecruiterJobs(filtered);
        }
      })
      .catch(() => {});
  };

  const fetchJobApplicants = (jobId) => {
    setLoadingApplicants(true);
    applicationsApi.jobApplications(jobId)
      .then((res) => {
        if (res.success) {
          setSelectedJobApplicants(res.data.applications);
        }
      })
      .catch((err) => triggerAlert(err.message, 'error'))
      .finally(() => setLoadingApplicants(false));
  };

  // ---------------------------------------------------------------------------
  // Action Event Handlers
  // ---------------------------------------------------------------------------
  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setProfile(null);
      setJobs([]);
      setMyApps([]);
      setSavedJobs([]);
      setNotifications([]);
      setUnreadCount(0);
      setActiveTab('overview');
      triggerAlert('Logged out successfully');
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

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
      setActiveTab('profile');
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

  const handleProfileSave = async () => {
    setLoadingProfile(true);
    try {
      const data = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone || undefined,
        summary: profileForm.summary || undefined
      };

      if (user.role === 'candidate') {
        data.skills = profileForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        data.companyId = profileForm.companyId || undefined;
        data.jobTitle = profileForm.jobTitle || undefined;
      }

      await profileApi.update(data);
      triggerAlert('Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      triggerAlert(err.message, 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      setResumeUploadStatus('error');
      setResumeUploadError('Only PDF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeUploadStatus('error');
      setResumeUploadError('File exceeds 5MB size limit');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setResumeUploadStatus('uploading');
    setResumeUploadError(null);

    try {
      await profileApi.uploadResume(formData);
      triggerAlert('Resume PDF uploaded and saved!');
      setResumeUploadStatus('success');
      fetchProfile();
    } catch (err) {
      setResumeUploadStatus('error');
      setResumeUploadError(err.message || 'File upload failed');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      fetchNotifications();
      triggerAlert('All notifications marked as read');
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      fetchNotifications();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  };

  // ---------------------------------------------------------------------------
  // Render App Structure
  // ---------------------------------------------------------------------------
  if (loadingSession) {
    return (
      <div className="session-loader">
        <div className="loader-spinner"></div>
        <p>Loading JobSprint Portal...</p>
      </div>
    );
  }

  // Redirect to Auth Gateway if session not active
  if (!user) {
    return <AuthScreen setUser={setUser} readiness={readiness} />;
  }

  return (
    <div className="app-shell">
      {successMsg && <div className="alert success-toast">{successMsg}</div>}
      {errorMsg && <div className="alert error-toast">{errorMsg}</div>}

      {/* Sidebar Navigation */}
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">JS</span>
          <span>JobSprint</span>
        </div>

        <div className="user-context">
          <div className="user-avatar">
            {profile?.firstName ? `${profile.firstName[0]}${profile.lastName[0]}` : user.email[0].toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email.split('@')[0]}
            </span>
            <span className="user-role">{user.role}</span>
          </div>
        </div>

        <nav className="nav-list">
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} /> Overview
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <BriefcaseBusiness size={18} /> {user.role === 'recruiter' ? 'My Job Posts' : 'Find Jobs'}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <Clock size={18} /> {user.role === 'recruiter' ? 'ATS Pipelines' : 'Applications'}
          </button>
          <button
            type="button"
            className={`nav-link-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={18} /> Profile settings
          </button>
        </nav>

        <button type="button" className="btn btn-outline logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Log Out
        </button>
      </aside>

      {/* Workspace Area */}
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Recruiting workspace</p>
            <h1>
              {activeTab === 'overview' && 'Operations dashboard'}
              {activeTab === 'jobs' && (user.role === 'recruiter' ? 'Job Listings Board' : 'Discover Careers')}
              {activeTab === 'applications' && (user.role === 'recruiter' ? 'ATS Candidate Pipelines' : 'Applied Jobs Tracker')}
              {activeTab === 'profile' && 'Professional Profile'}
            </h1>
          </div>

          <div className="header-actions">
            {/* Header Notifications Dropdown */}
            <NotificationsBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onMarkRead={handleMarkNotificationRead}
            />

            <div className={`status-pill ${readiness.ok ? 'ready' : 'not-ready'}`}>
              <Activity size={18} aria-hidden="true" />
              <span>{readiness.loading ? 'Checking API' : readiness.status}</span>
            </div>
          </div>
        </header>

        {/* Tab Route Switching */}
        {activeTab === 'overview' && (
          <OverviewTab
            user={user}
            profile={profile}
            jobsCount={user.role === 'recruiter' ? recruiterJobs.length : jobs.length}
            applicantsCount={user.role === 'recruiter' ? recruiterJobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0) : myApps.length}
            savedCount={savedJobs.length}
            readiness={readiness}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsBoard
            user={user}
            profile={profile}
            jobs={jobs}
            loadingJobs={loadingJobs}
            savedJobs={savedJobs}
            recruiterJobs={recruiterJobs}
            onSearch={fetchJobs}
            onToggleSaveJob={handleToggleSaveJob}
            onApply={handleApplySubmit}
            onPostJob={handleCreateJob}
            submittingApplication={submittingApplication}
            submittingJob={submittingJob}
            setActiveTab={setActiveTab}
            setSelectedJobForApplicants={setSelectedJobForApplicants}
            fetchJobApplicants={fetchJobApplicants}
          />
        )}

        {activeTab === 'applications' && (
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
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings
            user={user}
            profile={profile}
            loadingProfile={loadingProfile}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            onSaveProfile={handleProfileSave}
            onResumeUpload={handleResumeUpload}
            resumeUploadStatus={resumeUploadStatus}
            resumeUploadError={resumeUploadError}
          />
        )}
      </section>
    </div>
  );
}

export default App;
