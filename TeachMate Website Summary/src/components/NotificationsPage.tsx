import React, { useState, useEffect } from 'react';
import { Notification, Teacher } from '../types';
import { translations, Language } from '../translations';
import { 
  List, 
  Avatar, 
  Button, 
  Tag, 
  Space, 
  Tabs, 
  Badge,
  Typography,
  Empty,
  Tooltip
} from 'antd';
import {
  UserAddOutlined,
  CalendarOutlined,
  TeamOutlined,
  MessageOutlined,
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  LeftOutlined
} from '@ant-design/icons';
import { getNoti, markNotiAsRead, markAllNotiAsRead } from '../apis/noti.api';
import { toast } from 'sonner';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface NotificationsPageProps {
  language: Language;
  onBack: () => void;
}

export function NotificationsPage({
  language,
  onBack
}: NotificationsPageProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const response = await getNoti();
        if (response.success) {
          const mappedNotifications: Notification[] = response.data.map(noti => ({
            id: noti._id,
            type: noti.type as Notification['type'],
            title: noti.title,
            message: noti.body,
            isRead: noti.read,
            createdAt: new Date(noti.createdAt),
            fromUserId: noti.refId
          }));
          if (active) setNotifications(mappedNotifications);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        if (active) setNotifications([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await markNotiAsRead(notificationId);
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        toast.success(
          language === 'ja' 
            ? '通知を既読にしました' 
            : 'Đã đánh dấu thông báo là đã đọc'
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error(
        language === 'ja' 
          ? '既読マークに失敗しました' 
          : 'Không thể đánh dấu đã đọc'
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await markAllNotiAsRead();
      
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        toast.success(
          language === 'ja' 
            ? 'すべての通知を既読にしました' 
            : 'Đã đánh dấu tất cả thông báo là đã đọc'
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error(
        language === 'ja' 
          ? 'すべて既読マークに失敗しました' 
          : 'Không thể đánh dấu tất cả đã đọc'
      );
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    toast.success(
      language === 'ja' 
        ? '通知を削除しました' 
        : 'Đã xóa thông báo'
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications
    .filter(n => {
      if (activeTab === 'all') return true;
      if (activeTab === 'unread') return !n.isRead;
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getNotificationIcon = (type: Notification['type']) => {
    const iconStyle = { fontSize: '24px' };
    switch (type) {
      case 'friend_request':
        return <UserAddOutlined style={{ ...iconStyle, color: '#1890ff' }} />;
      case 'appointment':
        return <CalendarOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
      case 'group_join':
        return <TeamOutlined style={{ ...iconStyle, color: '#722ed1' }} />;
      case 'message':
        return <MessageOutlined style={{ ...iconStyle, color: '#fa8c16' }} />;
      case 'system':
        return <BellOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
      default:
        return <BellOutlined style={{ ...iconStyle, color: '#8c8c8c' }} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return '#1890ff';
      case 'appointment':
        return '#52c41a';
      case 'group_join':
        return '#722ed1';
      case 'message':
        return '#fa8c16';
      case 'system':
        return '#8c8c8c';
      default:
        return '#8c8c8c';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    const labels = {
      friend_request: language === 'ja' ? '友達リクエスト' : 'Kết bạn',
      appointment: language === 'ja' ? '予定' : 'Lịch hẹn',
      group_join: language === 'ja' ? 'グループ' : 'Nhóm',
      message: language === 'ja' ? 'メッセージ' : 'Tin nhắn',
      system: language === 'ja' ? 'システム' : 'Hệ thống'
    };
    return labels[type] || '';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'ja' ? 'たった今' : 'Vừa xong';
    if (diffMins < 60) return `${diffMins} ${language === 'ja' ? '分前' : 'phút trước'}`;
    if (diffHours < 24) return `${diffHours} ${language === 'ja' ? '時間前' : 'giờ trước'}`;
    if (diffDays < 7) return `${diffDays} ${language === 'ja' ? '日前' : 'ngày trước'}`;
    
    return notifDate.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'vi-VN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Space>
              <Button 
                icon={<LeftOutlined />} 
                onClick={onBack}
                type="text"
                size="large"
              >
                {t.back}
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                {language === 'ja' ? '通知' : 'Thông báo'}
              </Title>
              {unreadCount > 0 && (
                <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
              )}
            </Space>
            
            {notifications.length > 0 && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={handleMarkAllAsRead}
              >
                {language === 'ja' ? 'すべて既読' : 'Đánh dấu tất cả đã đọc'}
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
          >
            <TabPane 
              tab={
                <span>
                  {language === 'ja' ? 'すべて' : 'Tất cả'}
                  <Badge 
                    count={notifications.length} 
                    style={{ backgroundColor: '#1890ff', marginLeft: 8 }} 
                  />
                </span>
              } 
              key="all" 
            />
            <TabPane 
              tab={
                <span>
                  {language === 'ja' ? '未読' : 'Chưa đọc'}
                  {unreadCount > 0 && (
                    <Badge 
                      count={unreadCount} 
                      style={{ backgroundColor: '#ff4d4f', marginLeft: 8 }} 
                    />
                  )}
                </span>
              } 
              key="unread" 
            />
          </Tabs>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Space direction="vertical" align="center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <Text type="secondary">{language === 'ja' ? '読み込み中...' : 'Đang tải...'}</Text>
              </Space>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                activeTab === 'unread' 
                  ? (language === 'ja' ? '未読の通知はありません' : 'Không có thông báo chưa đọc')
                  : (language === 'ja' ? '通知はありません' : 'Không có thông báo')
              }
              style={{ padding: '60px 0' }}
            />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={filteredNotifications}
              renderItem={(notification) => (
                <List.Item
                  style={{
                    backgroundColor: notification.isRead ? '#fff' : '#f0f5ff',
                    padding: '16px 24px',
                    borderBottom: '1px solid #f0f0f0'
                  }}
                  actions={[
                    !notification.isRead && (
                      <Tooltip title={language === 'ja' ? '既読' : 'Đánh dấu đã đọc'}>
                        <Button 
                          type="text"
                          icon={<CheckOutlined />}
                          onClick={() => handleMarkAsRead(notification.id)}
                          style={{ color: '#1890ff' }}
                        />
                      </Tooltip>
                    ),
                    <Tooltip title={language === 'ja' ? '削除' : 'Xóa'}>
                      <Button 
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteNotification(notification.id)}
                      />
                    </Tooltip>
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size={48} 
                        style={{ backgroundColor: '#f0f0f0' }}
                        icon={getNotificationIcon(notification.type)}
                      />
                    }
                    title={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Space>
                          <Text strong style={{ fontSize: '15px' }}>
                            {notification.title}
                          </Text>
                          {!notification.isRead && (
                            <Badge status="processing" />
                          )}
                        </Space>
                        <Tag color={getNotificationColor(notification.type)}>
                          {getTypeLabel(notification.type)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <Text>{notification.message}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {formatTime(notification.createdAt)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

