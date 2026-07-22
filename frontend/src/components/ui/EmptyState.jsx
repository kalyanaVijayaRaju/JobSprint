/**
 * Reusable empty state placeholder with icon, title, description, and optional action.
 *
 * @param {import('react').ReactNode} icon - Lucide icon element
 * @param {string} title
 * @param {string} description
 * @param {import('react').ReactNode} action - Optional CTA button
 */
export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <p className="empty-state-title">{title}</p>}
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
