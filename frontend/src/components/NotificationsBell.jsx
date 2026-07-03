import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsBell({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <div className="notif-wrapper">
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {showNotifDropdown && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" onClick={() => { onMarkAllRead(); setShowNotifDropdown(false); }}>
                Mark all read
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">No updates yet.</p>
            ) : (
              notifications.map(n => (
                <div
                  className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                  key={n._id}
                  onClick={() => {
                    onMarkRead(n._id);
                    setShowNotifDropdown(false);
                  }}
                >
                  <div className="notif-content">
                    <p className="notif-msg">{n.message}</p>
                    <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  {!n.isRead && <span className="notif-dot"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
