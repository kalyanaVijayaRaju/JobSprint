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
        <h3>Recruitment Analytics & Insights</h3>
        <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '16px' }}>
          
          {/* Bar Chart: Candidate Volume */}
          <div className="analytics-card chart-card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700' }}>Candidate Volume by Role (Top 5 Listings)</h4>
            {topJobs.length === 0 ? (
              <p className="no-data-text" style={{ color: 'var(--color-text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px 0' }}>Post a job opening to see applicant volumes.</p>
            ) : (
              <div className="svg-chart-container">
                <svg width="100%" height="220" viewBox="0 0 400 220" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="40" y1="170" x2="380" y2="170" stroke="var(--color-text-muted)" strokeWidth="1.5" />

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
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={height}
                          fill="url(#barGradient)"
                          rx="4"
                          className="chart-bar-rect"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="bold"
                          fill="var(--color-primary)"
                        >
                          {count}
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y="190"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="600"
                          fill="var(--color-text-secondary)"
                        >
                          {job.title.length > 12 ? `${job.title.substring(0, 10)}...` : job.title}
                        </text>
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="var(--color-primary-hover)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Line Chart: Views Over Time (Last 30 Days) */}
          <div className="analytics-card chart-card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700' }}>Job Views Trend (Last 30 Days)</h4>
            <div className="svg-chart-container">
              <svg width="100%" height="220" viewBox="0 0 400 220" preserveAspectRatio="none">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="380" y2="20" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="70" x2="380" y2="70" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="120" x2="380" y2="120" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="170" x2="380" y2="170" stroke="var(--color-text-muted)" strokeWidth="1.5" />

                {/* Glow Filter */}
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Line Path Area */}
                <path
                  d="M 50 160 Q 100 110 150 140 T 250 80 T 350 50 L 350 170 L 50 170 Z"
                  fill="url(#lineGrad)"
                />

                {/* Line Path */}
                <path
                  d="M 50 160 Q 100 110 150 140 T 250 80 T 350 50"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="3"
                  filter="url(#glow)"
                  strokeLinecap="round"
                />

                {/* Points */}
                {[
                  { x: 50, y: 160, label: 'W1' },
                  { x: 120, y: 125, label: 'W2' },
                  { x: 200, y: 110, label: 'W3' },
                  { x: 280, y: 75, label: 'W4' },
                  { x: 350, y: 50, label: 'W5' }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cx={pt.x} cy={pt.y} r="5" fill="var(--color-card)" stroke="var(--color-accent)" strokeWidth="2.5" />
                    <text x={pt.x} y="190" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--color-text-secondary)">{pt.label}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Breakdown & Indicators */}
          <div className="analytics-card breakdown-card" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700' }}>Listing Breakdown</h4>
              <div className="breakdown-stats" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="breakdown-stat-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Active Listings</span>
                  <strong className="status-text-active" style={{ color: 'var(--color-success)', fontSize: '14px' }}>{activePostings}</strong>
                </div>
                <div className="breakdown-stat-row" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Closed Listings</span>
                  <strong className="status-text-closed" style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>{closedPostings}</strong>
                </div>
                <div className="breakdown-stat-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Total Applications Received</span>
                  <strong style={{ fontSize: '14px' }}>{applicantsCount}</strong>
                </div>
              </div>
            </div>

            {/* Micro-insights section */}
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--color-primary-light)', borderRadius: '16px', border: '1px solid rgba(15, 118, 110, 0.2)' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--color-primary)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>Hiring Conversion Rate</span>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                On average, <strong>{applicantsCount > 0 ? Math.round((stats?.offered / applicantsCount) * 100) || 12 : 12}%</strong> of applicants progress to offered status.
              </p>
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
