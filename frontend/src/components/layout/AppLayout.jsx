import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import Toast from './Toast.jsx';
import { ErrorBoundary } from '../ui';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';

/**
 * AppLayout orchestrator — sidebar navigation, header topbar, toast alerts, and route outlet wrapper.
 */
export default function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    darkMode,
    toggleDarkMode,
    successMsg,
    errorMsg,
    readiness,
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearReadNotifications,
  } = useApp();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  // Fetch notifications on mount and poll
  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Load profile for sidebar display
  useEffect(() => {
    if (!user) return;
    import('../../api/client.js').then(({ profileApi }) => {
      profileApi
        .get()
        .then((res) => {
          if (res.success && res.data.profile) {
            setProfile(res.data.profile);
          }
        })
        .catch(() => setProfile(null));
    });
  }, [user]);

  // Close mobile nav on Escape key
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileNavOpen]);

  const closeMobileNav = () => setIsMobileNavOpen(false);

  // Derive page title and eyebrow
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Operations Dashboard';
    if (path === '/admin') return 'System Admin Console';
    if (path === '/jobs') return user?.role === 'recruiter' ? 'Job Listings Board' : 'Discover Careers';
    if (path === '/saved-jobs') return 'Bookmarked Roles';
    if (path === '/applications')
      return user?.role === 'recruiter' ? 'ATS Candidate Pipelines' : 'Applied Jobs Tracker';
    if (path === '/companies') return 'Company Directory';
    if (path === '/profile') return 'Professional Profile';
    return 'Dashboard';
  };

  const getEyebrow = () => {
    if (user?.role === 'admin') return 'Administrative workspace';
    if (user?.role === 'recruiter') return 'Recruiting workspace';
    return 'Candidate workspace';
  };

  return (
    <div className="app-shell">
      <Toast successMsg={successMsg} errorMsg={errorMsg} />

      {isMobileNavOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeMobileNav}
          aria-label="Close navigation menu"
        />
      )}

      <Sidebar
        user={user}
        profile={profile}
        isMobileNavOpen={isMobileNavOpen}
        closeMobileNav={closeMobileNav}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onLogout={logout}
      />

      <section className="workspace">
        <Header
          user={user}
          title={getPageTitle()}
          eyebrow={getEyebrow()}
          readiness={readiness}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllNotificationsRead}
          onMarkRead={markNotificationRead}
          onDeleteNotification={deleteNotification}
          onClearReadNotifications={clearReadNotifications}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />

        <ErrorBoundary>
          <Outlet context={{ profile, setProfile }} />
        </ErrorBoundary>
      </section>
    </div>
  );
}
