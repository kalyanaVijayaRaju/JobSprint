import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, CheckCheck, Clock, ShieldAlert, Briefcase, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { Button, Badge, Spinner, EmptyState } from '../ui';

/**
 * Full-page Notification Center component for viewing and managing all notifications.
 */
export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
  } = useApp();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'application_status': return <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />;
      case 'interview': return <Calendar size={16} style={{ color: 'var(--color-accent)' }} />;
      case 'security': return <ShieldAlert size={16} style={{ color: 'var(--color-error)' }} />;
      default: return <Bell size={16} style={{ color: 'var(--color-text-muted)' }} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: 'var(--color-text-main)' }}>
            Notification Center
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" icon={<CheckCheck size={14} />} onClick={markAllNotificationsRead}>
              Mark All Read
            </Button>
          )}
          {notifications.some((n) => n.isRead) && (
            <Button size="sm" variant="outline" icon={<Trash2 size={14} />} onClick={clearReadNotifications}>
              Clear Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: 'none',
            background: filter === 'all' ? 'var(--color-primary)' : 'var(--color-bg)',
            color: filter === 'all' ? '#ffffff' : 'var(--color-text-main)',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            padding: '6px 16px',
            borderRadius: '20px',
            border: 'none',
            background: filter === 'unread' ? 'var(--color-primary)' : 'var(--color-bg)',
            color: filter === 'unread' ? '#ffffff' : 'var(--color-text-main)',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No notifications"
          description={filter === 'unread' ? 'You have no unread notifications.' : 'Your notification tray is clean!'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((item, idx) => (
            <div
              key={item._id}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                background: item.isRead ? 'var(--color-card)' : 'var(--color-primary-light)',
                borderLeft: !item.isRead ? '4px solid var(--color-primary)' : '1px solid var(--color-border)',
                animation: `fadeIn 0.3s ease ${idx * 0.04}s both`,
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {getIcon(item.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: item.isRead ? '600' : '700', color: 'var(--color-text-main)' }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  {item.message}
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(item._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-primary)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0,
                      }}
                    >
                      <Check size={12} /> Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(item._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0,
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
