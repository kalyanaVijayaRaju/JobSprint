import { Activity, Menu } from 'lucide-react';
import NotificationsBell from '../NotificationsBell.jsx';

/**
 * Topbar header component with page title, eyebrow workspace label, notification bell, and system health status pill.
 */
export default function Header({
  user,
  title,
  eyebrow,
  readiness,
  notifications = [],
  unreadCount = 0,
  onMarkAllRead,
  onMarkRead,
  onDeleteNotification,
  onClearReadNotifications,
  onOpenMobileNav,
}) {
  return (
    <>
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      <header className="topbar">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>

        <div className="header-actions">
          <NotificationsBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={onMarkAllRead}
            onMarkRead={onMarkRead}
            onDelete={onDeleteNotification}
            onClearRead={onClearReadNotifications}
          />

          <div className={`status-pill ${readiness.ok ? 'ready' : 'not-ready'}`}>
            <Activity size={18} aria-hidden="true" />
            <span>{readiness.loading ? 'Checking API' : readiness.status}</span>
          </div>
        </div>
      </header>
    </>
  );
}
