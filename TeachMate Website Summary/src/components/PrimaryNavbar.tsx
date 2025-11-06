import React from 'react';
import {
  Button as AntButton,
  Avatar as AntAvatar,
  Dropdown,
  Space,
  Typography
} from 'antd';
import {
  MessageOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  EditOutlined,
  HomeOutlined,
  BellOutlined
} from '@ant-design/icons';
import { translations, Language } from '../translations';
import { Teacher, Notification } from '../types';

const { Text } = Typography;

interface PrimaryNavbarProps {
  user: Teacher;
  activeView: 'home' | 'chat' | 'contacts' | 'all-teachers' | 'all-groups' | 'notifications' | 'admin';
  onViewChange: (view: 'home' | 'chat' | 'contacts' | 'all-teachers' | 'all-groups' | 'notifications' | 'admin') => void;
  onViewProfile: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
  onViewNotifications: () => void;
  unreadNotificationsCount: number;
  language: Language;
}

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export function PrimaryNavbar({
  user,
  activeView,
  onViewChange,
  onViewProfile,
  onEditProfile,
  onLogout,
  onViewNotifications,
  unreadNotificationsCount,
  language
}: PrimaryNavbarProps) {
  const t = translations[language];

  const menuItems = [
    {
      key: 'profile',
      label: t.myProfile,
      icon: <UserOutlined />,
      onClick: onViewProfile
    },
    {
      key: 'edit',
      label: t.editProfile,
      icon: <EditOutlined />,
      onClick: onEditProfile
    },
    {
      key: 'settings',
      label: t.settings,
      icon: <SettingOutlined />
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: t.logout,
      icon: <LogoutOutlined />,
      onClick: onLogout,
      danger: true
    }
  ];

  return (
    <div className="w-20 bg-gradient-to-b from-purple-900 to-indigo-900 flex flex-col items-center py-4 border-r-2 border-purple-700">
      {/* User Avatar with Dropdown */}
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={['click']}
      >
        <AntAvatar
          size={48}
          src={user.avatar}
          style={{ backgroundColor: getAvatarColor(user.id), cursor: 'pointer' }}
          className="mb-6 hover:opacity-80 transition-opacity"
        >
          {user.name.charAt(0).toUpperCase()}
        </AntAvatar>
      </Dropdown>

      <div className="h-px w-12 bg-purple-600 mb-4" />

      {/* Home Icon */}
      <AntButton
        type={activeView === 'home' ? 'primary' : 'text'}
        shape="circle"
        size="large"
        onClick={() => onViewChange('home')}
        className={`w-12 h-12 mb-3 ${activeView === 'home'
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'text-purple-300 hover:bg-purple-800 hover:text-white'
          }`}
        icon={<HomeOutlined />}
      />

      {/* Chat Icon */}
      <AntButton
        type={activeView === 'chat' ? 'primary' : 'text'}
        shape="circle"
        size="large"
        onClick={() => onViewChange('chat')}
        className={`w-12 h-12 mb-3 ${activeView === 'chat'
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'text-purple-300 hover:bg-purple-800 hover:text-white'
          }`}
        icon={<MessageOutlined />}
      />

      {/* Contacts Icon */}
      <AntButton
        type={activeView === 'contacts' ? 'primary' : 'text'}
        shape="circle"
        size="large"
        onClick={() => onViewChange('contacts')}
        className={`w-12 h-12 mb-3 ${activeView === 'contacts'
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'text-purple-300 hover:bg-purple-800 hover:text-white'
          }`}
        icon={<TeamOutlined />}
      />

      {/* Notification Bell */}
      <AntButton
        type={activeView === 'notifications' ? 'primary' : 'text'}
        shape="circle"
        size="large"
        onClick={onViewNotifications}
        className={`w-12 h-12 mb-3 relative ${activeView === 'notifications'
          ? 'bg-purple-600 hover:bg-purple-700 text-white'
          : 'text-purple-300 hover:bg-purple-800 hover:text-white'
          }`}
        icon={<BellOutlined />}
      >
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-indigo-900" />
        )}
      </AntButton>

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  );
}
