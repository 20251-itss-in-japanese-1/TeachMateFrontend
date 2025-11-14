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
      console.log('handleLogin called with token');
      saveTokenToLocalStorage(token);
      
      try {
        console.log('Fetching user profile...');
        const response = await getUserProfile();
        console.log('getUserProfile response:', response);
        
        if (response.success && response.data) {
          const newUser = mapUserToTeacher(response.data);
          console.log('Setting user and navigating:', newUser);
          setCurrentUser(newUser);
          setIsAuthenticated(true);
          toast.success('Login successful!');
          navigate('/');
        } else {
          throw new Error('Failed to get user profile');
        }
      } catch (error: any) {
        console.error('Failed to fetch user profile after login:', error);
        toast.error(error.response?.data?.message || 'Failed to load user profile');
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
