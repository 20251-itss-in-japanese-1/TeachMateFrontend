import React from 'react';
import { Teacher } from '../types';
import { translations, Language } from '../translations';
import { 
  Button as AntButton,
  Avatar as AntAvatar,
  Badge as AntBadge,
  Divider,
  Space,
  Typography,
  Menu
} from 'antd';
import { 
  TeamOutlined,
  MessageOutlined,
  CalendarOutlined,
  SafetyOutlined,
  UserOutlined,
  LogoutOutlined,
  BookOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface SidebarProps {
  user: Teacher;
  currentView: string;
  onViewChange: (view: string) => void;
  onEditProfile: () => void;
  onLogout: () => void;
  language: Language;
  teachers: Teacher[];
  subjectFilter: string;
  onSubjectFilterChange: (subject: string) => void;
}

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export function Sidebar({
  user,
  currentView,
  onViewChange,
  onEditProfile,
  onLogout,
  language,
  teachers,
  subjectFilter,
  onSubjectFilterChange
}: SidebarProps) {
  const t = translations[language];
  
  // Get all unique subjects/specialties from all teachers
  const allSubjects = Array.from(
    new Set(
      teachers.flatMap(teacher => [...teacher.specialties, ...teacher.subjects])
    )
  ).sort();

  const navItems = [
    { key: 'teachers', label: t.teachers, icon: <TeamOutlined /> },
    { key: 'messages', label: t.messages, icon: <MessageOutlined /> },
    { key: 'sessions', label: t.sessions, icon: <CalendarOutlined /> }
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-emerald-50 to-teal-50 border-r-2 border-emerald-200 h-screen flex flex-col shadow-lg">
      {/* User Profile Section */}
      <div className="p-6 border-b-2 border-emerald-200 bg-white/60 backdrop-blur-sm">
        <Space direction="vertical" size="middle" className="w-full">
          <Space size="middle">
            <AntAvatar 
              size={56} 
              src={user.avatar}
              style={{ backgroundColor: getAvatarColor(user.id) }}
            >
              {user.name.charAt(0).toUpperCase()}
            </AntAvatar>
            <div className="flex-1 min-w-0">
              <Title level={5} ellipsis className="mb-0">{user.name}</Title>
              <Text type="secondary" className="text-sm">
                {user.nationality === 'Japanese' ? t.japanese : t.vietnamese}
              </Text>
            </div>
          </Space>
          
          <Space.Compact block>
            <AntButton 
              icon={<UserOutlined />}
              onClick={onEditProfile}
              style={{ width: '50%' }}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
            >
              {t.editProfile}
            </AntButton>
            <AntButton 
              icon={<LogoutOutlined />}
              onClick={onLogout}
              style={{ width: '50%' }}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
            >
              {t.logout}
            </AntButton>
          </Space.Compact>
        </Space>
      </div>
      
      {/* Navigation */}
      <div className="p-4 bg-white/40">
        <Menu
          mode="inline"
          selectedKeys={[currentView]}
          items={navItems}
          onClick={({ key }) => onViewChange(key)}
          className="bg-transparent border-none"
          style={{ backgroundColor: 'transparent' }}
        />
      </div>
      
      <Divider className="my-2" />
      
      {/* Expertise Filter Section */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 bg-white/30">
        <Space className="mb-3">
          <BookOutlined className="text-emerald-600" />
          <Text strong className="text-sm text-emerald-800">{t.filterByExpertise}</Text>
        </Space>
        
        <div className="flex-1 overflow-auto">
          <Space direction="vertical" size="small" className="w-full">
            <AntButton
              type={subjectFilter === 'all' ? 'primary' : 'text'}
              block
              onClick={() => onSubjectFilterChange('all')}
              className={`text-left ${subjectFilter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-emerald-700 hover:bg-emerald-50'}`}
            >
              {t.allSubjects}
            </AntButton>
            
            {allSubjects.map((subject) => {
              const teacherCount = teachers.filter(
                teacher => 
                  teacher.specialties.includes(subject) || 
                  teacher.subjects.includes(subject)
              ).length;
              
              return (
                <AntButton
                  key={subject}
                  type={subjectFilter === subject ? 'primary' : 'text'}
                  block
                  onClick={() => onSubjectFilterChange(subject)}
                  className={`text-left flex items-center justify-between ${subjectFilter === subject ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-emerald-700 hover:bg-emerald-50'}`}
                >
                  <Text ellipsis className="flex-1">{subject}</Text>
                  <AntBadge count={teacherCount} showZero className="ml-2" />
                </AntButton>
              );
            })}
          </Space>
        </div>
      </div>
    </div>
  );
}
