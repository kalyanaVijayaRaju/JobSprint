import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * RouteGuard protects routes based on authentication and role.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content
 * @param {string[]} [props.roles] - Optional array of allowed roles
 * @param {string} [props.redirectTo='/login'] - Where to redirect if unauthorized
 */
export default function RouteGuard({ children, roles, redirectTo = '/login' }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="session-loader">
        <div className="loader-spinner"></div>
        <p>Loading JobSprint Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
