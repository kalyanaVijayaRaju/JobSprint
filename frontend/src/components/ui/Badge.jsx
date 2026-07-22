/**
 * Reusable Badge component for status labels, job types, location types.
 *
 * @param {'default'|'applied'|'screening'|'interviewing'|'offered'|'rejected'|'withdrawn'|'active'|'closed'|'archived'|'job-type'|'location'|'success'|'warning'|'error'} variant
 */
export default function Badge({ children, variant = 'default', className = '', ...rest }) {
  const variantClass = {
    // Application statuses
    applied: 'status-applied',
    screening: 'status-screening',
    interviewing: 'status-interviewing',
    offered: 'status-offered',
    rejected: 'status-rejected',
    withdrawn: 'status-withdrawn',
    // Job statuses
    active: 'status-active',
    closed: 'status-closed',
    archived: 'status-archived',
    // Semantic types
    'job-type': 'job-type-badge',
    location: 'location-badge',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    default: '',
  }[variant] || '';

  return (
    <span className={`badge ${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
