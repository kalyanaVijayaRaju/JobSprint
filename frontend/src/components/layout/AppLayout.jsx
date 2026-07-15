import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  BriefcaseBusiness,
  UsersRound,
  Bookmark,
  LogOut,
  Clock,
  User,
  Menu,
  X,
  Building2,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import NotificationsBell from '../NotificationsBell.jsx';

export default function AppLayout() {
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
    markAllNotificationsRead
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
      profileApi.get()
        .then((res) => {
          if (res.success && res.data.profile) {
            setProfile(res.data.profile);
          }
        })
        .catch(() => setProfile(null));
    });
  }, [user]);

  // Close mobile nav on Escape
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileNavOpen]);

  const handleLogout = async () => {
    await logout();
  };

  const closeMobileNav = () => setIsMobileNavOpen(false);

  // Get page title based on current path
  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/dashboard') return 'Operations Dashboard';
    if (path === '/admin') return 'System Admin Console';
    if (path === '/jobs') return user?.role === 'recruiter' ? 'Job Listings Board' : 'Discover Careers';
    if (path === '/saved-jobs') return 'Bookmarked Roles';
    if (path === '/applications') return user?.role === 'recruiter' ? 'ATS Candidate Pipelines' : 'Applied Jobs Tracker';
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
      {successMsg && <div className="alert success-toast" role="status">{successMsg}</div>}
      {errorMsg && <div className="alert error-toast" role="alert">{errorMsg}</div>}

      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setIsMobileNavOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={isMobileNavOpen}
        aria-controls="primary-sidebar"
      >
        <Menu size={22} />
      </button>

      {isMobileNavOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={closeMobileNav}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar Navigation */}
      <aside id="primary-sidebar" className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
        <div className="brand">
          <span className="brand-mark">JS</span>
          <span>JobSprint</span>
          <button type="button" className="mobile-menu-close" onClick={closeMobileNav} aria-label="Close navigation menu">
            <X size={20} />
          </button>
        </div>

        <div className="user-context">
          <div className="user-avatar">
            {profile?.firstName ? `${profile.firstName[0]}${profile.lastName[0]}` : user?.email[0].toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user?.email.split('@')[0]}
            </span>
            <span className="user-role">{user?.role}</span>
          </div>
        </div>

        <nav className="nav-list">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Activity size={18} /> Overview
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <UsersRound size={18} /> Admin Console
            </NavLink>
          )}

          {user?.role !== 'admin' && (
            <>
              <NavLink
                to="/jobs"
                className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={closeMobileNav}
              >
                <BriefcaseBusiness size={18} /> {user?.role === 'recruiter' ? 'My Job Posts' : 'Find Jobs'}
              </NavLink>
              <NavLink
                to="/applications"
                className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={closeMobileNav}
              >
                <Clock size={18} /> {user?.role === 'recruiter' ? 'ATS Pipelines' : 'Applications'}
              </NavLink>
            </>
          )}

          <NavLink
            to="/companies"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Building2 size={18} /> Companies
          </NavLink>

          {user?.role === 'candidate' && (
            <NavLink
              to="/saved-jobs"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <Bookmark size={18} /> Saved Jobs
            </NavLink>
          )}

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <User size={18} /> Profile Settings
          </NavLink>
        </nav>

        <button
          type="button"
          className="btn btn-outline dark-mode-btn"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button type="button" className="btn btn-outline logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Log Out
        </button>
      </aside>

      {/* Workspace Area */}
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{getEyebrow()}</p>
            <h1>{getPageTitle()}</h1>
          </div>

          <div className="header-actions">
            <NotificationsBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkAllRead={markAllNotificationsRead}
              onMarkRead={markNotificationRead}
            />

            <div className={`status-pill ${readiness.ok ? 'ready' : 'not-ready'}`}>
              <Activity size={18} aria-hidden="true" />
              <span>{readiness.loading ? 'Checking API' : readiness.status}</span>
            </div>
          </div>
        </header>

        {/* Route content renders here */}
        <Outlet context={{ profile, setProfile }} />
      </section>
    </div>
  );
}
