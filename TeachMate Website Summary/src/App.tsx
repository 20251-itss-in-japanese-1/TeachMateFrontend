import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { router } from './router';
import { Toaster } from './components/ui/sonner';
import { saveTokenToLocalStorage } from './apis/localtoken';
import 'antd/dist/reset.css';

export default function App() {
  // Check for OAuth token in URL and save it to localStorage BEFORE anything else
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      console.log('App: Token found in URL, saving to localStorage');
      saveTokenToLocalStorage(token);
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      console.log('App: Token saved, URL cleaned. Page will reload to authenticate.');
      // Force reload to trigger AppContext authentication
      window.location.href = '/';
    }
  }, []);

  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AppProvider>
  );
}
