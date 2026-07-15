import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getReadiness, notificationsApi } from '../api/client.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('jobsprint-theme') === 'dark');

  // Toast alerts
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // API readiness
  const [readiness, setReadiness] = useState({
    loading: true,
    ok: false,
    status: 'CHECKING',
    timestamp: null
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Persist dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('jobsprint-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Check API readiness on mount
  useEffect(() => {
    getReadiness()
      .then((res) => setReadiness({ loading: false, ...res }))
      .catch(() => setReadiness({ loading: false, ok: false, status: 'OFFLINE', timestamp: null }));
  }, []);

  const triggerAlert = useCallback((msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const fetchNotifications = useCallback(() => {
    notificationsApi.list({ limit: 10 })
      .then((res) => {
        if (res.success) setNotifications(res.data.notifications);
      })
      .catch(() => {});

    notificationsApi.unreadCount()
      .then((res) => {
        if (res.success) setUnreadCount(res.data.count);
      })
      .catch(() => {});
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    try {
      await notificationsApi.markRead(id);
      fetchNotifications();
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  }, [fetchNotifications, triggerAlert]);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllRead();
      fetchNotifications();
      triggerAlert('All notifications marked as read');
    } catch (err) {
      triggerAlert(err.message, 'error');
    }
  }, [fetchNotifications, triggerAlert]);

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
    markAllNotificationsRead
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
