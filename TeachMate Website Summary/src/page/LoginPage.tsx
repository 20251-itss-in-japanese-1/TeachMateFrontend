import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginRegistration } from '../components/LoginRegistration';
import { LanguageToggle } from '../components/LanguageToggle';
import { useAppContext } from '../contexts/AppContext';
import { getUserProfile } from '../apis/user.api';
import { mapUserToTeacher } from '../utils/mappers';
import { toast } from 'sonner';
import { saveTokenToLocalStorage, removeTokenFromLocalStorage } from '../apis/localtoken';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, setIsAuthenticated, setIsAdmin, setCurrentUser } = useAppContext();

  const handleLogin = async (userData: { name: string; email: string; nationality: 'Japanese' | 'Vietnamese' }, token?: string) => {
    if (token) {
      saveTokenToLocalStorage(token);
      
      try {
        const response = await getUserProfile();
        
        if (response.success) {
          const newUser = mapUserToTeacher(response.data);
          setCurrentUser(newUser);
          setIsAuthenticated(true);
          navigate('/');
        }
      } catch (error) {
        console.error('Failed to fetch user profile after login:', error);
        toast.error('Failed to load user profile');
        removeTokenFromLocalStorage();
      }
    }
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAuthenticated(true);
    toast.success('Admin login successful');
    navigate('/admin');
  };

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle language={language} onToggle={toggleLanguage} />
      </div>
      <LoginRegistration
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        language={language}
      />
    </div>
  );
};
