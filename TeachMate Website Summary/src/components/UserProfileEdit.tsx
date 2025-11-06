import React, { useState } from 'react';
import { Teacher } from '../types';
import { translations, Language } from '../translations';
import {
  Modal,
  Input as AntInput,
  Button as AntButton,
  Select,
  Avatar as AntAvatar,
  Tag,
  Space,
  Typography,
  Divider,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  CloseOutlined 
} from '@ant-design/icons';

const { TextArea } = AntInput;
const { Text, Title } = Typography;

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

interface UserProfileEditProps {
  user: Teacher;
  open: boolean;
  onClose: () => void;
  onSave: (updatedUser: Teacher) => void;
  language: Language;
}

export function UserProfileEdit({ user, open, onClose, onSave, language }: UserProfileEditProps) {
  const t = translations[language];
  const [formData, setFormData] = useState<Teacher>(user);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      });
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_, i) => i !== index)
    });
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject.trim()]
      });
      setNewSubject('');
    }
  };

  const removeSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index)
    });
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((_, i) => i !== index)
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={800}
      centered
      style={{ top: 20 }}
      bodyStyle={{ 
        maxHeight: 'calc(100vh - 250px)', 
        overflowY: 'auto',
        paddingTop: '16px',
        paddingBottom: '16px'
      }}
      title={t.editProfile}
      footer={[
        <AntButton key="cancel" onClick={onClose}>
          {t.cancel}
        </AntButton>,
        <AntButton key="save" type="primary" onClick={handleSave}>
          {t.saveChanges}
        </AntButton>
      ]}
    >
      <Space direction="vertical" size="large" className="w-full">
        {/* Profile Header */}
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <AntAvatar 
              size={80} 
              src={formData.avatar}
              style={{ backgroundColor: getAvatarColor(formData.id) }}
            >
              {formData.name.charAt(0).toUpperCase()}
            </AntAvatar>
          </Col>
          <Col flex="auto">
            <Title level={4} className="mb-2">{t.fullName}</Title>
            <AntInput
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t.fullName}
            />
          </Col>
        </Row>

        <Divider />

        {/* Basic Info */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text strong className="block mb-2">{t.nationality}</Text>
            <Select
              value={formData.nationality}
              onChange={(value) => setFormData({ ...formData, nationality: value as 'Japanese' | 'Vietnamese' })}
              style={{ width: '100%' }}
              options={[
                { value: 'Japanese', label: t.japanese },
                { value: 'Vietnamese', label: t.vietnamese }
              ]}
            />
          </Col>
          <Col xs={24} md={12}>
            <Text strong className="block mb-2">{t.experience}</Text>
            <AntInput
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
              placeholder={t.experience}
            />
          </Col>
        </Row>

        {/* Bio */}
        <div>
          <Text strong className="block mb-2">{t.bio}</Text>
          <TextArea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            placeholder={t.bio}
          />
        </div>

        {/* Specialties */}
        <div>
          <Text strong className="block mb-2">{t.specialties}</Text>
          <Space.Compact className="mb-3">
            <AntInput
              placeholder={t.addSpecialty}
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onPressEnter={addSpecialty}
            />
            <AntButton icon={<PlusOutlined />} onClick={addSpecialty} />
          </Space.Compact>
          <Space wrap>
            {formData.specialties.map((specialty, index) => (
              <Tag
                key={index}
                closable
                onClose={() => removeSpecialty(index)}
                color="blue"
              >
                {specialty}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Subjects */}
        <div>
          <Text strong className="block mb-2">{t.subjects}</Text>
          <Space.Compact className="mb-3">
            <AntInput
              placeholder={t.addSubject}
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onPressEnter={addSubject}
            />
            <AntButton icon={<PlusOutlined />} onClick={addSubject} />
          </Space.Compact>
          <Space wrap>
            {formData.subjects.map((subject, index) => (
              <Tag
                key={index}
                closable
                onClose={() => removeSubject(index)}
                color="cyan"
              >
                {subject}
              </Tag>
            ))}
          </Space>
        </div>

        {/* Interests */}
        <div>
          <Text strong className="block mb-2">{t.interests}</Text>
          <Space.Compact className="mb-3">
            <AntInput
              placeholder={t.addInterest}
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onPressEnter={addInterest}
            />
            <AntButton icon={<PlusOutlined />} onClick={addInterest} />
          </Space.Compact>
          <Space wrap>
            {formData.interests.map((interest, index) => (
              <Tag
                key={index}
                closable
                onClose={() => removeInterest(index)}
                color="green"
              >
                {interest}
              </Tag>
            ))}
          </Space>
        </div>
      </Space>
    </Modal>
  );
}
