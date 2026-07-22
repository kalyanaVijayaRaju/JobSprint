/**
 * Progress bar component for profile completeness and other metrics.
 *
 * @param {number} value - Current value (0-100)
 * @param {number} max - Maximum value (default: 100)
 * @param {string} label - Accessible label
 * @param {'primary'|'success'|'warning'|'error'} color
 * @param {boolean} showLabel - Show percentage text
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  color = 'primary',
  showLabel = true,
  className = '',
}) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const colorVar = {
    primary: 'var(--color-primary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
  }[color] || 'var(--color-primary)';

  return (
    <div className={`progress-bar-container ${className}`.trim()}>
      {(label || showLabel) && (
        <div className="progress-bar-header">
          {label && <span className="progress-bar-label">{label}</span>}
          {showLabel && <span className="progress-bar-percentage">{percentage}%</span>}
        </div>
      )}
      <div
        className="progress-bar-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `${percentage}% complete`}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: colorVar,
            transition: 'width 0.5s ease-out',
          }}
        />
      </div>
    </div>
  );
}
