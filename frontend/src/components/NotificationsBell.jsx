import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Briefcase, MessageSquare, Info } from 'lucide-react';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getNotifIcon(type) {
  switch (type) {
    case 'application_status':
      return <Briefcase size={14} className="notif-type-icon notif-icon-job" />;
    case 'application_received':
      return <CheckCircle2 size={14} className="notif-type-icon notif-icon-success" />;
    case 'alert':
      return <AlertTriangle size={14} className="notif-type-icon notif-icon-warning" />;
    case 'message':
      return <MessageSquare size={14} className="notif-type-icon notif-icon-accent" />;
    default:
      return <Info size={14} className="notif-type-icon notif-icon-info" />;
  }
}

export default function NotificationsBell({
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead
}) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showNotifDropdown) return;
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifDropdown]);

  // Close on Escape key
  useEffect(() => {
    if (!showNotifDropdown) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowNotifDropdown(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showNotifDropdown]);

  return (
    <div className="notif-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
        aria-label="Notifications"
        aria-expanded={showNotifDropdown}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifDropdown && (
        <div className="notif-dropdown" role="menu">
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
              <div className="notif-empty-state">
                <Bell size={28} className="text-muted" />
                <p className="notif-empty">No notifications yet</p>
                <p className="notif-empty-hint">Updates about your applications and activity will appear here.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                  key={n._id}
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => {
                    if (!n.isRead) onMarkRead(n._id);
                    setShowNotifDropdown(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!n.isRead) onMarkRead(n._id);
                      setShowNotifDropdown(false);
                    }
                  }}
                >
                  <div className="notif-icon-wrapper">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="notif-content">
                    <p className="notif-msg">{n.message}</p>
                    <span className="notif-time">{timeAgo(n.createdAt)}</span>
                  </div>
                  {!n.isRead && <span className="notif-dot" aria-hidden="true"></span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
