import { Briefcase, UsersRound, Bookmark } from 'lucide-react';

export default function OverviewTab({
  user,
  profile,
  jobsCount,
  applicantsCount,
  savedCount,
  readiness
}) {
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
