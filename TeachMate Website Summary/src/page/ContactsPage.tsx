import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export const ContactsPage: React.FC = () => {
  const { language } = useAppContext();

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center text-gray-500">
        <p className="text-lg">{language === 'ja' ? '連絡先管理' : 'Quản lý danh bạ'}</p>
        <p className="text-sm mt-2">{language === 'ja' ? '左側のリストから友達やグループを管理できます' : 'Quản lý bạn bè và nhóm từ danh sách bên trái'}</p>
      </div>
    </div>
  );
};
