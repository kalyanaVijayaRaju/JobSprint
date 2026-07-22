import { NavLink } from 'react-router-dom';
import {
  Activity,
  BriefcaseBusiness,
  UsersRound,
  Bookmark,
  LogOut,
  Clock,
  User,
  X,
  Building2,
  Moon,
  Sun,
} from 'lucide-react';

/**
 * Sidebar navigation component with user role-based menu items and theme toggle.
 */
export default function Sidebar({
  user,
  profile,
  isMobileNavOpen,
  closeMobileNav,
  darkMode,
  toggleDarkMode,
  onLogout,
}) {
  const getInitials = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`;
    }
    return user?.email ? user.email[0].toUpperCase() : 'U';
  };

  const getDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return user?.email ? user.email.split('@')[0] : 'User';
  };

  return (
    <aside
      id="primary-sidebar"
      className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}
      aria-label="Primary navigation"
    >
      <div className="brand">
        <span className="brand-mark">JS</span>
        <span>JobSprint</span>
        <button
          type="button"
          className="mobile-menu-close"
          onClick={closeMobileNav}
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="user-context">
        <div className="user-avatar">{getInitials()}</div>
        <div className="user-info">
          <span className="user-name">{getDisplayName()}</span>
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
              <BriefcaseBusiness size={18} />{' '}
              {user?.role === 'recruiter' ? 'My Job Posts' : 'Find Jobs'}
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

      <button type="button" className="btn btn-outline logout-btn" onClick={onLogout}>
        <LogOut size={16} /> Log Out
      </button>
    </aside>
  );
}
