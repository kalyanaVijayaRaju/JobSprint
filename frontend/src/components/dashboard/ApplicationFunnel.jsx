import { Card, Badge } from '../ui';

/**
 * Application pipeline status breakdown funnel chart for recruiter/candidate dashboards.
 */
export default function ApplicationFunnel({ summary }) {
  if (!summary || !summary.byStatus) return null;

  const statusColors = {
    applied: '#3b82f6',
    screening: '#8b5cf6',
    interviewing: '#eab308',
    offered: '#22c55e',
    rejected: '#ef4444',
    withdrawn: '#64748b',
  };

  const total = summary.total || 1;

  return (
    <Card variant="elevated" style={{ marginBottom: '32px' }}>
      <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700' }}>
        Application Pipeline Funnel
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {Object.entries(summary.byStatus).map(([status, count]) => {
          const pct = Math.round((count / total) * 100);
          const color = statusColors[status] || 'var(--color-primary)';

          return (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                <Badge variant={`status-${status}`}>{status}</Badge>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {count} ({pct}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'var(--color-bg)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '99px',
                    transition: 'width 0.6s ease-out',
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
