/**
 * Reusable Card wrapper with consistent styling.
 *
 * @param {'default'|'elevated'|'bordered'} variant
 */
export default function Card({ children, variant = 'default', className = '', ...rest }) {
  const variantClass = {
    default: 'card',
    elevated: 'card card-elevated',
    bordered: 'card card-bordered',
  }[variant] || 'card';

  return (
    <div className={`${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

/**
 * Card header sub-component.
 */
Card.Header = function CardHeader({ children, className = '', ...rest }) {
  return (
    <div className={`card-header ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card body sub-component.
 */
Card.Body = function CardBody({ children, className = '', ...rest }) {
  return (
    <div className={`card-body ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card footer sub-component.
 */
Card.Footer = function CardFooter({ children, className = '', ...rest }) {
  return (
    <div className={`card-footer ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};
