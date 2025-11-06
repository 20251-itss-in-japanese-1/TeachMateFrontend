import React from 'react';
import { Teacher } from '../types';
import { translations, Language } from '../translations';
import {
  Modal,
  Avatar as AntAvatar,
  Tag,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Card
} from 'antd';
import { 
  UserOutlined,
  GlobalOutlined,
  BookOutlined,
  StarOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

interface UserProfileViewProps {
  user: Teacher;
  open: boolean;
  onClose: () => void;
  language: Language;
}

export function UserProfileView({ user, open, onClose, language }: UserProfileViewProps) {
  const t = translations[language];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>{language === 'ja' ? 'マイプロフィール' : 'Hồ sơ của tôi'}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
      bodyStyle={{ 
        maxHeight: 'calc(100vh - 200px)', 
        overflowY: 'auto',
        padding: '24px'
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Avatar and Basic Info */}
        <div className="flex flex-col items-center text-center">
          <AntAvatar
            size={120}
            src={user.avatar}
            style={{ backgroundColor: getAvatarColor(user.id) }}
            icon={<UserOutlined />}
          >
            {user.name.charAt(0).toUpperCase()}
          </AntAvatar>
          <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
            {user.name}
          </Title>
        </div>

        <Divider />

        {/* Nationality */}
        <Card size="small" bordered={false} style={{ backgroundColor: '#f5f5f5' }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space>
                <GlobalOutlined style={{ fontSize: 18, color: '#1890ff' }} />
                <Text strong>{language === 'ja' ? '国籍' : 'Quốc tịch'}:</Text>
                <Tag color="blue">{user.nationality}</Tag>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Specialties */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <StarOutlined style={{ fontSize: 18, color: '#faad14' }} />
            <Text strong style={{ fontSize: 16 }}>
              {language === 'ja' ? '専門分野' : 'Chuyên môn'}
            </Text>
          </div>
          <Space size={[8, 8]} wrap>
            {user.specialties.map((specialty, index) => (
              <Tag key={index} color="gold">
                {specialty}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Subjects */}
        {user.subjects && user.subjects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOutlined style={{ fontSize: 18, color: '#52c41a' }} />
              <Text strong style={{ fontSize: 16 }}>
                {language === 'ja' ? '科目' : 'Môn học'}
              </Text>
            </div>
            <Space size={[8, 8]} wrap>
              {user.subjects.map((subject, index) => (
                <Tag key={index} color="green">
                  {subject}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HeartOutlined style={{ fontSize: 18, color: '#eb2f96' }} />
              <Text strong style={{ fontSize: 16 }}>
                {language === 'ja' ? '興味' : 'Sở thích'}
              </Text>
            </div>
            <Space size={[8, 8]} wrap>
              {user.interests.map((interest, index) => (
                <Tag key={index} color="magenta">
                  {interest}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <div>
            <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 12 }}>
              {language === 'ja' ? '自己紹介' : 'Giới thiệu'}
            </Text>
            <Card size="small" bordered style={{ backgroundColor: '#fafafa' }}>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{user.bio}</Text>
            </Card>
          </div>
        )}

        {/* Experience */}
        {user.experience && (
          <Card size="small" bordered={false} style={{ backgroundColor: '#f5f5f5' }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space>
                  <Text strong>{language === 'ja' ? '経験年数' : 'Kinh nghiệm'}:</Text>
                  <Tag color="purple">{user.experience} {language === 'ja' ? '年' : 'năm'}</Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        )}
      </Space>
    </Modal>
  );
}
