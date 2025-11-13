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

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
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
