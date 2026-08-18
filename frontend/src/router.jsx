import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RouteGuard from './components/common/RouteGuard.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import { Spinner } from './components/ui';

// Lazy-loaded page components for route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const JobsPage = lazy(() => import('./pages/JobsPage.jsx'));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage.jsx'));
const SavedJobsPage = lazy(() => import('./pages/SavedJobsPage.jsx'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage.jsx'));
const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const NotificationCenter = lazy(() => import('./components/notifications/NotificationCenter.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const JobDetailsPage = lazy(() => import('./pages/JobDetailsPage.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// New pages
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'));
const AssessmentsPage = lazy(() => import('./pages/AssessmentsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const TalentPoolPage = lazy(() => import('./pages/TalentPoolPage.jsx'));
const ResumeBuilderPage = lazy(() => import('./pages/ResumeBuilderPage.jsx'));
const InterviewPrepPage = lazy(() => import('./pages/InterviewPrepPage.jsx'));
const ActivityFeedPage = lazy(() => import('./pages/ActivityFeedPage.jsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'));
const KanbanBoardPage = lazy(() => import('./pages/KanbanBoardPage.jsx'));
const SalaryInsightsPage = lazy(() => import('./pages/SalaryInsightsPage.jsx'));
const InterviewCalendarPage = lazy(() => import('./pages/InterviewCalendarPage.jsx'));
const CandidateComparisonPage = lazy(() => import('./pages/CandidateComparisonPage.jsx'));

// Auth Screen (static import for fast initial auth rendering)
import AuthScreen from './components/AuthScreen.jsx';

/**
 * Suspense fallback wrapper for page route chunks.
 */
function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
      }}
    >
      <Spinner size="lg" label="Loading page..." />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    ),
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
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <Suspense fallback={<PageLoader />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    path: '/verify-email/:token',
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmail />
      </Suspense>
    ),
  },
  {
    path: '/jobs/:jobId',
    element: (
      <Suspense fallback={<PageLoader />}>
        <JobDetailsPage />
      </Suspense>
    ),
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
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/jobs',
        element: (
          <Suspense fallback={<PageLoader />}>
            <JobsPage />
          </Suspense>
        ),
      },
      {
        path: '/applications',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ApplicationsPage />
          </Suspense>
        ),
      },
      {
        path: '/saved-jobs',
        element: (
          <RouteGuard roles={['candidate']}>
            <Suspense fallback={<PageLoader />}>
              <SavedJobsPage />
            </Suspense>
          </RouteGuard>
        ),
      },
      {
        path: '/companies',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CompaniesPage />
          </Suspense>
        ),
      },
      {
        path: '/companies/:companyId',
        element: (
          <Suspense fallback={<PageLoader />}>
            <CompanyDetailPage />
          </Suspense>
        ),
      },
      {
        path: '/messages',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MessagesPage />
          </Suspense>
        ),
      },
      {
        path: '/assessments',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AssessmentsPage />
          </Suspense>
        ),
      },
      {
        path: '/settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: '/talent-pool',
        element: (
          <RouteGuard roles={['recruiter']}>
            <Suspense fallback={<PageLoader />}>
              <TalentPoolPage />
            </Suspense>
          </RouteGuard>
        ),
      },
      {
        path: '/resumes',
        element: (
          <RouteGuard roles={['candidate']}>
            <Suspense fallback={<PageLoader />}>
              <ResumeBuilderPage />
            </Suspense>
          </RouteGuard>
        ),
      },
      {
        path: '/interview-prep',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InterviewPrepPage />
          </Suspense>
        ),
      },
      {
        path: '/feed',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ActivityFeedPage />
          </Suspense>
        ),
      },
      {
        path: '/analytics',
        element: (
          <Suspense fallback={<PageLoader />}>
            <AnalyticsPage />
          </Suspense>
        ),
      },
      {
        path: '/kanban',
        element: (
          <Suspense fallback={<PageLoader />}>
            <KanbanBoardPage />
          </Suspense>
        ),
      },
      {
        path: '/salary-insights',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SalaryInsightsPage />
          </Suspense>
        ),
      },
      {
        path: '/calendar',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InterviewCalendarPage />
          </Suspense>
        ),
      },
      {
        path: '/compare-candidates',
        element: (
          <RouteGuard roles={['recruiter', 'admin']}>
            <Suspense fallback={<PageLoader />}>
              <CandidateComparisonPage />
            </Suspense>
          </RouteGuard>
        ),
      },
      {
        path: '/notifications',
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotificationCenter />
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: '/admin',
        element: (
          <RouteGuard roles={['admin']}>
            <Suspense fallback={<PageLoader />}>
              <AdminPage />
            </Suspense>
          </RouteGuard>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
