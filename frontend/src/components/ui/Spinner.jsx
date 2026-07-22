/**
 * Loading spinner component.
 *
 * @param {'sm'|'md'|'lg'} size
 * @param {string} label - Accessible loading label
 */
export default function Spinner({ size = 'md', label = 'Loading...', className = '' }) {
  const sizeClass = {
    sm: 'spinner-sm',
    md: '',
    lg: 'spinner-lg',
  }[size] || '';

  return (
    <div className={`spinner-container ${className}`.trim()} role="status" aria-label={label}>
      <div className={`loader-spinner ${sizeClass}`.trim()} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
