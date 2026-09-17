import React, { isValidElement } from 'react';

/**
 * Reusable empty state placeholder with icon, title, description, and optional action.
 *
 * @param {import('react').ReactNode|React.ComponentType} icon - Lucide icon element or component
 * @param {string} title
 * @param {string} description
 * @param {import('react').ReactNode} action - Optional CTA button
 * @param {string} actionLabel - Optional CTA button text
 * @param {Function} onAction - Optional CTA click handler
 * @param {string} className
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  className = ''
}) {
  const renderIcon = () => {
    if (!icon) return null;
    if (isValidElement(icon)) return icon;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof)) {
      const IconComponent = icon;
      return <IconComponent size={40} />;
    }
    return icon;
  };

  const cta = action || (actionLabel ? (
    <button type="button" className="btn btn-primary" onClick={onAction}>
      {actionLabel}
    </button>
  ) : null);

  return (
    <div className={`empty-state ${className}`.trim()}>
      {icon && <div className="empty-state-icon">{renderIcon()}</div>}
      {title && <p className="empty-state-title">{title}</p>}
      {description && <p className="empty-state-description">{description}</p>}
      {cta && <div className="empty-state-action">{cta}</div>}
    </div>
  );
}
