import React from 'react';
import { Teacher } from '../types';
import { translations, Language } from '../translations';
import {
  Modal,
  Avatar as AntAvatar,
  Tag,
  Button as AntButton,
  Space,
  Typography,
  Divider,
  List
} from 'antd';
import {
  MessageOutlined,
  BookOutlined,
  ReadOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface TeacherProfileProps {
  teacher: Teacher | null;
  open: boolean;
  onClose: () => void;
  onStartChat: (teacher: Teacher) => void;
  language: Language;
}

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export function TeacherProfile({ teacher, open, onClose, onStartChat, language }: TeacherProfileProps) {
  const t = translations[language];
  
  if (!teacher) return null;
  
  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={700}
      centered
      style={{ top: 20 }}
      bodyStyle={{ 
        maxHeight: 'calc(100vh - 250px)', 
        overflowY: 'auto',
        paddingTop: '16px',
        paddingBottom: '16px'
      }}
      title={t.teacherProfile}
      footer={[
        <AntButton
          key="chat"
          type="primary"
          icon={<MessageOutlined />}
          onClick={() => {
            onStartChat(teacher);
            onClose();
          }}
          block
        >
          {t.startChat}
        </AntButton>
      ]}
    >
      <Space direction="vertical" size="large" className="w-full">
        {/* Profile Header */}
        <Space size="large" align="start">
          <AntAvatar 
            size={96} 
            src={teacher.avatar}
            style={{ backgroundColor: getAvatarColor(teacher.id) }}
          >
            {teacher.name.charAt(0).toUpperCase()}
          </AntAvatar>
          
          <div className="flex-1">
            <Title level={3} className="mb-2">{teacher.name}</Title>
            <Space wrap className="mb-2">
              <Tag color={teacher.nationality === 'Japanese' ? 'blue' : 'green'}>
                {teacher.nationality === 'Japanese' ? t.japanese : t.vietnamese}
              </Tag>
            </Space>
            <Text className="text-gray-600">{teacher.experience} {t.yearsExperience}</Text>
          </div>
        </Space>
        
        <Divider className="my-2" />

        {/* Specialties */}
        <div>
          <Space className="mb-3">
            <ReadOutlined className="text-gray-600" />
            <Title level={5} className="mb-0">{t.specialties}</Title>
          </Space>
          <Space wrap>
            {teacher.specialties.map((specialty) => (
              <Tag key={specialty} color="blue">
                {specialty}
              </Tag>
            ))}
          </Space>
        </div>
        
        {/* Subjects */}
        <div>
          <Space className="mb-3">
            <BookOutlined className="text-gray-600" />
            <Title level={5} className="mb-0">{t.subjects}</Title>
          </Space>
          <Space wrap>
            {teacher.subjects.map((subject) => (
              <Tag key={subject} color="cyan">
                {subject}
              </Tag>
            ))}
          </Space>
        </div>
        
        {/* Interests */}
        <div>
          <Space className="mb-3">
            <HeartOutlined className="text-gray-600" />
            <Title level={5} className="mb-0">{t.interests}</Title>
          </Space>
          <List
            size="small"
            dataSource={teacher.interests}
            renderItem={(interest: string) => (
              <List.Item>
                <Text>{interest}</Text>
              </List.Item>
            )}
          />
        </div>
        
        {/* Bio */}
        <div>
          <Title level={5} className="mb-3">{t.about}</Title>
          <Paragraph className="text-gray-700">{teacher.bio}</Paragraph>
        </div>
      </Space>
    </Modal>
  );
}
