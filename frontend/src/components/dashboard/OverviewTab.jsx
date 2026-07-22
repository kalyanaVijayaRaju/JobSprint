import StatsGrid from './StatsGrid.jsx';
import ApplicationFunnel from './ApplicationFunnel.jsx';
import RecentActivity from './RecentActivity.jsx';

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
}) {
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
          marginBottom: '32px',
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px', color: '#ffffff' }}>
          Welcome back, {profile?.firstName || user?.email?.split('@')[0] || 'User'}! 👋
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
          {user.role === 'recruiter'
            ? 'Manage your active job listings, review applicant pipelines, and advance talent.'
            : 'Explore top tech roles, track your application progress, and manage your career profile.'}
        </p>
      </div>

      {/* Stats Cards */}
      <StatsGrid
        user={user}
        jobsCount={jobsCount}
        applicantsCount={applicantsCount}
        savedCount={savedCount}
      />

      {/* Application Funnel Chart */}
      {applicationSummary && <ApplicationFunnel summary={applicationSummary} />}

      {/* Recent Activity Table */}
      <RecentActivity user={user} myApps={myApps} recruiterJobs={recruiterJobs} />
    </div>
  );
}
