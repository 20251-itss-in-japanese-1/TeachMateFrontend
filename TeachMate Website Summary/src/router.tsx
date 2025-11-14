import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './page/HomePage';
import { ChatPage } from './page/ChatPage';
import { ContactsPage } from './page/ContactsPage';
import { AllTeachersPage } from './page/AllTeachersPage';
import { AllGroupsPage } from './page/AllGroupsPage';
import { NotificationsPageWrapper } from './page/NotificationsPageWrapper';
import { AdminPage } from './page/AdminPage';
import { LoginPage } from './page/LoginPage';

// Protected Route wrapper
import { ReactNode } from 'react';
import { useAppContext } from './contexts/AppContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading } = useAppContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isAdmin && !requireAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// Login Route wrapper - redirect to home if already authenticated
const LoginRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAppContext();

  // Check for OAuth token in URL before anything else
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  // If there's a token in URL, always show LoginPage to process it
  // even if isLoading is true
  if (tokenFromUrl) {
    console.log('LoginRoute: Token detected in URL, rendering LoginPage');
    return <LoginPage />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to appropriate page
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginRoute />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },
      {
        path: 'chat/:threadId',
        element: <ChatPage />,
      },
      {
        path: 'contacts',
        element: <ContactsPage />,
      },
      {
        path: 'teachers',
        element: <AllTeachersPage />,
      },
      {
        path: 'groups',
        element: <AllGroupsPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPageWrapper />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
