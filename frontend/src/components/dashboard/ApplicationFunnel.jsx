import { useNavigate } from 'react-router-dom';
import { Filter, TrendingUp } from 'lucide-react';
import { Card, Badge } from '../ui';

/**
 * Enhanced Application pipeline status breakdown funnel chart for recruiter/candidate dashboards.
 */
export default function ApplicationFunnel({ summary }) {
  const navigate = useNavigate();

  if (!summary || !summary.byStatus) return null;

  const statusConfig = {
    applied: { color: '#6366f1', label: 'Applied', bg: '#e0e7ff' },
    screening: { color: '#f59e0b', label: 'Screening', bg: '#fef3c7' },
    interviewing: { color: '#0ea5e9', label: 'Interviewing', bg: '#e0f2fe' },
    offered: { color: '#10b981', label: 'Offered', bg: '#d1fae5' },
    rejected: { color: '#ef4444', label: 'Rejected', bg: '#fee2e2' },
    withdrawn: { color: '#64748b', label: 'Withdrawn', bg: '#f1f5f9' },
  };

  const total = summary.total || 1;

  return (
    <Card variant="elevated" style={{ marginBottom: '32px', animation: 'scaleUp 0.4s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: 'var(--color-text-main)' }}>
            Application Pipeline Funnel
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {summary.total} total candidate applications tracked
          </span>
        </div>
        {summary.offerRate !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#d1fae5', color: '#065f46', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            <TrendingUp size={14} />
            {summary.offerRate}% Offer Rate
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {Object.entries(summary.byStatus).map(([status, count], idx) => {
          const config = statusConfig[status] || { color: 'var(--color-primary)', label: status, bg: 'var(--color-bg)' };
          const pct = Math.round((count / total) * 100);

          return (
            <div
              key={status}
              onClick={() => navigate(`/applications?status=${status}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '10px',
                transition: 'var(--transition-smooth)',
              }}
              className="hover-lift"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color }} />
                  <span style={{ color: 'var(--color-text-main)', textTransform: 'capitalize' }}>{config.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-main)', fontWeight: '700' }}>{count}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', minWidth: '36px', textAlign: 'right' }}>
                    ({pct}%)
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--color-border)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.max(pct, count > 0 ? 2 : 0)}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${config.color}, ${config.color}dd)`,
                    borderRadius: '4px',
                    transition: 'width 0.8s ease-out',
                    animation: `slideUp 0.4s ease ${idx * 0.05}s both`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

