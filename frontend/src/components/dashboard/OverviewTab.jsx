import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Clock } from 'lucide-react';
import StatsGrid from './StatsGrid.jsx';
import ApplicationFunnel from './ApplicationFunnel.jsx';
import RecentActivity from './RecentActivity.jsx';
import UpcomingInterviews from './UpcomingInterviews.jsx';
import ProfileCompleteness from './ProfileCompleteness.jsx';
import RecommendedJobs from './RecommendedJobs.jsx';
import { analyticsApi } from '../../api/client.js';
import { Button } from '../ui';

/**
 * Main OverviewTab component for the dashboard homepage.
 */
export default function OverviewTab({
  user,
  profile,
  jobsCount = 0,
  applicantsCount = 0,
  savedCount = 0,
  readiness,
  myApps = [],
  recruiterJobs = [],
  applicationSummary = null,
  upcomingInterviews = [],
}) {
  const navigate = useNavigate();
  const [candidateAnalytics, setCandidateAnalytics] = useState(null);

  useEffect(() => {
    if (user?.role === 'candidate') {
      analyticsApi.candidate()
        .then((res) => {
          if (res.success && res.data) setCandidateAnalytics(res.data.analytics);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <div className="tab-content">
      {/* Welcome Banner */}
      <div
        className="welcome-banner"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '32px 36px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px', color: '#ffffff' }}>
            Welcome back, {profile?.firstName || user?.email?.split('@')[0] || 'User'}! 👋
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
            {user.role === 'recruiter'
              ? 'Manage your active job listings, review applicant pipelines, and schedule interviews.'
              : 'Explore top tech roles, track your application progress, and manage your career profile.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {user.role === 'recruiter' ? (
            <Button
              variant="outline"
              icon={<Plus size={16} />}
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
              onClick={() => navigate('/jobs')}
            >
              Post Job
            </Button>
          ) : (
            <Button
              variant="outline"
              icon={<Search size={16} />}
              style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
              onClick={() => navigate('/jobs')}
            >
              Find Jobs
            </Button>
          )}
          <Button
            variant="outline"
            icon={<Clock size={16} />}
            style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            onClick={() => navigate('/applications')}
          >
            {user.role === 'recruiter' ? 'ATS Pipelines' : 'My Applications'}
          </Button>
        </div>
      </div>

      {/* Candidate Profile Strength Widget */}
      {user.role === 'candidate' && candidateAnalytics?.profileCompleteness && (
        <ProfileCompleteness completeness={candidateAnalytics.profileCompleteness} />
      )}

      {/* Candidate Job Recommendations Widget */}
      {user.role === 'candidate' && candidateAnalytics?.recommendations && (
        <RecommendedJobs recommendations={candidateAnalytics.recommendations} />
      )}

      {/* Stats Cards */}
      <StatsGrid
        user={user}
        jobsCount={jobsCount}
        applicantsCount={applicantsCount}
        savedCount={savedCount}
        interviewsCount={upcomingInterviews.length}
      />

      {/* Upcoming Interviews Widget */}
      <UpcomingInterviews upcomingInterviews={upcomingInterviews} />

      {/* Application Funnel Chart */}
      {applicationSummary && <ApplicationFunnel summary={applicationSummary} />}

      {/* Recent Activity Table */}
      <RecentActivity user={user} myApps={myApps} recruiterJobs={recruiterJobs} />
    </div>
  );
}

