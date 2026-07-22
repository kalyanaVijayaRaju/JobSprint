import { forwardRef } from 'react';

/**
 * Reusable Button component with variant, size, and loading support.
 *
 * @param {'primary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - Shows spinner and disables button
 * @param {boolean} block - Full-width button
 * @param {import('react').ReactNode} icon - Leading icon element
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    block = false,
    icon,
    className = '',
    disabled,
    ...rest
  },
  ref
) {
  const variantClass = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[variant] || 'btn-primary';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  const classes = [
    'btn',
    variantClass,
    sizeClass,
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : icon ? (
        <span className="btn-icon" aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});

export default Button;
