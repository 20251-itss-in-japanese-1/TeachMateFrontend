import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { router } from './router';
import { Toaster } from './components/ui/sonner';
import 'antd/dist/reset.css';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <Toaster />
    </AppProvider>
  );
}
