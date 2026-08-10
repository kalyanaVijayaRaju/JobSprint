import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import { jobsApi, applicationsApi, savedJobsApi } from '../api/client.js';
import OverviewTab from '../components/dashboard/OverviewTab.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const { profile } = useOutletContext();

  const [jobs, setJobs] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [applicationSummary, setApplicationSummary] = useState(null);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);

  const loadApplicationSummary = useCallback(() => {
    applicationsApi.summary()
      .then((res) => {
        if (res?.success && res?.data) setApplicationSummary(res.data.summary || null);
      })
      .catch(() => setApplicationSummary(null));
  }, []);

  const loadUpcomingInterviews = useCallback(() => {
    applicationsApi.upcomingInterviews()
      .then((res) => {
        if (res?.success && res?.data) setUpcomingInterviews(res.data.interviews || []);
      })
      .catch(() => setUpcomingInterviews([]));
  }, []);

  useEffect(() => {
    if (!user) return;

    if (user?.role === 'candidate' || user?.role === 'recruiter') {
      loadApplicationSummary();
      loadUpcomingInterviews();
    }

    if (user?.role === 'candidate') {
      jobsApi.list()
        .then((res) => { if (res?.success && res?.data?.jobs) setJobs(res.data.jobs); })
        .catch(() => setJobs([]));
      applicationsApi.myApplications()
        .then((res) => { if (res?.success && res?.data?.applications) setMyApps(res.data.applications); })
        .catch(() => setMyApps([]));
      savedJobsApi.list()
        .then((res) => { if (res?.success && res?.data?.savedJobs) setSavedJobs(res.data.savedJobs); })
        .catch(() => setSavedJobs([]));
    } else if (user?.role === 'recruiter') {
      jobsApi.list()
        .then((res) => {
          if (res?.success && Array.isArray(res?.data?.jobs)) {
            const filtered = res.data.jobs.filter(
              (j) => j.recruiterId === user.id || j.recruiterId?._id === user.id
            );
            setRecruiterJobs(filtered);
          }
        })
        .catch(() => setRecruiterJobs([]));
    }
  }, [user, loadApplicationSummary, loadUpcomingInterviews]);

  const { readiness } = useApp();

  const isRecruiter = user?.role === 'recruiter';
  const jobsCount = isRecruiter ? (recruiterJobs?.length || 0) : (jobs?.length || 0);
  const applicantsCount = applicationSummary?.total ?? (
    isRecruiter
      ? (recruiterJobs?.reduce((acc, j) => acc + (j?.applicationsCount || 0), 0) || 0)
      : (myApps?.length || 0)
  );

  return (
    <OverviewTab
      user={user || {}}
      profile={profile || null}
      jobsCount={jobsCount}
      applicantsCount={applicantsCount}
      savedCount={savedJobs?.length || 0}
      readiness={readiness}
      myApps={myApps || []}
      recruiterJobs={recruiterJobs || []}
      applicationSummary={applicationSummary}
      upcomingInterviews={upcomingInterviews || []}
    />
  );
}
