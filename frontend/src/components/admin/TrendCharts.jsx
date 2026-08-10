import { useMemo } from 'react';

/**
 * Pure SVG line chart for time-series trend visualization.
 * Renders sign-ups, job posts, and applications as colored polylines.
 */
export default function TrendCharts({ trends, loading }) {
  if (loading || !trends) {
    return (
      <div className="card" style={{ padding: '24px', minHeight: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading trend data...</span>
      </div>
    );
  }

  const { signups = [], jobPosts = [], applications = [] } = trends;

  // Build a unified timeline from all three datasets
  const allLabels = useMemo(() => {
    const set = new Set();
    [signups, jobPosts, applications].forEach((series) =>
      series.forEach((d) => set.add(d.label))
    );
    return Array.from(set).sort();
  }, [signups, jobPosts, applications]);

  if (allLabels.length === 0) {
    return (
      <div className="card" style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No trend data available for the selected period.
      </div>
    );
  }

  const series = [
    { name: 'Sign-ups', data: signups, color: '#6366f1', fillColor: 'rgba(99, 102, 241, 0.1)' },
    { name: 'Job Posts', data: jobPosts, color: '#0ea5e9', fillColor: 'rgba(14, 165, 233, 0.1)' },
    { name: 'Applications', data: applications, color: '#10b981', fillColor: 'rgba(16, 185, 129, 0.1)' },
  ];

  // Chart dimensions
  const width = 800;
  const height = 220;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  // Compute max value across all series for Y-axis scaling
  const allValues = series.flatMap((s) =>
    allLabels.map((label) => {
      const point = s.data.find((d) => d.label === label);
      return point ? point.count : 0;
    })
  );
  const maxVal = Math.max(...allValues, 1);
  const ySteps = 4;

  // Generate polyline points for a series
  const getPoints = (seriesData) => {
    return allLabels.map((label, i) => {
      const point = seriesData.find((d) => d.label === label);
      const val = point ? point.count : 0;
      const x = padLeft + (i / Math.max(allLabels.length - 1, 1)) * chartWidth;
      const y = padTop + chartHeight - (val / maxVal) * chartHeight;
      return `${x},${y}`;
    });
  };

  // Generate area fill path for a series
  const getAreaPath = (seriesData) => {
    const points = getPoints(seriesData);
    if (points.length === 0) return '';
    const startX = padLeft;
    const endX = padLeft + chartWidth;
    const baseY = padTop + chartHeight;
    return `M${startX},${baseY} L${points.join(' L')} L${endX},${baseY} Z`;
  };

  return (
    <div className="card" style={{ padding: '24px', animation: 'scaleUp 0.4s ease both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--color-text-main)' }}>
          Platform Activity Trends
        </h4>
        <div style={{ display: 'flex', gap: '16px' }}>
          {series.map((s) => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '3px', borderRadius: '2px', background: s.color }} />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600' }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y-axis grid lines and labels */}
        {Array.from({ length: ySteps + 1 }).map((_, i) => {
          const y = padTop + (i / ySteps) * chartHeight;
          const value = Math.round(maxVal - (i / ySteps) * maxVal);
          return (
            <g key={`y-${i}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={padLeft + chartWidth}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="0.5"
                strokeDasharray={i === ySteps ? '0' : '4,4'}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-text-muted)"
                fontFamily="var(--font-sans)"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {allLabels.map((label, i) => {
          const x = padLeft + (i / Math.max(allLabels.length - 1, 1)) * chartWidth;
          // Show every Nth label to avoid crowding
          const showLabel = allLabels.length <= 10 || i % Math.ceil(allLabels.length / 10) === 0;
          if (!showLabel) return null;
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={height - 8}
              textAnchor="middle"
              fontSize="9"
              fill="var(--color-text-muted)"
              fontFamily="var(--font-sans)"
            >
              {label.length > 10 ? label.slice(5) : label}
            </text>
          );
        })}

        {/* Area fills */}
        {series.map((s) => (
          <path
            key={`area-${s.name}`}
            d={getAreaPath(s.data)}
            fill={s.fillColor}
            style={{ transition: 'all 0.5s ease' }}
          />
        ))}

        {/* Lines */}
        {series.map((s) => {
          const points = getPoints(s.data);
          return (
            <polyline
              key={`line-${s.name}`}
              points={points.join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'all 0.5s ease' }}
            />
          );
        })}

        {/* Data points (dots) */}
        {series.map((s) =>
          allLabels.map((label, i) => {
            const point = s.data.find((d) => d.label === label);
            const val = point ? point.count : 0;
            const x = padLeft + (i / Math.max(allLabels.length - 1, 1)) * chartWidth;
            const y = padTop + chartHeight - (val / maxVal) * chartHeight;
            return (
              <circle
                key={`dot-${s.name}-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill={s.color}
                stroke="var(--color-card)"
                strokeWidth="1.5"
              >
                <title>{`${s.name}: ${val} on ${label}`}</title>
              </circle>
            );
          })
        )}
      </svg>
    </div>
  );
}
