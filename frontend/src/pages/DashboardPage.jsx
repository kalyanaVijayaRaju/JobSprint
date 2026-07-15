import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { jobsApi, applicationsApi, savedJobsApi } from '../../api/client.js';
import OverviewTab from '../../components/OverviewTab.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { triggerAlert } = useApp();
  const { profile } = useOutletContext();

  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);

  useEffect(() => {
    if (!user) return;

    if (user.role === 'candidate') {
      jobsApi.list().then(res => { if (res.success) setJobs(res.data.jobs); }).catch(() => {});
      applicationsApi.myApplications().then(res => { if (res.success) setMyApps(res.data.applications); }).catch(() => {});
      savedJobsApi.list().then(res => { if (res.success) setSavedJobs(res.data.savedJobs); }).catch(() => {});
    } else if (user.role === 'recruiter') {
      jobsApi.list().then(res => {
        if (res.success) {
          const filtered = res.data.jobs.filter(j => j.recruiterId === user.id || j.recruiterId?._id === user.id);
          setRecruiterJobs(filtered);
        }
      }).catch(() => {});
    }
  }, [user]);

  const { readiness } = useApp();

  return (
    <OverviewTab
      user={user}
      profile={profile}
      jobsCount={user.role === 'recruiter' ? recruiterJobs.length : jobs.length}
      applicantsCount={user.role === 'recruiter' ? recruiterJobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0) : myApps.length}
      savedCount={savedJobs.length}
      readiness={readiness}
      myApps={myApps}
      recruiterJobs={recruiterJobs}
    />
  );
}
