import React, { useState } from 'react';
import { Modal, Input, Avatar, Button, Space, Typography, Divider } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Teacher } from '../types';
import { Language } from '../translations';

const { Text } = Typography;

interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
  teachers: Teacher[];
  currentUserId: string;
  onSendFriendRequest: (teacher: Teacher) => void;
  language: Language;
}

export function AddFriendModal({
  open,
  onClose,
  teachers,
  currentUserId,
  onSendFriendRequest,
  language
}: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeachers = teachers.filter(teacher => 
    teacher.id !== currentUserId &&
    (teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     teacher.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const translations = {
    ja: {
      title: '友達を追加',
      searchPlaceholder: '名前またはメールで検索',
      suggestions: '知り合いかもしれません',
      sentRequest: '友達リクエストを送信しました',
      addFriend: '友達追加',
      cancel: 'キャンセル',
      search: '検索'
    },
    vi: {
      title: 'Thêm bạn',
      searchPlaceholder: 'Tìm theo tên hoặc email',
      suggestions: 'Có thể bạn quen',
      sentRequest: 'Từ gợi ý kết bạn',
      addFriend: 'Kết bạn',
      cancel: 'Hủy',
      search: 'Tìm kiếm'
    }
  };

  const t = translations[language];

  const handleAddFriend = (teacher: Teacher) => {
    onSendFriendRequest(teacher);
  };

  return (
    <Modal
      title={t.title}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t.cancel}
        </Button>,
        <Button key="search" type="primary" icon={<SearchOutlined />}>
          {t.search}
        </Button>
      ]}
      width={600}
      centered
      style={{ top: 20 }}
      bodyStyle={{ 
        maxHeight: 'calc(100vh - 250px)', 
        overflowY: 'auto',
        paddingTop: '16px',
        paddingBottom: '16px'
      }}
    >
      <Space direction="vertical" size="large" className="w-full">
        {/* Search Input */}
        <Input
          size="large"
          placeholder={t.searchPlaceholder}
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Suggestions Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">💡</span>
            <Text strong>{t.suggestions}</Text>
          </div>

          <div>
            <Space direction="vertical" size="middle" className="w-full">
              {filteredTeachers.slice(0, 20).map((teacher) => (
                <div key={teacher.id}>
                  <div className="flex items-center justify-between py-2">
                    <Space size="middle">
                      <Avatar 
                        size={48} 
                        src={teacher.avatar}
                        style={{ backgroundColor: '#1890ff' }}
                      >
                        {teacher.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Text strong className="block">{teacher.name}</Text>
                        <Text type="secondary" className="text-sm">
                          {teacher.nationality} {language === 'ja' ? '教師' : 'giáo viên'}
                        </Text>
                        <div>
                          <Text type="secondary" className="text-xs">
                            {t.sentRequest}
                          </Text>
                        </div>
                      </div>
                    </Space>
                    <Button 
                      type="default"
                      onClick={() => handleAddFriend(teacher)}
                    >
                      {t.addFriend}
                    </Button>
                  </div>
                  <Divider className="my-2" />
                </div>
              ))}
            </Space>
          </div>
        </div>
      </Space>
    </Modal>
  );
}
