import { NavLink } from 'react-router-dom';
import {
  Activity,
  Menu,
  Moon,
  Sun,
  LayoutDashboard,
  BriefcaseBusiness,
  Clock,
  Building2,
  MessageSquare,
  Award,
} from 'lucide-react';
import NotificationsBell from '../NotificationsBell.jsx';

/**
 * Topbar header component with horizontal top navbar links, page title,
 * notifications bell, theme toggle, and system health status.
 */
export default function Header({
  user,
  title,
  eyebrow,
  readiness,
  notifications = [],
  unreadCount = 0,
  darkMode,
  toggleDarkMode,
  onMarkAllRead,
  onMarkRead,
  onDeleteNotification,
  onClearReadNotifications,
  onOpenMobileNav,
}) {
  return (
    <div className="topbar-wrapper">
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
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <NotificationsBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={onMarkAllRead}
            onMarkRead={onMarkRead}
            onDelete={onDeleteNotification}
            onClearRead={onClearReadNotifications}
          />

          <div className={`status-pill ${readiness.ok ? 'ready' : 'not-ready'}`}>
            <Activity size={16} aria-hidden="true" />
            <span>{readiness.loading ? 'Checking API' : readiness.status}</span>
          </div>
        </div>
      </header>

      {/* Horizontal Top Navigation Bar for Primary Workspaces */}
      <nav className="top-navbar-links" aria-label="Primary top navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `top-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={16} /> Overview
        </NavLink>

        {user?.role !== 'admin' && (
          <>
            <NavLink
              to="/jobs"
              className={({ isActive }) => `top-nav-item ${isActive ? 'active' : ''}`}
            >
              <BriefcaseBusiness size={16} />{' '}
              {user?.role === 'recruiter' ? 'My Job Posts' : 'Find Jobs'}
            </NavLink>
            <NavLink
              to="/applications"
              className={({ isActive }) => `top-nav-item ${isActive ? 'active' : ''}`}
            >
              <Clock size={16} /> {user?.role === 'recruiter' ? 'ATS Pipelines' : 'Applications'}
            </NavLink>
          </>
        )}

        <NavLink
          to="/companies"
          className={({ isActive }) => `top-nav-item ${isActive ? 'active' : ''}`}
        >
          <Building2 size={16} /> Companies
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) => `top-nav-item ${isActive ? 'active' : ''}`}
        >
          <MessageSquare size={16} /> Messages
        </NavLink>

        <NavLink
          to="/assessments"
          className={({ isActive }) => `top-nav-item ${isActive ? 'active' : ''}`}
        >
          <Award size={16} /> Assessments
        </NavLink>
      </nav>
    </div>
  );
}
