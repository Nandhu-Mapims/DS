import { Spinner } from 'react-bootstrap';

export function LoadingOverlay({ show = false, message = 'Loading...' }) {
  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 9999,
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="d-flex flex-column align-items-center gap-3 p-4 rounded-3 shadow"
        style={{
          backgroundColor: 'var(--ds-bg-elevated)',
          color: 'var(--ds-text)',
        }}
      >
        <Spinner animation="border" variant="primary" role="status" />
        <span className="small">{message}</span>
      </div>
    </div>
  );
}
