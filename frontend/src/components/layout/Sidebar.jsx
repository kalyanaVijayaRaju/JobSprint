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
  MessageSquare,
  Award,
  Settings,
  Search,
  FileText,
  BookOpen,
  TrendingUp,
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
          to="/messages"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <MessageSquare size={18} /> Messages
        </NavLink>

        <NavLink
          to="/assessments"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <Award size={18} /> Assessments
        </NavLink>

        <NavLink
          to="/companies"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <Building2 size={18} /> Companies
        </NavLink>

        {user?.role === 'candidate' && (
          <>
            <NavLink
              to="/saved-jobs"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <Bookmark size={18} /> Saved Jobs
            </NavLink>

            <NavLink
              to="/resumes"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <FileText size={18} /> Resume Builder
            </NavLink>
          </>
        )}

        <NavLink
          to="/interview-prep"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <BookOpen size={18} /> Interview Prep
        </NavLink>

        <NavLink
          to="/feed"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <Activity size={18} /> Activity Feed
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <TrendingUp size={18} /> Analytics
        </NavLink>

        {user?.role === 'recruiter' && (
          <NavLink
            to="/talent-pool"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Search size={18} /> Talent Pool
          </NavLink>
        )}

        <NavLink
          to="/kanban"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <Clock size={18} /> Kanban Pipeline
        </NavLink>

        <NavLink
          to="/salary-insights"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <TrendingUp size={18} /> Salary Insights
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <Clock size={18} /> Interview Calendar
        </NavLink>

        {(user?.role === 'recruiter' || user?.role === 'admin') && (
          <NavLink
            to="/compare-candidates"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <UsersRound size={18} /> Compare Candidates
          </NavLink>
        )}

        <NavLink
          to="/ai-analyzer"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <FileText size={18} /> AI Resume Matcher
        </NavLink>

        <NavLink
          to="/mock-interview"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <BookOpen size={18} /> Mock Simulator
        </NavLink>

        <NavLink
          to="/offer-evaluator"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <TrendingUp size={18} /> Offer Evaluator
        </NavLink>

        <NavLink
          to="/mentorship"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <UsersRound size={18} /> Mentorship Hub
        </NavLink>

        {(user?.role === 'recruiter' || user?.role === 'admin') && (
          <NavLink
            to="/talent-radar"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Search size={18} /> Talent Radar
          </NavLink>
        )}

        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <User size={18} /> Profile
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
          onClick={closeMobileNav}
        >
          <Settings size={18} /> Settings
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
