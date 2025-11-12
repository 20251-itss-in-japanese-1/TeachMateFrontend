import React, { useState } from 'react';
import { Teacher, Message } from '../types';
import { 
  Input as AntInput, 
  Button as AntButton, 
  Avatar as AntAvatar,
  Drawer,
  Collapse,
  List,
  Empty,
  Tooltip,
  Space,
  Tag,
  Modal,
  DatePicker,
  Typography,
  Divider,
  Popover
} from 'antd';
import { 
  SendOutlined, 
  UploadOutlined, 
  CalendarOutlined, 
  SmileOutlined,
  LeftOutlined,
  InfoCircleOutlined,
  EditOutlined,
  BellOutlined,
  TeamOutlined,
  PictureOutlined,
  FileOutlined,
  LinkOutlined,
  SettingOutlined,
  WarningOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserAddOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { translations, Language } from '../translations';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { CheckCheck, MessageCircle } from 'lucide-react';
import { sendMessage } from '../apis/chat.api';

const { Panel } = Collapse;
const { TextArea } = AntInput;
const { Text, Title } = Typography;

interface ChatInterfaceProps {
  currentTeacher: Teacher;
  selectedTeacher: Teacher;
  threadDetail?: {
    thread: any;
    messages: any[];
  } | null;
  isLoadingMessages?: boolean;
  onBack: () => void;
  onViewProfile: (teacher: Teacher) => void;
  isFriend: boolean;
  onSendFriendRequest: (teacher: Teacher) => void;
  language: Language;
}

interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface EnhancedMessage extends Message {
  reactions?: MessageReaction[];
}

interface Reminder {
  id: string;
  date: Date;
  time: string;
  content: string;
}

interface SharedMedia {
  id: string;
  type: 'image' | 'video' | 'file' | 'link';
  name: string;
  url: string;
  date: Date;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '😂', '🎉', '👏'];

export function ChatInterface({
  currentTeacher,
  selectedTeacher,
  threadDetail,
  isLoadingMessages = false,
  onBack,
  onViewProfile,
  isFriend,
  onSendFriendRequest,
  language
}: ChatInterfaceProps) {
  const t = translations[language];
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<EnhancedMessage[]>([
    {
      id: '1',
      senderId: selectedTeacher.id,
      receiverId: currentTeacher.id,
      content: 'Hello! I would love to exchange teaching experiences with you.',
      timestamp: new Date('2025-10-14T10:00:00'),
      type: 'text',
      reactions: [{ emoji: '👍', count: 1, userIds: [currentTeacher.id] }]
    },
    {
      id: '2',
      senderId: currentTeacher.id,
      receiverId: selectedTeacher.id,
      content: 'Hi! That sounds great. I\'m particularly interested in your approach to student engagement.',
      timestamp: new Date('2025-10-14T10:05:00'),
      type: 'text',
      reactions: [{ emoji: '❤️', count: 1, userIds: [selectedTeacher.id] }]
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [nickname, setNickname] = useState(selectedTeacher.name);
  const [editingNickname, setEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(selectedTeacher.name);
  
  // Upload & Appointment Modals
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<any>(null);
  const [appointmentTime, setAppointmentTime] = useState('12:00');
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentDescription, setAppointmentDescription] = useState('');
  
  // Mock data
  const [reminders] = useState<Reminder[]>([
    { id: '1', date: new Date('2025-10-22T14:00:00'), time: '14:00', content: 'Thảo luận phương pháp giảng dạy Toán' },
    { id: '2', date: new Date('2025-10-25T10:30:00'), time: '10:30', content: 'Chia sẻ tài liệu STEM' }
  ]);
  
  const [sharedMedia] = useState<SharedMedia[]>([
    { id: '1', type: 'image', name: 'teaching_method.jpg', url: '#', date: new Date('2025-10-10') },
    { id: '2', type: 'file', name: 'lesson_plan.pdf', url: '#', date: new Date('2025-10-12') },
    { id: '3', type: 'link', name: 'Educational Resources', url: 'https://example.com', date: new Date('2025-10-14') }
  ]);
  
  const [commonGroups] = useState([
    { id: '1', name: 'Mathematics Education Exchange', memberCount: 124 },
    { id: '3', name: 'STEM Education Innovation', memberCount: 189 }
  ]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const messageData = {
        content: newMessage,
        threadId: threadDetail?.thread?._id,
        recipientId: !threadDetail?.thread?._id ? selectedTeacher.id : undefined
      };

      const response = await sendMessage(messageData);
      
      if (response.success) {
        setNewMessage('');
        toast.success(
          language === 'ja' 
            ? 'メッセージを送信しました' 
            : 'Đã gửi tin nhắn'
        );
        
        // Trigger refetch to get new messages
        // The useChat hook will automatically refetch when threadId changes
        // or you can manually trigger refetch if needed
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error(
        language === 'ja'
          ? 'メッセージの送信に失敗しました'
          : 'Gửi tin nhắn thất bại'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id !== messageId) return msg;
      
      const reactions = msg.reactions || [];
      const existingReaction = reactions.find(r => r.emoji === emoji);
      
      if (existingReaction) {
        if (existingReaction.userIds.includes(currentTeacher.id)) {
          existingReaction.count--;
          existingReaction.userIds = existingReaction.userIds.filter(id => id !== currentTeacher.id);
          return {
            ...msg,
            reactions: existingReaction.count === 0 
              ? reactions.filter(r => r.emoji !== emoji)
              : reactions
          };
        } else {
          existingReaction.count++;
          existingReaction.userIds.push(currentTeacher.id);
          return { ...msg, reactions };
        }
      } else {
        return {
          ...msg,
          reactions: [...reactions, { emoji, count: 1, userIds: [currentTeacher.id] }]
        };
      }
    }));
  };

  const handleSaveNickname = () => {
    setNickname(tempNickname);
    setEditingNickname(false);
    toast.success(language === 'ja' ? 'ニックネームを更新しました' : 'Đã cập nhật biệt danh');
  };

  const handleReportConversation = () => {
    Modal.confirm({
      title: language === 'ja' ? '会話を報告' : 'Báo cáo cuộc trò chuyện',
      content: language === 'ja' ? 'この会話を管理者に報告しますか?' : 'Bạn có chắc chắn muốn báo cáo cuộc trò chuyện này cho quản trị viên?',
      okText: language === 'ja' ? '報告' : 'Báo cáo',
      cancelText: language === 'ja' ? 'キャンセル' : 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        toast.success(language === 'ja' ? '報告を送信しました' : 'Đã gửi báo cáo');
      }
    });
  };

  const handleDeleteHistory = () => {
    Modal.confirm({
      title: language === 'ja' ? '履歴を削除' : 'Xóa lịch sử trò chuyện',
      content: language === 'ja' ? 'すべてのメッセージ履歴を削除しますか?' : 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?',
      okText: language === 'ja' ? '削除' : 'Xóa',
      cancelText: language === 'ja' ? 'キャンセル' : 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        setMessages([]);
        toast.success(language === 'ja' ? '履歴を削除しました' : 'Đã xóa lịch sử trò chuyện');
      }
    });
  };

  const handleUploadFile = () => {
    const fileMessage: EnhancedMessage = {
      id: Date.now().toString(),
      senderId: currentTeacher.id,
      receiverId: selectedTeacher.id,
      content: language === 'ja' ? 'ファイルを共有しました' : 'Đã chia sẻ tệp tin',
      timestamp: new Date(),
      type: 'slide',
      slideUrl: 'example-file.pdf',
      reactions: []
    };
    
    setMessages([...messages, fileMessage]);
    setUploadModalVisible(false);
    toast.success(language === 'ja' ? 'ファイルをアップロードしました' : 'Đã tải lên tệp tin');
  };

  const handleCreateAppointment = () => {
    if (!appointmentDate || !appointmentTitle.trim()) {
      toast.error(language === 'ja' ? '日時とタイトルを入力してください' : 'Vui lòng nhập ngày giờ và tiêu đề');
      return;
    }

    const appointmentMessage: EnhancedMessage = {
      id: Date.now().toString(),
      senderId: currentTeacher.id,
      receiverId: selectedTeacher.id,
      content: `📅 ${language === 'ja' ? '予定' : 'Lịch hẹn'}: ${appointmentTitle}\n${appointmentDescription}`,
      timestamp: new Date(),
      type: 'text',
      reactions: []
    };

    setMessages([...messages, appointmentMessage]);
    toast.success(
      language === 'ja' 
        ? `予定を設定しました: ${appointmentDate.format('YYYY/MM/DD')} ${appointmentTime}`
        : `Đã đặt lịch hẹn: ${appointmentDate.format('DD/MM/YYYY')} ${appointmentTime}`
    );
    
    setAppointmentModalVisible(false);
    setAppointmentDate(null);
    setAppointmentTime('12:00');
    setAppointmentTitle('');
    setAppointmentDescription('');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <Space size="middle">
            <Tooltip title={t.back}>
              <AntButton 
                type="text" 
                icon={<LeftOutlined />} 
                onClick={onBack}
                size="large"
              />
            </Tooltip>
            
            <div 
              onClick={() => onViewProfile(selectedTeacher)}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <AntAvatar size={48} src={selectedTeacher.avatar}>
                {selectedTeacher.name.charAt(0)}
              </AntAvatar>
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  {nickname}
                </Title>
                <Text type="secondary">
                  {selectedTeacher.nationality === 'Japanese' ? t.japanese : t.vietnamese}
                </Text>
              </div>
            </div>

            {!isFriend && (
              <AntButton
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => onSendFriendRequest(selectedTeacher)}
              >
                {language === 'ja' ? '友達になる' : 'Kết bạn'}
              </AntButton>
            )}
          </Space>

          <Space>
            <Tooltip title={language === 'ja' ? 'メッセージを検索' : 'Tìm kiếm tin nhắn'}>
              <AntButton
                type={showSearch ? 'primary' : 'text'}
                icon={<SearchOutlined />}
                onClick={() => setShowSearch(!showSearch)}
              />
            </Tooltip>
            
            <Tooltip title={language === 'ja' ? '会話情報' : 'Thông tin cuộc trò chuyện'}>
              <AntButton
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => setDrawerVisible(true)}
              />
            </Tooltip>
          </Space>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <AntInput
              placeholder={language === 'ja' ? 'メッセージを検索...' : 'Tìm kiếm tin nhắn...'}
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">
                {language === 'ja' ? '読み込み中...' : 'Đang tải...'}
              </p>
            </div>
          </div>
        ) : threadDetail && threadDetail.messages.length > 0 ? (
          <div className="space-y-3">
            {threadDetail.messages.map((message, index) => {
              const isOwnMessage = message.senderId._id === currentTeacher.id;
              const showAvatar = index === 0 || 
                threadDetail.messages[index - 1].senderId._id !== message.senderId._id;
              const messageDate = new Date(message.createdAt);

              return (
                <div
                  key={message._id}
                  className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar for other user (left side) */}
                  {!isOwnMessage && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={message.senderId.avatarUrl} 
                            alt={message.senderId.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gray-500 text-white text-xs">
                            {message.senderId.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[65%]`}>
                    <div
                      className={`px-4 py-2.5 shadow-sm ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-[20px] rounded-tr-md'
                          : 'bg-gray-200 text-gray-900 rounded-[20px] rounded-tl-md'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-2">
                      <Text className="text-xs text-gray-400">
                        {messageDate.toLocaleTimeString(language === 'ja' ? 'ja-JP' : 'vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                      {isOwnMessage && message.isReadByMe && (
                        <CheckOutlined className="text-xs text-blue-500" />
                      )}
                    </div>
                  </div>

                  {/* Avatar for own message (right side) */}
                  {isOwnMessage && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={currentTeacher.avatar} 
                            alt={currentTeacher.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {currentTeacher.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <SendOutlined className="text-5xl mx-auto mb-4 opacity-50" />
              <p>{language === 'ja' ? 'メッセージがありません' : 'Chưa có tin nhắn nào'}</p>
              <p className="text-sm mt-2">
                {language === 'ja' 
                  ? '最初のメッセージを送信してください' 
                  : 'Gửi tin nhắn đầu tiên'}
              </p>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-white flex-shrink-0">
        <Space.Compact style={{ width: '100%' }}>
          <Tooltip title={language === 'ja' ? 'ファイルをアップロード' : 'Tải lên tệp'}>
            <AntButton 
              icon={<UploadOutlined />} 
              onClick={() => setUploadModalVisible(true)}
            />
          </Tooltip>
          
          <Tooltip title={language === 'ja' ? '予定を設定' : 'Đặt lịch hẹn'}>
            <AntButton 
              icon={<CalendarOutlined />}
              onClick={() => setAppointmentModalVisible(true)}
            />
          </Tooltip>

          <AntInput
            placeholder={language === 'ja' ? 'メッセージを入力...' : 'Nhập tin nhắn...'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            style={{ flex: 1 }}
            disabled={isSending}
          />
          
          <AntButton 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            loading={isSending}
            disabled={!newMessage.trim() || isSending}
          >
            {language === 'ja' ? '送信' : 'Gửi'}
          </AntButton>
        </Space.Compact>
      </div>

      {/* Upload File Modal */}
      <Modal
        title={language === 'ja' ? 'ファイルをアップロード' : 'Tải lên tệp tin'}
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={handleUploadFile}
        okText={language === 'ja' ? 'アップロード' : 'Tải lên'}
        cancelText={language === 'ja' ? 'キャンセル' : 'Hủy'}
      >
        <div className="py-4">
          <Text className="block mb-2">
            {language === 'ja' ? `${selectedTeacher.name}とファイルを共有` : `Chia sẻ tệp với ${selectedTeacher.name}`}
          </Text>
          <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" className="w-full" />
        </div>
      </Modal>

      {/* Create Appointment Modal */}
      <Modal
        title={language === 'ja' ? '予定を設定' : 'Đặt lịch hẹn'}
        open={appointmentModalVisible}
        onCancel={() => {
          setAppointmentModalVisible(false);
          setAppointmentDate(null);
          setAppointmentTime('12:00');
          setAppointmentTitle('');
          setAppointmentDescription('');
        }}
        onOk={handleCreateAppointment}
        okText={language === 'ja' ? '設定' : 'Đặt lịch'}
        cancelText={language === 'ja' ? 'キャンセル' : 'Hủy'}
        width={500}
      >
        <div className="py-4 space-y-4">
          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? 'タイトル' : 'Tiêu đề'}
            </Text>
            <AntInput
              placeholder={language === 'ja' ? 'ミーティングのタイトル' : 'Tiêu đề cuộc hẹn'}
              value={appointmentTitle}
              onChange={(e) => setAppointmentTitle(e.target.value)}
            />
          </div>
          
          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? '日付' : 'Ngày'}
            </Text>
            <DatePicker
              value={appointmentDate}
              onChange={setAppointmentDate}
              format="DD/MM/YYYY"
              placeholder={language === 'ja' ? '日付を選択' : 'Chọn ngày'}
              style={{ width: '100%' }}
            />
          </div>
          
          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? '時刻' : 'Giờ'}
            </Text>
            <AntInput
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />
          </div>
          
          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? '説明' : 'Mô tả'}
            </Text>
            <TextArea
              placeholder={language === 'ja' ? '詳細を入力...' : 'Nhập mô tả...'}
              value={appointmentDescription}
              onChange={(e) => setAppointmentDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Info Drawer */}
      <Drawer
        title={language === 'ja' ? '会話情報' : 'Thông tin cuộc trò chuyện'}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {/* Avatar & Nickname */}
        <div className="text-center mb-6">
          <AntAvatar size={80} src={selectedTeacher.avatar} className="mb-3">
            {selectedTeacher.name.charAt(0)}
          </AntAvatar>
          
          {editingNickname ? (
            <Space.Compact style={{ width: '100%' }} className="mt-2">
              <AntInput
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder={language === 'ja' ? 'ニックネーム' : 'Biệt danh'}
              />
              <AntButton type="primary" onClick={handleSaveNickname}>
                {language === 'ja' ? '保存' : 'Lưu'}
              </AntButton>
            </Space.Compact>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Title level={4} style={{ margin: 0 }}>{nickname}</Title>
              <Tooltip title={language === 'ja' ? '編集' : 'Chỉnh sửa'}>
                <AntButton
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingNickname(true);
                    setTempNickname(nickname);
                  }}
                />
              </Tooltip>
            </div>
          )}
        </div>

        <Collapse 
          defaultActiveKey={['1', '2', '3']} 
          ghost
          expandIconPosition="end"
        >
          {/* Reminders */}
          <Panel 
            header={
              <Space>
                <BellOutlined />
                <Text strong>{language === 'ja' ? 'リマインダー' : 'Nhắc hẹn'}</Text>
              </Space>
            } 
            key="1"
          >
            {reminders.length === 0 ? (
              <Empty description={language === 'ja' ? 'リマインダーなし' : 'Chưa có lời nhắc'} />
            ) : (
              <List
                size="small"
                dataSource={reminders}
                renderItem={(reminder: Reminder) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CalendarOutlined />}
                      title={reminder.content}
                      description={`${dayjs(reminder.date).format('DD/MM/YYYY')} ${reminder.time}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Panel>

          {/* Common Groups */}
          <Panel 
            header={
              <Space>
                <TeamOutlined />
                <Text strong>{language === 'ja' ? '共通グループ' : 'Nhóm chung'}</Text>
              </Space>
            } 
            key="2"
          >
            {commonGroups.length === 0 ? (
              <Empty description={language === 'ja' ? '共通グループなし' : 'Không có nhóm chung'} />
            ) : (
              <List
                size="small"
                dataSource={commonGroups}
                renderItem={(group: typeof commonGroups[0]) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<TeamOutlined />}
                      title={group.name}
                      description={`${group.memberCount} ${language === 'ja' ? 'メンバー' : 'thành viên'}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Panel>

          {/* Shared Media */}
          <Panel 
            header={
              <Space>
                <PictureOutlined />
                <Text strong>{language === 'ja' ? '共有メディア' : 'Ảnh/Video/File'}</Text>
              </Space>
            } 
            key="3"
          >
            <Collapse ghost size="small">
              <Panel header={`${language === 'ja' ? '画像・動画' : 'Ảnh/Video'} (1)`} key="3-1">
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'image' || m.type === 'video')}
                  renderItem={(item: SharedMedia) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<PictureOutlined />}
                        title={item.name}
                        description={dayjs(item.date).format('DD/MM/YYYY')}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel header={`${language === 'ja' ? 'ファイル' : 'File'} (1)`} key="3-2">
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'file')}
                  renderItem={(item: SharedMedia) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<FileOutlined />}
                        title={item.name}
                        description={dayjs(item.date).format('DD/MM/YYYY')}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel header={`${language === 'ja' ? 'リンク' : 'Link'} (1)`} key="3-3">
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'link')}
                  renderItem={(item: SharedMedia) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<LinkOutlined />}
                        title={item.name}
                        description={dayjs(item.date).format('DD/MM/YYYY')}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            </Collapse>
          </Panel>

          {/* Settings */}
          <Panel 
            header={
              <Space>
                <SettingOutlined />
                <Text strong>{language === 'ja' ? '設定' : 'Thiết lập'}</Text>
              </Space>
            } 
            key="4"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <AntButton 
                danger 
                icon={<WarningOutlined />}
                block
                onClick={handleReportConversation}
              >
                {language === 'ja' ? '会話を報告' : 'Báo cáo cuộc trò chuyện'}
              </AntButton>
              
              <AntButton 
                danger 
                icon={<DeleteOutlined />}
                block
                onClick={handleDeleteHistory}
              >
                {language === 'ja' ? '履歴を削除' : 'Xóa lịch sử trò chuyện'}
              </AntButton>
            </Space>
          </Panel>
        </Collapse>
      </Drawer>
    </div>
  );
}
