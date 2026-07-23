import { BriefcaseBusiness, FileText, Bookmark, UsersRound, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../ui';

/**
 * Top statistics metric cards grid for candidate/recruiter dashboard overview.
 */
export default function StatsGrid({
  user,
  jobsCount = 0,
  applicantsCount = 0,
  savedCount = 0,
  interviewsCount = 0,
}) {
  return (
    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '32px' }}>
      <Card variant="elevated">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#10b981', background: '#ecfdf5', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
            <TrendingUp size={12} /> Active
          </span>
        </div>
      </Card>

      <Card variant="elevated">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#3b82f6', background: '#eff6ff', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
            Live
          </span>
        </div>
      </Card>

      <Card variant="elevated">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <Calendar size={24} />
            </div>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                Upcoming Interviews
              </span>
              <h3 style={{ fontSize: '28px', fontWeight: '800', margin: '2px 0 0' }}>{interviewsCount}</h3>
            </div>
          </div>
          {interviewsCount > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '11px', color: '#8b5cf6', background: '#f5f3ff', padding: '3px 8px', borderRadius: '12px', fontWeight: '700' }}>
              Scheduled
            </span>
          )}
        </div>
      </Card>

      {user.role === 'candidate' && (
        <Card variant="elevated">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'var(--color-success-light)',
                  color: 'var(--color-success)',
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
          </div>
        </Card>
      )}
    </div>
  );
}
