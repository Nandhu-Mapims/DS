import { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { LoadingOverlay } from '../components/LoadingOverlay';

const LoadingContext = createContext(null);

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return ctx;
}

export function LoadingProvider({ children }) {
  const [state, setState] = useState({ show: false, message: 'Loading...' });

  const show = useCallback((message = 'Loading...') => {
    setState({ show: true, message });
  }, []);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, show: false }));
  }, []);

  const value = useMemo(() => ({ show, hide, isLoading: state.show }), [show, hide, state.show]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay show={state.show} message={state.message} />
    </LoadingContext.Provider>
  );
}
