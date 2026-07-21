import { createBrowserRouter, Navigate } from 'react-router-dom';
import RouteGuard from './components/common/RouteGuard.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import JobsPage from './pages/JobsPage.jsx';
import ApplicationsPage from './pages/ApplicationsPage.jsx';
import SavedJobsPage from './pages/SavedJobsPage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import JobDetailsPage from './pages/JobDetailsPage.jsx';

// Auth Components
import AuthScreen from './components/AuthScreen.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <AuthScreen defaultMode="login" />,
  },
  {
    path: '/register',
    element: <AuthScreen defaultMode="register" />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email/:token',
    element: <VerifyEmail />,
  },
  {
    path: '/jobs/:jobId',
    element: <JobDetailsPage />,
  },
  {
    element: (
      <RouteGuard>
        <AppLayout />
      </RouteGuard>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/jobs',
        element: <JobsPage />,
      },
      {
        path: '/applications',
        element: <ApplicationsPage />,
      },
      {
        path: '/saved-jobs',
        element: (
          <RouteGuard roles={['candidate']}>
            <SavedJobsPage />
          </RouteGuard>
        ),
      },
      {
        path: '/companies',
        element: <CompaniesPage />,
      },
      {
        path: '/profile',
        element: <ProfilePage />,
      },
      {
        path: '/admin',
        element: (
          <RouteGuard roles={['admin']}>
            <AdminPage />
          </RouteGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
