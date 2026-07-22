import { createContext, useContext, useState, useEffect } from 'react';
import { getReadiness } from '../api/client.js';
import { ThemeProvider, useTheme } from './ThemeContext.jsx';
import { ToastProvider, useToast } from './ToastContext.jsx';
import { NotificationProvider, useNotifications } from './NotificationContext.jsx';

const AppContext = createContext(null);

function AppContextInner({ children }) {
  const { darkMode, toggleDarkMode } = useTheme();
  const { successMsg, errorMsg, triggerAlert } = useToast();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();

  // API readiness
  const [readiness, setReadiness] = useState({
    loading: true,
    ok: false,
    status: 'CHECKING',
    timestamp: null,
  });

  // Check API readiness on mount
  useEffect(() => {
    getReadiness()
      .then((res) => setReadiness({ loading: false, ...res }))
      .catch(() => setReadiness({ loading: false, ok: false, status: 'OFFLINE', timestamp: null }));
  }, []);

  const value = {
    darkMode,
    toggleDarkMode,
    successMsg,
    errorMsg,
    triggerAlert,
    readiness,
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ToastContextConsumer>
          {({ triggerAlert }) => (
            <NotificationProvider triggerAlert={triggerAlert}>
              <AppContextInner>{children}</AppContextInner>
            </NotificationProvider>
          )}
        </ToastContextConsumer>
      </ToastProvider>
    </ThemeProvider>
  );
}

function ToastContextConsumer({ children }) {
  const { triggerAlert } = useToast();
  return children({ triggerAlert });
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
