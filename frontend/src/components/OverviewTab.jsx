import { Briefcase, UsersRound, Bookmark } from 'lucide-react';

export default function OverviewTab({
  user,
  profile,
  jobsCount,
  applicantsCount,
  savedCount,
  readiness,
  myApps = [],
  recruiterJobs = []
}) {
  // Candidate Metrics
  const totalApps = myApps.length;
  const progressedApps = myApps.filter(a => a.status !== 'applied').length;
  const successRate = totalApps > 0 ? Math.round((progressedApps / totalApps) * 100) : 0;

  const appliedCount = myApps.filter(a => a.status === 'applied').length;
  const screeningCount = myApps.filter(a => a.status === 'screening').length;
  const interviewingCount = myApps.filter(a => a.status === 'interviewing').length;
  const offeredCount = myApps.filter(a => a.status === 'offered').length;
  const rejectedCount = myApps.filter(a => a.status === 'rejected').length;

  // Recruiter Metrics
  const activePostings = recruiterJobs.filter(j => j.status === 'active').length;
  const closedPostings = recruiterJobs.filter(j => j.status === 'closed').length;

  // Render Candidate Analytics
  const renderCandidateAnalytics = () => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (successRate / 100) * circumference;

    return (
      <div className="analytics-section">
        <h3>Application Activity Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-card progress-ring-card">
            <h4>Profile Progress Strength</h4>
            <div className="progress-ring-container">
              <svg width="120" height="120" viewBox="0 0 120 120" className="progress-ring-svg">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
                <text x="60" y="66" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#0f172a">
                  {successRate}%
                </text>
              </svg>
              <div className="progress-ring-label">
                <strong>{progressedApps} of {totalApps}</strong>
                <span>progressed past initial submission</span>
              </div>
            </div>
          </div>

          <div className="analytics-card funnel-card">
            <h4>Status Funnel Overview</h4>
            <div className="funnel-bars">
              {[
                { name: 'Applied', count: appliedCount, color: '#6366f1' },
                { name: 'Screening', count: screeningCount, color: '#f59e0b' },
                { name: 'Interviewing', count: interviewingCount, color: '#0ea5e9' },
                { name: 'Offered', count: offeredCount, color: '#10b981' },
                { name: 'Rejected', count: rejectedCount, color: '#ef4444' }
              ].map(stage => {
                const percentage = totalApps > 0 ? (stage.count / totalApps) * 100 : 0;
                return (
                  <div key={stage.name} className="funnel-row">
                    <span className="funnel-label">{stage.name} ({stage.count})</span>
                    <div className="funnel-bar-bg">
                      <div
                        className="funnel-bar-fill"
                        style={{
                          width: `${Math.max(percentage, stage.count > 0 ? 8 : 0)}%`,
                          backgroundColor: stage.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Recruiter Analytics
  const renderRecruiterAnalytics = () => {
    const maxApplicants = Math.max(...recruiterJobs.map(j => j.applicationsCount || 0), 1);
    const topJobs = recruiterJobs.slice(0, 5); // display top 5 jobs for space

    return (
      <div className="analytics-section">
        <h3>Applicant Volume Analytics</h3>
        <div className="analytics-grid">
          <div className="analytics-card chart-card">
            <h4>Candidate Volume by Role (Top 5 Listings)</h4>
            {topJobs.length === 0 ? (
              <p className="no-data-text">Post a job opening to see applicant volumes.</p>
            ) : (
              <div className="svg-chart-container">
                <svg width="100%" height="220" viewBox="0 0 400 220" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="40" y1="170" x2="380" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                  {/* Bars */}
                  {topJobs.map((job, idx) => {
                    const count = job.applicationsCount || 0;
                    const barWidth = 35;
                    const spacing = (340 / topJobs.length);
                    const x = 50 + idx * spacing + (spacing - barWidth) / 2;
                    const height = (count / maxApplicants) * 140;
                    const y = 170 - height;

                    return (
                      <g key={job._id}>
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={height}
                          fill="url(#barGradient)"
                          rx="4"
                          className="chart-bar-rect"
                        />
                        {/* Count Text */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="#0f766e"
                        >
                          {count}
                        </text>
                        {/* Role short name */}
                        <text
                          x={x + barWidth / 2}
                          y="190"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          fill="#475569"
                        >
                          {job.title.length > 12 ? `${job.title.substring(0, 10)}...` : job.title}
                        </text>
                      </g>
                    );
                  })}

                  {/* Gradients */}
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          <div className="analytics-card breakdown-card">
            <h4>Listing Breakdown</h4>
            <div className="breakdown-stats">
              <div className="breakdown-stat-row">
                <span>Active Listings</span>
                <strong className="status-text-active">{activePostings}</strong>
              </div>
              <div className="breakdown-stat-row">
                <span>Closed Listings</span>
                <strong className="status-text-closed">{closedPostings}</strong>
              </div>
              <div className="breakdown-stat-row">
                <span>Total Applications Received</span>
                <strong>{applicantsCount}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content">
      <section className="summary-grid" aria-label="Workspace summary">
        <article className="metric-card">
          <div className="metric-icon">
            <Briefcase size={20} aria-hidden="true" />
          </div>
          <p>Open roles</p>
          <strong>{jobsCount}</strong>
          <span>{user.role === 'recruiter' ? 'Published by you' : 'Active job opportunities'}</span>
        </article>
        <article className="metric-card">
          <div className="metric-icon">
            <UsersRound size={20} aria-hidden="true" />
          </div>
          <p>{user.role === 'recruiter' ? 'Active applicants' : 'Applied applications'}</p>
          <strong>{applicantsCount}</strong>
          <span>{user.role === 'recruiter' ? 'Awaiting reviews' : 'Under pipeline review'}</span>
        </article>
        <article className="metric-card">
          <div className="metric-icon">
            <Bookmark size={20} aria-hidden="true" />
          </div>
          <p>{user.role === 'recruiter' ? 'Company' : 'Saved Bookmarks'}</p>
          <strong>{user.role === 'recruiter' ? (profile?.companyId?.name || 'Pending assignment') : savedCount}</strong>
          <span>{user.role === 'recruiter' ? 'Verified employer entity' : 'Jobs bookmarked for later'}</span>
        </article>
      </section>

      {/* Embedded SVG Visualizations */}
      {user.role === 'recruiter' ? renderRecruiterAnalytics() : renderCandidateAnalytics()}

      <section className="panel">
        <div>
          <p className="eyebrow">Role context</p>
          <h2>Welcome, {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user.email}!</h2>
          <p>
            You are signed in as a <strong>{user.role}</strong>. Customize your profile settings, manage applications, and review updates in real time.
          </p>
        </div>
        <dl className="readiness-list">
          <div>
            <dt>Server Endpoint</dt>
            <dd>/health/ready</dd>
          </div>
          <div>
            <dt>Last API Ping</dt>
            <dd>{readiness.timestamp || 'Not available'}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
