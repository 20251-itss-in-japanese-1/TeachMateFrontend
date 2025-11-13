import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { NotificationsPage } from '../components/NotificationsPage';

export const NotificationsPageWrapper: React.FC = () => {
  const { language } = useAppContext();
  const navigate = useNavigate();

  return (
    <NotificationsPage
      language={language}
      onBack={() => navigate('/')}
    />
  );
};
