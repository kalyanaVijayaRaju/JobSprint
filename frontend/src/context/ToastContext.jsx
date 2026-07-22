import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const triggerAlert = useCallback((msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ successMsg, errorMsg, triggerAlert }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
