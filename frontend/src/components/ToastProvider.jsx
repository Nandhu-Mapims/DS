import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext(null);

let toastId = 0;
function nextId() {
  return (toastId += 1);
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

export function ToastProvider({ children, containerPosition = 'top-end' }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((options = {}) => {
    const id = nextId();
    const entry = {
      id,
      title: options.title ?? 'Notification',
      body: options.body ?? '',
      variant: options.variant ?? 'light',
      delay: options.delay ?? 5000,
      autohide: options.autohide !== false,
    };
    setToasts((prev) => [...prev, entry]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (body, title = 'Success') => add({ title, body, variant: 'success' }),
    [add]
  );
  const danger = useCallback(
    (body, title = 'Error') => add({ title, body, variant: 'danger' }),
    [add]
  );
  const info = useCallback(
    (body, title = 'Info') => add({ title, body, variant: 'info' }),
    [add]
  );
  const warning = useCallback(
    (body, title = 'Warning') => add({ title, body, variant: 'warning' }),
    [add]
  );

  const value = useMemo(
    () => ({ add, remove, success, danger, info, warning }),
    [add, remove, success, danger, info, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer position={containerPosition} className="p-3" style={{ zIndex: 1060 }}>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            bg={t.variant}
            autohide={t.autohide}
            delay={t.delay}
            onClose={() => remove(t.id)}
            className="ds-focus-ring"
          >
            <Toast.Header closeButton>
              <strong className="me-auto">{t.title}</strong>
            </Toast.Header>
            {t.body && <Toast.Body>{t.body}</Toast.Body>}
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
}
