import { BriefcaseBusiness, FileText, Bookmark, UsersRound } from 'lucide-react';
import { Card } from '../ui';

/**
 * Top statistics metric cards grid for candidate/recruiter dashboard overview.
 */
export default function StatsGrid({
  user,
  jobsCount = 0,
  applicantsCount = 0,
  savedCount = 0,
}) {
  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '32px' }}>
      <Card variant="elevated">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BriefcaseBusiness size={24} />
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
              {user.role === 'recruiter' ? 'Active Jobs Posted' : 'Open Jobs'}
            </span>
            <h3 style={{ fontSize: '28px', fontWeight: '800', margin: '2px 0 0' }}>{jobsCount}</h3>
          </div>
        </div>
      </Card>

      <Card variant="elevated">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--color-accent-light)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.role === 'recruiter' ? <UsersRound size={24} /> : <FileText size={24} />}
          </div>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
              {user.role === 'recruiter' ? 'Total Candidates' : 'My Applications'}
            </span>
            <h3 style={{ fontSize: '28px', fontWeight: '800', margin: '2px 0 0' }}>{applicantsCount}</h3>
          </div>
        </div>
      </Card>

      {user.role === 'candidate' && (
        <Card variant="elevated">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'var(--color-warning-light)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bookmark size={24} />
            </div>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Saved Jobs
              </span>
              <h3 style={{ fontSize: '28px', fontWeight: '800', margin: '2px 0 0' }}>{savedCount}</h3>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
