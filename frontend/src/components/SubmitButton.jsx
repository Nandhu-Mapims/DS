import { Button, Spinner } from 'react-bootstrap';

/**
 * Button that shows a spinner when loading and is disabled during API calls.
 * Use for form submit / action buttons.
 */
export function SubmitButton({
  children,
  loading = false,
  variant = 'primary',
  size,
  type = 'button',
  disabled,
  className = '',
  ...props
}) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={`ds-focus-ring ${className}`}
      {...props}
    >
      {loading && (
        <>
          <Spinner animation="border" size="sm" className="me-2" role="status" aria-hidden="true" />
        </>
      )}
      {children}
    </Button>
  );
}
