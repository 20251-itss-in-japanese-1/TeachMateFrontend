import React from 'react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setIsAdmin, setCurrentUser } = useAppContext();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return <AdminDashboard onLogout={handleLogout} />;
};
