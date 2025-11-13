import React, { useState } from 'react';
import { Modal, Input, Avatar, Button, Space, Typography, Divider, Checkbox, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Teacher } from '../types';
import { Language } from '../translations';
import { createThreadGroup } from '../apis/thread.api';

const { Text } = Typography;

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onCreateGroup?: (name: string, memberIds: string[]) => void;
  onGroupCreated?: () => void;
  language: Language;
}

export function CreateGroupModal({
  open,
  onClose,
  teachers,
  onCreateGroup,
  onGroupCreated,
  language
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const translations = {
    ja: {
      title: 'グループを作成',
      namePlaceholder: 'グループ名を入力...',
      searchPlaceholder: '名前またはメールで検索',
      cancel: 'キャンセル',
      create: 'グループ作成'
    },
    vi: {
      title: 'Tạo nhóm',
      namePlaceholder: 'Nhập tên nhóm...',
      searchPlaceholder: 'Nhập tên hoặc email',
      cancel: 'Hủy',
      create: 'Tạo nhóm'
    }
  };

  const t = translations[language];

  const filtered = teachers.filter(tchr =>
    tchr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tchr.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      message.warning(language === 'ja' ? 'グループ名を入力してください' : 'Vui lòng nhập tên nhóm');
      return;
    }
    
    setIsCreating(true);
    try {
      // Call API to create thread group
      const response = await createThreadGroup(groupName.trim(), selectedIds);
      
      if (response.success) {
        message.success(language === 'ja' ? 'グループを作成しました' : 'Tạo nhóm thành công');
        
        // Reset form
        setGroupName('');
        setSearchQuery('');
        setSelectedIds([]);
        
        // Close modal
        onClose();
        
        // Call callback to refresh threads list
        if (onGroupCreated) {
          onGroupCreated();
        }
        
        // Fallback: call old callback if provided
        if (onCreateGroup) {
          onCreateGroup(groupName.trim(), selectedIds);
        }
      } else {
        message.error(response.message || (language === 'ja' ? 'グループの作成に失敗しました' : 'Tạo nhóm thất bại'));
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      message.error(language === 'ja' ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      title={t.title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isCreating}>{t.cancel}</Button>,
        <Button key="create" type="primary" onClick={handleCreate} loading={isCreating}>{t.create}</Button>
      ]}
      width={600}
      centered
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingTop: 16, paddingBottom: 16 }}
    >
      <Space direction="vertical" size="large" className="w-full">
        <Space align="center" style={{ width: '100%' }}>
          <Avatar size={40} style={{ backgroundColor: '#f0f2f5' }}>👥</Avatar>
          <Input placeholder={t.namePlaceholder} value={groupName} onChange={e => setGroupName(e.target.value)} />
        </Space>

        <Input
          size="middle"
          placeholder={t.searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        <div>
          {filtered.length > 0 ? (
            filtered.map(teacher => (
              <div key={teacher.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <Space>
                  <Checkbox onChange={() => toggleSelect(teacher.id)} checked={selectedIds.includes(teacher.id)} />
                  <Avatar src={teacher.avatar} size={40} />
                  <div>
                    <Text strong style={{ display: 'block' }}>{teacher.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {teacher.name.toLowerCase().replace(/\s+/g, '.')}@example.com
                    </Text>
                  </div>
                </Space>
              </div>
            ))
          ) : (
            <Text type="secondary">No results</Text>
          )}
        </div>
      </Space>
    </Modal>
  );
}
