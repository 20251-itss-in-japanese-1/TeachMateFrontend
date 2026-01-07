import React from 'react';
import { Teacher } from '../types';
import { 
  Card, 
  Avatar as AntAvatar, 
  Tag, 
  Button as AntButton, 
  Space,
  Typography
} from 'antd';
import { 
  MessageOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { translations, Language } from '../translations';

const { Text, Title } = Typography;

interface TeacherCardProps {
  teacher: Teacher;
  onViewProfile: (teacher: Teacher) => void;
  onStartChat: (teacher: Teacher) => void;
  language: Language;
}

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export function TeacherCard({ teacher, onViewProfile, onStartChat, language }: TeacherCardProps) {
  const t = translations[language];
  
  return (
    <Card className="hover:shadow-md transition-all border-2 h-full" hoverable>
      <div className="flex flex-col h-full" style={{ minHeight: '380px' }}>
        <Space size="middle" align="start" className="mb-4">
          <AntAvatar 
            size={80} 
            src={teacher.avatar}
            style={{ backgroundColor: getAvatarColor(teacher.id) }}
          >
            {teacher.name.charAt(0).toUpperCase()}
          </AntAvatar>
          
          <div className="flex-1 min-w-0">
            <Title level={5} ellipsis className="mb-2">{teacher.name}</Title>
            
            <Tag color={teacher.nationality === 'Japanese' ? 'blue' : 'green'} className="mb-2">
              {teacher.nationality === 'Japanese' ? t.japanese : t.vietnamese}
            </Tag>
            
            <Text type="secondary" className="block">
              {teacher.experience} {t.yearsExperience}
            </Text>
          </div>
        </Space>
        
        {/* Specialties - Vertical Layout */}
        <div className="mb-3">
          <Text type="secondary" className="text-sm block mb-2">{t.specialties}:</Text>
          <div className="min-h-[60px]">
            <Space wrap>
              {teacher.specialties.slice(0, 3).map((specialty) => (
                <Tag key={specialty} color="blue">
                  {specialty}
                </Tag>
              ))}
              {teacher.specialties.length > 3 && (
                <Tag color="default">+{teacher.specialties.length - 3}</Tag>
              )}
            </Space>
          </div>
        </div>
        
        <div className="flex-1 mb-4">
          <Text className="text-gray-700 line-clamp-3 block">
            {teacher.bio || (language === 'ja' ? '自己紹介なし' : 'Chưa có giới thiệu')}
          </Text>
        </div>
        
        <Space.Compact block className="mt-auto">
          <AntButton 
            icon={<UserOutlined />}
            onClick={() => onViewProfile(teacher)}
            style={{ width: '50%' }}
          >
            {t.viewProfile}
          </AntButton>
          <AntButton 
            type="primary"
            icon={<MessageOutlined />}
            onClick={() => onStartChat(teacher)}
            style={{ width: '50%' }}
          >
            {t.chat}
          </AntButton>
        </Space.Compact>
      </div>
    </Card>
  );
}
