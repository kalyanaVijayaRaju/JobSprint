import { createContext, useContext, useState, useCallback } from 'react';
import { notificationsApi } from '../api/client.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children, triggerAlert }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(() => {
    notificationsApi
      .list({ limit: 10 })
      .then((res) => {
        if (res.success) setNotifications(res.data.notifications);
      })
      .catch(() => {});

    notificationsApi
      .unreadCount()
      .then((res) => {
        if (res.success) setUnreadCount(res.data.count);
      })
      .catch(() => {});
  }, []);

  const markNotificationRead = useCallback(
    async (id) => {
      try {
        await notificationsApi.markRead(id);
        fetchNotifications();
      } catch (err) {
        if (triggerAlert) triggerAlert(err.message, 'error');
      }
    },
    [fetchNotifications, triggerAlert]
  );

  const markAllNotificationsRead = useCallback(
    async () => {
      try {
        await notificationsApi.markAllRead();
        fetchNotifications();
        if (triggerAlert) triggerAlert('All notifications marked as read');
      } catch (err) {
        if (triggerAlert) triggerAlert(err.message, 'error');
      }
    },
    [fetchNotifications, triggerAlert]
  );

  const deleteNotification = useCallback(
    async (id) => {
      try {
        await notificationsApi.delete(id);
        fetchNotifications();
        if (triggerAlert) triggerAlert('Notification deleted');
      } catch (err) {
        if (triggerAlert) triggerAlert(err.message, 'error');
      }
    },
    [fetchNotifications, triggerAlert]
  );

  const clearReadNotifications = useCallback(
    async () => {
      try {
        const res = await notificationsApi.clearRead();
        fetchNotifications();
        if (triggerAlert)
          triggerAlert(
            res.data?.deletedCount
              ? 'Read notifications cleared'
              : 'No read notifications to clear'
          );
      } catch (err) {
        if (triggerAlert) triggerAlert(err.message, 'error');
      }
    },
    [fetchNotifications, triggerAlert]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearReadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
