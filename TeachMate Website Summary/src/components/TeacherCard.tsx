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
    <Card className="hover:shadow-md transition-all border-2" hoverable>
      <Space direction="vertical" size="middle" className="w-full">
        <Space size="middle" align="start">
          <AntAvatar 
            size={80} 
            src={teacher.avatar}
            style={{ backgroundColor: getAvatarColor(teacher.id) }}
          >
            {teacher.name.charAt(0).toUpperCase()}
          </AntAvatar>
          
          <div className="flex-1 min-w-0">
            <Space wrap className="mb-2">
              <Title level={5} ellipsis className="mb-0">{teacher.name}</Title>
              <Tag color={teacher.nationality === 'Japanese' ? 'blue' : 'green'}>
                {teacher.nationality === 'Japanese' ? t.japanese : t.vietnamese}
              </Tag>
            </Space>
            
            <Text type="secondary" className="block mb-3">
              {teacher.experience} {t.yearsExperience}
            </Text>
          </div>
        </Space>
        
        {/* Specialties - Vertical Layout */}
        <div>
          <Text type="secondary" className="text-sm block mb-2">{t.specialties}:</Text>
          <Space wrap>
            {teacher.specialties.map((specialty) => (
              <Tag key={specialty} color="blue">
                {specialty}
              </Tag>
            ))}
          </Space>
        </div>
        
        <Text className="text-gray-700" ellipsis={{ rows: 2 }}>
          {teacher.bio}
        </Text>
        
        <Space.Compact block>
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
      </Space>
    </Card>
  );
}
