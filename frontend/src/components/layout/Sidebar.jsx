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
  MessageSquare,
  Award,
  Settings,
  Search,
  FileText,
  BookOpen,
  TrendingUp,
  Sparkles,
  Bot,
  GraduationCap,
  Code,
  Users,
  Compass,
  DollarSign,
  BarChart,
  Calendar,
  Shield,
  Layers,
} from 'lucide-react';

/**
 * Categorized Sidebar navigation component.
 */
export default function Sidebar({
  user,
  profile,
  isMobileNavOpen,
  closeMobileNav,
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
        {/* CATEGORY 1: AI & SKILL ACCELERATOR */}
        <div className="sidebar-category">
          <div className="sidebar-category-title">🧠 AI & Skill Accelerator</div>
          <NavLink
            to="/ai-analyzer"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Sparkles size={16} /> AI Resume Matcher
          </NavLink>

          <NavLink
            to="/mock-interview"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Bot size={16} /> Mock Simulator
          </NavLink>

          <NavLink
            to="/learning-path"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <GraduationCap size={16} /> Skill Pathfinder
          </NavLink>

          <NavLink
            to="/code-playground"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Code size={16} /> Code Sandbox
          </NavLink>

          <NavLink
            to="/interview-prep"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <BookOpen size={16} /> Interview Prep
          </NavLink>
        </div>

        {/* CATEGORY 2: NETWORK & RECRUITMENT */}
        <div className="sidebar-category">
          <div className="sidebar-category-title">🤝 Network & Recruitment</div>
          <NavLink
            to="/mentorship"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Users size={16} /> Mentorship Hub
          </NavLink>

          <NavLink
            to="/referrals"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <UsersRound size={16} /> Referral Network
          </NavLink>

          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <NavLink
              to="/talent-radar"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <Compass size={16} /> Talent Radar
            </NavLink>
          )}

          {user?.role === 'recruiter' && (
            <NavLink
              to="/talent-pool"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <Search size={16} /> Talent Pool
            </NavLink>
          )}

          <NavLink
            to="/feed"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Activity size={16} /> Activity Feed
          </NavLink>
        </div>

        {/* CATEGORY 3: CAREER & INSIGHTS */}
        <div className="sidebar-category">
          <div className="sidebar-category-title">📊 Career & Insights</div>
          <NavLink
            to="/salary-insights"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <DollarSign size={16} /> Salary Insights
          </NavLink>

          <NavLink
            to="/offer-evaluator"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <TrendingUp size={16} /> Offer Evaluator
          </NavLink>

          <NavLink
            to="/culture-match"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Building2 size={16} /> Culture Evaluator
          </NavLink>

          <NavLink
            to="/kanban"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Layers size={16} /> Kanban Pipeline
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Calendar size={16} /> Interview Calendar
          </NavLink>

          {(user?.role === 'recruiter' || user?.role === 'admin') && (
            <NavLink
              to="/compare-candidates"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <UsersRound size={16} /> Compare Candidates
            </NavLink>
          )}

          {user?.role === 'candidate' && (
            <>
              <NavLink
                to="/resumes"
                className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={closeMobileNav}
              >
                <FileText size={16} /> Resume Builder
              </NavLink>

              <NavLink
                to="/saved-jobs"
                className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={closeMobileNav}
              >
                <Bookmark size={16} /> Saved Jobs
              </NavLink>
            </>
          )}

          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <BarChart size={16} /> Analytics
          </NavLink>
        </div>

        {/* CATEGORY 4: ACCOUNT & SYSTEM */}
        <div className="sidebar-category">
          <div className="sidebar-category-title">⚙️ Account & System</div>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <User size={16} /> Profile
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
            onClick={closeMobileNav}
          >
            <Settings size={16} /> Settings
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={closeMobileNav}
            >
              <Shield size={16} /> Admin Console
            </NavLink>
          )}
        </div>

        <button
          type="button"
          className="nav-link-btn logout-btn"
          onClick={() => {
            closeMobileNav();
            onLogout();
          }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </nav>
    </aside>
  );
}
