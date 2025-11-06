import React, { useState } from 'react';
import { Teacher, Message } from '../types';
import {
  Input as AntInput,
  Button as AntButton,
  Avatar as AntAvatar,
  Drawer,
  List,
  Empty,
  Tooltip,
  Space,
  Tag,
  Typography,
  Divider,
  Dropdown,
  Collapse,
  Modal,
  DatePicker,
  Progress
} from 'antd';
import {
  SendOutlined,
  UploadOutlined,
  SmileOutlined,
  LeftOutlined,
  InfoCircleOutlined,
  UserAddOutlined,
  SettingOutlined,
  SearchOutlined,
  MoreOutlined,
  PictureOutlined,
  TeamOutlined,
  FileOutlined,
  LinkOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CopyOutlined,
  EditOutlined,
  BellOutlined,
  WarningOutlined,
  LogoutOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ScrollArea } from './ui/scroll-area';
import { translations, Language } from '../translations';
import { toast } from 'sonner';

const { TextArea } = AntInput;
const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;

interface Group {
  id: string;
  name: string;
  memberCount: number;
  avatar: string;
  description?: string;
  members?: Teacher[];
}

interface GroupEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
}

interface GroupPoll {
  id: string;
  question: string;
  options: Array<{ text: string; votes: number; voters: string[] }>;
  totalVotes: number;
  createdBy: string;
  createdAt: Date;
}

interface SharedMedia {
  id: string;
  type: 'image' | 'video' | 'file' | 'link';
  name: string;
  url: string;
  uploadedBy: string;
  date: Date;
}

interface GroupChatInterfaceProps {
  currentUser: Teacher;
  selectedGroup: Group;
  onBack: () => void;
  language: Language;
}

interface GroupMessage extends Message {
  senderName: string;
  senderAvatar: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '😂', '🎉', '👏'];

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export function GroupChatInterface({
  currentUser,
  selectedGroup,
  onBack,
  language
}: GroupChatInterfaceProps) {
  const t = translations[language];
  const [infoDrawerVisible, setInfoDrawerVisible] = useState(false);
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [tempGroupName, setTempGroupName] = useState(selectedGroup.name);
  const [editingDescription, setEditingDescription] = useState(false);
  const [groupDescription, setGroupDescription] = useState(
    selectedGroup.description || 'グループの説明がまだありません。'
  );
  const [tempDescription, setTempDescription] = useState(groupDescription);
  const [showQRModal, setShowQRModal] = useState(false);

  // Upload & Appointment Modals
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<any>(null);
  const [appointmentTime, setAppointmentTime] = useState('12:00');
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentDescription, setAppointmentDescription] = useState('');

  // Create Poll Modal
  const [createPollModalVisible, setCreatePollModalVisible] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);

  const [messages, setMessages] = useState<GroupMessage[]>([
    {
      id: '1',
      senderId: 'member1',
      receiverId: selectedGroup.id,
      content: '皆さん、こんにちは！新しい教育方法について話し合いましょう。',
      senderName: 'Yuki Tanaka',
      senderAvatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?w=400',
      timestamp: new Date('2025-10-21T10:00:00'),
      type: 'text'
    },
    {
      id: '2',
      senderId: 'member2',
      receiverId: selectedGroup.id,
      content: 'Chào mọi người! Tôi rất vui được tham gia nhóm này.',
      senderName: 'Linh Nguyen',
      senderAvatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?w=400',
      timestamp: new Date('2025-10-21T10:05:00'),
      type: 'text'
    },
    {
      id: '3',
      senderId: currentUser.id,
      receiverId: selectedGroup.id,
      content: 'よろしくお願いします！',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date('2025-10-21T10:10:00'),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showMemberDrawer, setShowMemberDrawer] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<string[]>([]);

  // Mock data for group info
  const [groupEvents] = useState<GroupEvent[]>([
    {
      id: '1',
      title: language === 'ja' ? 'オンラインミーティング' : 'Họp trực tuyến',
      date: new Date('2025-10-25T15:00:00'),
      time: '15:00',
      description: language === 'ja' ? '教育方法についての討論' : 'Thảo luận về phương pháp giảng dạy'
    },
    {
      id: '2',
      title: language === 'ja' ? '資料共有セッション' : 'Chia sẻ tài liệu',
      date: new Date('2025-10-28T10:00:00'),
      time: '10:00',
      description: language === 'ja' ? '新しい教材の紹介' : 'Giới thiệu tài liệu mới'
    }
  ]);

  const [groupPolls] = useState<GroupPoll[]>([
    {
      id: '1',
      question: language === 'ja' ? '次回のミーティング時間は?' : 'Thời gian họp tiếp theo?',
      options: [
        { text: language === 'ja' ? '月曜日 14:00' : 'Thứ 2 14:00', votes: 12, voters: ['user1', 'user2'] },
        { text: language === 'ja' ? '水曜日 15:00' : 'Thứ 4 15:00', votes: 8, voters: ['user3'] },
        { text: language === 'ja' ? '金曜日 16:00' : 'Thứ 6 16:00', votes: 15, voters: ['user4', 'user5'] }
      ],
      totalVotes: 35,
      createdBy: 'Yuki Tanaka',
      createdAt: new Date('2025-10-20T10:00:00')
    }
  ]);

  const [sharedMedia] = useState<SharedMedia[]>([
    {
      id: '1',
      type: 'image',
      name: 'teaching_methodology.jpg',
      url: '#',
      uploadedBy: 'Yuki Tanaka',
      date: new Date('2025-10-15')
    },
    {
      id: '2',
      type: 'file',
      name: 'lesson_plan_template.pdf',
      url: '#',
      uploadedBy: 'Linh Nguyen',
      date: new Date('2025-10-18')
    },
    {
      id: '3',
      type: 'file',
      name: 'curriculum_guide.docx',
      url: '#',
      uploadedBy: 'Hiroshi Yamamoto',
      date: new Date('2025-10-19')
    },
    {
      id: '4',
      type: 'link',
      name: 'Educational Resources Hub',
      url: 'https://example.com/resources',
      uploadedBy: 'Mai Pham',
      date: new Date('2025-10-20')
    }
  ]);

  // Mock members data
  const groupMembers: Teacher[] = [
    {
      id: 'member1',
      name: 'Yuki Tanaka',
      nationality: 'Japanese',
      avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?w=400',
      specialties: ['Mathematics'],
      experience: 8,
      interests: ['Technology'],
      bio: '',
      subjects: ['Math']
    },
    {
      id: 'member2',
      name: 'Linh Nguyen',
      nationality: 'Vietnamese',
      avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?w=400',
      specialties: ['English'],
      experience: 6,
      interests: ['Language'],
      bio: '',
      subjects: ['English']
    },
    {
      id: 'member3',
      name: 'Hiroshi Yamamoto',
      nationality: 'Japanese',
      avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?w=400',
      specialties: ['History'],
      experience: 12,
      interests: ['Culture'],
      bio: '',
      subjects: ['History']
    },
    {
      id: 'member4',
      name: 'Mai Pham',
      nationality: 'Vietnamese',
      avatar: 'https://images.unsplash.com/photo-1758781784881-d9fdcdf80d1a?w=400',
      specialties: ['Art'],
      experience: 5,
      interests: ['Creative'],
      bio: '',
      subjects: ['Art']
    }
  ];

  // Available teachers to add (not in group yet)
  const availableTeachers: Teacher[] = [
    {
      id: '5',
      name: 'Kenji Sato',
      nationality: 'Japanese',
      avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?w=400',
      specialties: ['Physics', 'Science'],
      experience: 10,
      interests: ['Experimental Learning'],
      bio: '',
      subjects: ['Physics', 'Chemistry']
    },
    {
      id: '6',
      name: 'Trang Le',
      nationality: 'Vietnamese',
      avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?w=400',
      specialties: ['Music', 'Performing Arts'],
      experience: 7,
      interests: ['Music Theory'],
      bio: '',
      subjects: ['Music', 'Arts']
    },
    {
      id: '7',
      name: 'Sakura Ishikawa',
      nationality: 'Japanese',
      avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?w=400',
      specialties: ['Biology', 'Environmental Science'],
      experience: 9,
      interests: ['Ecology'],
      bio: '',
      subjects: ['Biology', 'Environmental Science']
    },
    {
      id: '8',
      name: 'Hung Tran',
      nationality: 'Vietnamese',
      avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?w=400',
      specialties: ['Computer Science', 'Programming'],
      experience: 4,
      interests: ['Coding Education'],
      bio: '',
      subjects: ['Computer Science', 'Technology']
    }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: GroupMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId: selectedGroup.id,
        content: newMessage,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleUploadFile = () => {
    const fileMessage: GroupMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedGroup.id,
      content: language === 'ja' ? 'ファイルを共有しました' : 'Đã chia sẻ tệp tin',
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date(),
      type: 'slide',
      slideUrl: 'example-file.pdf'
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

    const appointmentMessage: GroupMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedGroup.id,
      content: `📅 ${language === 'ja' ? '予定' : 'Lịch hẹn'}: ${appointmentTitle}\n${appointmentDescription}\n📆 ${appointmentDate.format('DD/MM/YYYY')} ${appointmentTime}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date(),
      type: 'text'
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

  const handleCreatePoll = () => {
    if (!pollQuestion.trim()) {
      toast.error(language === 'ja' ? '質問を入力してください' : 'Vui lòng nhập câu hỏi');
      return;
    }

    const validOptions = pollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast.error(language === 'ja' ? '少なくとも2つの選択肢を入力してください' : 'Vui lòng nhập ít nhất 2 lựa chọn');
      return;
    }

    const pollMessage: GroupMessage = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      receiverId: selectedGroup.id,
      content: `📊 ${language === 'ja' ? 'アンケート' : 'Bình chọn'}: ${pollQuestion}\n${validOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages([...messages, pollMessage]);
    toast.success(language === 'ja' ? 'アンケートを作成しました' : 'Đã tạo bình chọn');

    setCreatePollModalVisible(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setPollAllowMultiple(false);
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    } else {
      toast.info(language === 'ja' ? '最大6つの選択肢まで追加できます' : 'Tối đa 6 lựa chọn');
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = () => {
    toast.info(language === 'ja' ? 'ファイルアップロード機能を準備中です' : 'Tính năng tải file đang được phát triển');
  };

  const handleSaveGroupName = () => {
    setEditingGroupName(false);
    toast.success(language === 'ja' ? 'グループ名を更新しました' : 'Đã cập nhật tên nhóm');
  };

  const handleSaveDescription = () => {
    setGroupDescription(tempDescription);
    setEditingDescription(false);
    toast.success(language === 'ja' ? '説明を更新しました' : 'Đã cập nhật mô tả');
  };

  const handleCopyGroupLink = () => {
    const groupLink = `https://teachmate.app/group/${selectedGroup.id}`;
    navigator.clipboard.writeText(groupLink);
    toast.success(language === 'ja' ? 'リンクをコピーしました' : 'Đã sao chép link nhóm');
  };

  const handleShowQRCode = () => {
    setShowQRModal(true);
  };

  const handleLeaveGroup = () => {
    Modal.confirm({
      title: language === 'ja' ? 'グループを退出' : 'Rời khỏi nhóm',
      content: language === 'ja' ? 'このグループから退出しますか？' : 'Bạn có chắc chắn muốn rời khỏi nhóm này?',
      okText: language === 'ja' ? '退出' : 'Rời nhóm',
      cancelText: language === 'ja' ? 'キャンセル' : 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        toast.success(language === 'ja' ? 'グループから退出しました' : 'Đã rời khỏi nhóm');
      }
    });
  };

  const handleReportGroup = () => {
    Modal.confirm({
      title: language === 'ja' ? 'グループを報告' : 'Báo cáo nhóm',
      content: language === 'ja' ? 'このグループを管理者に報告しますか？' : 'Bạn có chắc chắn muốn báo cáo nhóm này cho quản trị viên?',
      okText: language === 'ja' ? '報告' : 'Báo cáo',
      cancelText: language === 'ja' ? 'キャンセル' : 'Hủy',
      okButtonProps: { danger: true },
      onOk() {
        toast.success(language === 'ja' ? '報告を送信しました' : 'Đã gửi báo cáo');
      }
    });
  };

  const handleAddMembers = () => {
    if (selectedMembersToAdd.length === 0) {
      toast.error(language === 'ja' ? 'メンバーを選択してください' : 'Vui lòng chọn thành viên');
      return;
    }
    toast.success(
      language === 'ja'
        ? `${selectedMembersToAdd.length}人のメンバーを追加しました`
        : `Đã thêm ${selectedMembersToAdd.length} thành viên`
    );
    setAddMemberModalVisible(false);
    setSelectedMembersToAdd([]);
    setSearchMemberQuery('');
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembersToAdd(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredAvailableTeachers = availableTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    teacher.specialties.some(s => s.toLowerCase().includes(searchMemberQuery.toLowerCase()))
  );

  const groupMenuItems = [
    {
      key: 'add-member',
      label: language === 'ja' ? 'メンバーを追加' : 'Thêm thành viên',
      icon: <UserAddOutlined />
    },
    {
      key: 'settings',
      label: language === 'ja' ? 'グループ設定' : 'Cài đặt nhóm',
      icon: <SettingOutlined />
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3 flex-1">
          <AntButton
            type="text"
            icon={<LeftOutlined />}
            onClick={onBack}
            className="text-white hover:bg-blue-700"
          />
          <div className="flex items-center gap-3">
            <AntAvatar
              size={48}
              src={selectedGroup.avatar}
              icon={<TeamOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div>
              <h2 className="text-lg text-gray-900 font-semibold mb-0">{selectedGroup.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedGroup.memberCount} {language === 'ja' ? 'メンバー' : 'thành viên'}
              </p>
            </div>
          </div>
        </div>
        <Tooltip title={language === 'ja' ? 'グループ情報' : 'Thông tin nhóm'}>
          <AntButton
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => setInfoDrawerVisible(true)}
            className="text-white hover:bg-blue-700"
          />
        </Tooltip>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isCurrentUser && (
                  <AntAvatar
                    size={36}
                    src={message.senderAvatar}
                    style={{ backgroundColor: getAvatarColor(message.senderId) }}
                  >
                    {message.senderName.charAt(0).toUpperCase()}
                  </AntAvatar>
                )}

                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {!isCurrentUser && (
                    <Text strong className="text-xs text-gray-600 mb-1 px-1">
                      {message.senderName}
                    </Text>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${isCurrentUser
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <Text className="text-xs text-gray-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Tooltip title={language === 'ja' ? '写真' : 'Ảnh'}>
              <AntButton
                icon={<PictureOutlined />}
                onClick={handleFileUpload}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              />
            </Tooltip>
            <Tooltip title={language === 'ja' ? 'ファイル' : 'File'}>
              <AntButton
                icon={<UploadOutlined />}
                onClick={() => setUploadModalVisible(true)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              />
            </Tooltip>
            <Tooltip title={language === 'ja' ? '予定を設定' : 'Đặt lịch hẹn'}>
              <AntButton
                icon={<CalendarOutlined />}
                onClick={() => setAppointmentModalVisible(true)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              />
            </Tooltip>
            <Tooltip title={language === 'ja' ? 'アンケート作成' : 'Tạo bình chọn'}>
              <AntButton
                icon={<BarChartOutlined />}
                onClick={() => setCreatePollModalVisible(true)}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              />
            </Tooltip>
          </div>

          <TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={language === 'ja' ? 'メッセージを入力...' : 'Nhập tin nhắn...'}
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 border-blue-300 focus:border-blue-500"
          />

          <AntButton
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {language === 'ja' ? '送信' : 'Gửi'}
          </AntButton>
        </div>
      </div>

      {/* Upload File Modal */}
      <Modal
        title={
          <Space>
            <UploadOutlined />
            <Text strong>{language === 'ja' ? 'ファイルをアップロード' : 'Tải lên tệp tin'}</Text>
          </Space>
        }
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={handleUploadFile}
        okText={language === 'ja' ? 'アップロード' : 'Tải lên'}
        cancelText={language === 'ja' ? 'キャンセル' : 'Hủy'}
        centered
      >
        <div className="py-4">
          <Text className="block mb-3 text-gray-600">
            {language === 'ja'
              ? 'グループメンバーとファイルを共有'
              : 'Chia sẻ tệp với thành viên nhóm'}
          </Text>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.zip"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <Text type="secondary" className="text-xs block mt-2">
            {language === 'ja'
              ? '対応形式: PDF, Word, PowerPoint, 画像, ZIP (最大25MB)'
              : 'Định dạng: PDF, Word, PowerPoint, Ảnh, ZIP (Tối đa 25MB)'}
          </Text>
        </div>
      </Modal>

      {/* Create Appointment Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <Text strong>{language === 'ja' ? '予定を設定' : 'Đặt lịch hẹn nhóm'}</Text>
          </Space>
        }
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
        width={550}
        centered
      >
        <div className="py-4 space-y-4">
          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? 'タイトル' : 'Tiêu đề'} <Text type="danger">*</Text>
            </Text>
            <AntInput
              placeholder={language === 'ja' ? 'ミーティングのタイトル' : 'Tiêu đề cuộc họp'}
              value={appointmentTitle}
              onChange={(e) => setAppointmentTitle(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? '日付' : 'Ngày'} <Text type="danger">*</Text>
            </Text>
            <DatePicker
              value={appointmentDate}
              onChange={setAppointmentDate}
              format="DD/MM/YYYY"
              placeholder={language === 'ja' ? '日付を選択' : 'Chọn ngày'}
              style={{ width: '100%' }}
              size="large"
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
              size="large"
            />
          </div>

          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? '説明' : 'Mô tả'}
            </Text>
            <TextArea
              placeholder={language === 'ja' ? '詳細を入力...' : 'Nhập mô tả chi tiết...'}
              value={appointmentDescription}
              onChange={(e) => setAppointmentDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </Modal>

      {/* Create Poll Modal */}
      <Modal
        title={
          <Space>
            <BarChartOutlined />
            <Text strong>{language === 'ja' ? 'アンケートを作成' : 'Tạo bình chọn'}</Text>
          </Space>
        }
        open={createPollModalVisible}
        onCancel={() => {
          setCreatePollModalVisible(false);
          setPollQuestion('');
          setPollOptions(['', '']);
          setPollAllowMultiple(false);
        }}
        onOk={handleCreatePoll}
        okText={language === 'ja' ? '作成' : 'Tạo'}
        cancelText={language === 'ja' ? 'キャンセル' : 'Hủy'}
        width={600}
        centered
      >
        <div className="py-4 space-y-4">
          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? '質問' : 'Câu hỏi'} <Text type="danger">*</Text>
            </Text>
            <AntInput
              placeholder={language === 'ja' ? '質問を入力してください' : 'Nhập câu hỏi bình chọn'}
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              size="large"
            />
          </div>

          <div>
            <Text strong className="block mb-2">
              {language === 'ja' ? '選択肢' : 'Các lựa chọn'} <Text type="danger">*</Text>
            </Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              {pollOptions.map((option, index) => (
                <Space.Compact key={index} style={{ width: '100%' }}>
                  <AntInput
                    placeholder={`${language === 'ja' ? '選択肢' : 'Lựa chọn'} ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                  />
                  {pollOptions.length > 2 && (
                    <AntButton
                      danger
                      icon={<WarningOutlined />}
                      onClick={() => handleRemovePollOption(index)}
                    />
                  )}
                </Space.Compact>
              ))}
              <AntButton
                type="dashed"
                block
                onClick={handleAddPollOption}
                disabled={pollOptions.length >= 6}
              >
                + {language === 'ja' ? '選択肢を追加' : 'Thêm lựa chọn'}
              </AntButton>
            </Space>
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <Text type="secondary" className="text-xs">
              💡 {language === 'ja'
                ? 'ヒント: アンケートは作成後、メンバーが投票できます'
                : 'Mẹo: Sau khi tạo, thành viên có thể bình chọn'}
            </Text>
          </div>
        </div>
      </Modal>

      {/* Members Drawer */}
      <Drawer
        title={language === 'ja' ? 'グループメンバー' : 'Thành viên nhóm'}
        placement="right"
        onClose={() => setShowMemberDrawer(false)}
        open={showMemberDrawer}
        width={350}
      >
        <div className="mb-4">
          <AntInput
            prefix={<SearchOutlined />}
            placeholder={language === 'ja' ? 'メンバーを検索' : 'Tìm thành viên'}
            className="mb-3"
          />
          <Text type="secondary">
            {groupMembers.length} {language === 'ja' ? 'メンバー' : 'thành viên'}
          </Text>
        </div>

        <Divider className="my-3" />

        <List
          dataSource={groupMembers}
          renderItem={(member) => (
            <List.Item className="hover:bg-gray-50 rounded px-2 cursor-pointer">
              <List.Item.Meta
                avatar={
                  <AntAvatar
                    size={40}
                    src={member.avatar}
                    style={{ backgroundColor: getAvatarColor(member.id) }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </AntAvatar>
                }
                title={member.name}
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" className="text-xs">
                      {member.nationality === 'Japanese' ? t.japanese : t.vietnamese}
                    </Text>
                    <Text type="secondary" className="text-xs">
                      {member.specialties[0]}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>

      {/* Group Info Drawer */}
      <Drawer
        title={language === 'ja' ? 'グループ情報' : 'Thông tin nhóm'}
        placement="right"
        onClose={() => setInfoDrawerVisible(false)}
        open={infoDrawerVisible}
        width={420}
      >
        {/* Group Avatar & Name */}
        <div className="text-center mb-6">
          <AntAvatar
            size={80}
            icon={<TeamOutlined />}
            src={selectedGroup.avatar}
            style={{ backgroundColor: '#1890ff' }}
            className="mb-3"
          />

          {editingGroupName ? (
            <Space.Compact style={{ width: '100%' }} className="mt-2">
              <AntInput
                value={tempGroupName}
                onChange={(e) => setTempGroupName(e.target.value)}
                placeholder={language === 'ja' ? 'グループ名' : 'Tên nhóm'}
              />
              <AntButton type="primary" onClick={handleSaveGroupName}>
                {language === 'ja' ? '保存' : 'Lưu'}
              </AntButton>
            </Space.Compact>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Title level={4} style={{ margin: 0 }}>{selectedGroup.name}</Title>
              <Tooltip title={language === 'ja' ? '編集' : 'Chỉnh sửa'}>
                <AntButton
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingGroupName(true);
                    setTempGroupName(selectedGroup.name);
                  }}
                />
              </Tooltip>
            </div>
          )}

          <Text type="secondary" className="block mt-1">
            {selectedGroup.memberCount} {language === 'ja' ? 'メンバー' : 'thành viên'}
          </Text>
        </div>

        <Collapse
          defaultActiveKey={['1', '2', '3', '4', '5', '6']}
          ghost
          expandIconPosition="end"
        >
          {/* Group Description */}
          <Panel
            header={
              <Space>
                <InfoCircleOutlined />
                <Text strong>{language === 'ja' ? 'グループの説明' : 'Mô tả nhóm'}</Text>
              </Space>
            }
            key="1"
          >
            {editingDescription ? (
              <div>
                <TextArea
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  rows={3}
                  className="mb-2"
                />
                <Space>
                  <AntButton type="primary" size="small" onClick={handleSaveDescription}>
                    {language === 'ja' ? '保存' : 'Lưu'}
                  </AntButton>
                  <AntButton size="small" onClick={() => {
                    setEditingDescription(false);
                    setTempDescription(groupDescription);
                  }}>
                    {language === 'ja' ? 'キャンセル' : 'Hủy'}
                  </AntButton>
                </Space>
              </div>
            ) : (
              <div>
                <Paragraph className="text-gray-700">
                  {groupDescription}
                </Paragraph>
                <AntButton
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingDescription(true);
                    setTempDescription(groupDescription);
                  }}
                >
                  {language === 'ja' ? '編集' : 'Chỉnh sửa'}
                </AntButton>
              </div>
            )}
          </Panel>

          {/* Members */}
          <Panel
            header={
              <Space>
                <TeamOutlined />
                <Text strong>{language === 'ja' ? 'メンバー' : 'Thành viên'}</Text>
                <Tag color="blue">{groupMembers.length}</Tag>
              </Space>
            }
            key="2"
          >
            <AntButton
              type="primary"
              icon={<UserAddOutlined />}
              block
              className="mb-3"
              onClick={() => setAddMemberModalVisible(true)}
            >
              {language === 'ja' ? 'メンバーを追加' : 'Thêm thành viên'}
            </AntButton>

            <List
              size="small"
              dataSource={groupMembers.slice(0, 5)}
              renderItem={(member) => (
                <List.Item className="hover:bg-gray-50 rounded px-2 cursor-pointer">
                  <List.Item.Meta
                    avatar={
                      <AntAvatar
                        size={36}
                        src={member.avatar}
                        style={{ backgroundColor: getAvatarColor(member.id) }}
                      >
                        {member.name.charAt(0)}
                      </AntAvatar>
                    }
                    title={member.name}
                    description={member.specialties[0]}
                  />
                </List.Item>
              )}
            />
            <AntButton
              type="link"
              block
              onClick={() => {
                setShowMemberDrawer(true);
                setInfoDrawerVisible(false);
              }}
            >
              {language === 'ja' ? 'すべて表示' : 'Xem tất cả'}
            </AntButton>
          </Panel>

          {/* Group Events */}
          <Panel
            header={
              <Space>
                <CalendarOutlined />
                <Text strong>{language === 'ja' ? 'グループイベント' : 'Sự kiện nhóm'}</Text>
                <Tag color="green">{groupEvents.length}</Tag>
              </Space>
            }
            key="3"
          >
            <AntButton
              type="primary"
              icon={<CalendarOutlined />}
              block
              className="mb-3"
              onClick={() => {
                setAppointmentModalVisible(true);
                setInfoDrawerVisible(false);
              }}
            >
              {language === 'ja' ? '新しい予定を作成' : 'Tạo lịch hẹn mới'}
            </AntButton>

            {groupEvents.length === 0 ? (
              <Empty description={language === 'ja' ? 'イベントなし' : 'Chưa có sự kiện'} />
            ) : (
              <List
                size="small"
                dataSource={groupEvents}
                renderItem={(event) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CalendarOutlined className="text-green-600" />}
                      title={event.title}
                      description={
                        <>
                          <div>{dayjs(event.date).format('DD/MM/YYYY')} {event.time}</div>
                          <Text type="secondary" className="text-xs">{event.description}</Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Panel>

          {/* Group Polls */}
          <Panel
            header={
              <Space>
                <BarChartOutlined />
                <Text strong>{language === 'ja' ? 'アンケート' : 'Bình chọn'}</Text>
                <Tag color="purple">{groupPolls.length}</Tag>
              </Space>
            }
            key="4"
          >
            <AntButton
              type="primary"
              icon={<BarChartOutlined />}
              block
              className="mb-3"
              onClick={() => {
                setCreatePollModalVisible(true);
                setInfoDrawerVisible(false);
              }}
            >
              {language === 'ja' ? '新しいアンケートを作成' : 'Tạo bình chọn mới'}
            </AntButton>

            {groupPolls.length === 0 ? (
              <Empty description={language === 'ja' ? 'アンケートなし' : 'Chưa có bình chọn'} />
            ) : (
              groupPolls.map((poll) => (
                <div key={poll.id} className="mb-4 p-3 bg-gray-50 rounded">
                  <Text strong className="block mb-2">{poll.question}</Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {poll.options.map((option, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <Text className="text-sm">{option.text}</Text>
                          <Text className="text-sm text-gray-500">{option.votes} {language === 'ja' ? '票' : 'phiếu'}</Text>
                        </div>
                        <Progress
                          percent={Math.round((option.votes / poll.totalVotes) * 100)}
                          size="small"
                          strokeColor="#1890ff"
                        />
                      </div>
                    ))}
                  </Space>
                  <Text type="secondary" className="text-xs block mt-2">
                    {language === 'ja' ? '作成者' : 'Tạo bởi'}: {poll.createdBy} • {dayjs(poll.createdAt).format('DD/MM/YYYY')}
                  </Text>
                </div>
              ))
            )}
          </Panel>

          {/* Shared Media */}
          <Panel
            header={
              <Space>
                <PictureOutlined />
                <Text strong>{language === 'ja' ? '共有メディア' : 'Ảnh/Video/File'}</Text>
                <Tag color="orange">{sharedMedia.length}</Tag>
              </Space>
            }
            key="5"
          >
            <Collapse ghost size="small">
              <Panel
                header={`${language === 'ja' ? '画像・動画' : 'Ảnh/Video'} (${sharedMedia.filter(m => m.type === 'image' || m.type === 'video').length})`}
                key="5-1"
              >
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'image' || m.type === 'video')}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<PictureOutlined />}
                        title={item.name}
                        description={
                          <>
                            <div className="text-xs text-gray-500">{item.uploadedBy}</div>
                            <div className="text-xs text-gray-400">{dayjs(item.date).format('DD/MM/YYYY')}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>

              <Panel
                header={`${language === 'ja' ? 'ファイル' : 'File'} (${sharedMedia.filter(m => m.type === 'file').length})`}
                key="5-2"
              >
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'file')}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<FileOutlined />}
                        title={item.name}
                        description={
                          <>
                            <div className="text-xs text-gray-500">{item.uploadedBy}</div>
                            <div className="text-xs text-gray-400">{dayjs(item.date).format('DD/MM/YYYY')}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>

              <Panel
                header={`${language === 'ja' ? 'リンク' : 'Link'} (${sharedMedia.filter(m => m.type === 'link').length})`}
                key="5-3"
              >
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'link')}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<LinkOutlined />}
                        title={item.name}
                        description={
                          <>
                            <div className="text-xs text-gray-500">{item.uploadedBy}</div>
                            <div className="text-xs text-gray-400">{dayjs(item.date).format('DD/MM/YYYY')}</div>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            </Collapse>
          </Panel>

          {/* Group Settings */}
          <Panel
            header={
              <Space>
                <SettingOutlined />
                <Text strong>{language === 'ja' ? '設定' : 'Thiết lập'}</Text>
              </Space>
            }
            key="6"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <AntButton
                icon={<QrcodeOutlined />}
                block
                onClick={handleShowQRCode}
              >
                {language === 'ja' ? 'QRコードで参加' : 'Tham gia bằng QR'}
              </AntButton>

              <AntButton
                icon={<CopyOutlined />}
                block
                onClick={handleCopyGroupLink}
              >
                {language === 'ja' ? 'リンクで参加' : 'Tham gia bằng link'}
              </AntButton>

              <AntButton
                icon={<BellOutlined />}
                block
                onClick={() => toast.info(language === 'ja' ? '通知設定機能を準備中です' : 'Tính năng thông báo đang phát triển')}
              >
                {language === 'ja' ? '通知設定' : 'Cài đặt thông báo'}
              </AntButton>

              <Divider className="my-2" />

              <AntButton
                danger
                icon={<WarningOutlined />}
                block
                onClick={handleReportGroup}
              >
                {language === 'ja' ? 'グループを報告' : 'Báo cáo nhóm'}
              </AntButton>

              <AntButton
                danger
                icon={<LogoutOutlined />}
                block
                onClick={handleLeaveGroup}
              >
                {language === 'ja' ? 'グループを退出' : 'Rời khỏi nhóm'}
              </AntButton>
            </Space>
          </Panel>
        </Collapse>
      </Drawer>

      {/* Add Member Modal */}
      <Modal
        title={
          <Space>
            <UserAddOutlined />
            <Text strong>{language === 'ja' ? 'メンバーを追加' : 'Thêm thành viên'}</Text>
          </Space>
        }
        open={addMemberModalVisible}
        onCancel={() => {
          setAddMemberModalVisible(false);
          setSelectedMembersToAdd([]);
          setSearchMemberQuery('');
        }}
        onOk={handleAddMembers}
        okText={language === 'ja' ? '追加' : 'Thêm'}
        cancelText={language === 'ja' ? 'キャンセル' : 'Hủy'}
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
          {/* Search */}
          <AntInput
            size="large"
            placeholder={language === 'ja' ? '名前または専門で検索' : 'Tìm theo tên hoặc chuyên môn'}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchMemberQuery}
            onChange={(e) => setSearchMemberQuery(e.target.value)}
            allowClear
          />

          {/* Selected count */}
          {selectedMembersToAdd.length > 0 && (
            <Tag color="blue">
              {language === 'ja'
                ? `${selectedMembersToAdd.length}人選択中`
                : `Đã chọn ${selectedMembersToAdd.length} người`}
            </Tag>
          )}

          {/* Available Teachers List */}
          <div>
            <Text type="secondary" className="block mb-3">
              {language === 'ja' ? '追加可能なメンバー' : 'Thành viên có thể thêm'}
            </Text>

            {filteredAvailableTeachers.length === 0 ? (
              <Empty description={language === 'ja' ? '該当するメンバーがいません' : 'Không tìm thấy thành viên'} />
            ) : (
              <div className="space-y-2">
                {filteredAvailableTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    onClick={() => toggleMemberSelection(teacher.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedMembersToAdd.includes(teacher.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${selectedMembersToAdd.includes(teacher.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                      }`}>
                      {selectedMembersToAdd.includes(teacher.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>

                    <AntAvatar
                      size={48}
                      src={teacher.avatar}
                      style={{ backgroundColor: getAvatarColor(teacher.id) }}
                    >
                      {teacher.name.charAt(0).toUpperCase()}
                    </AntAvatar>

                    <div className="flex-1">
                      <Text strong className="block">{teacher.name}</Text>
                      <Text type="secondary" className="text-sm">
                        {teacher.specialties[0]} • {teacher.nationality === 'Japanese' ? t.japanese : t.vietnamese}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Space>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title={
          <Space>
            <QrcodeOutlined />
            <Text strong>{language === 'ja' ? 'QRコードで参加' : 'Tham gia nhóm bằng QR'}</Text>
          </Space>
        }
        open={showQRModal}
        onCancel={() => setShowQRModal(false)}
        footer={[
          <AntButton key="close" onClick={() => setShowQRModal(false)}>
            {language === 'ja' ? '閉じる' : 'Đóng'}
          </AntButton>,
          <AntButton
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopyGroupLink}
          >
            {language === 'ja' ? 'リンクをコピー' : 'Sao chép link'}
          </AntButton>
        ]}
        width={450}
        centered
      >
        <div className="text-center py-6">
          {/* QR Code Placeholder */}
          <div className="inline-block p-6 bg-white border-4 border-gray-200 rounded-lg mb-4">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
              <QrcodeOutlined className="text-white" style={{ fontSize: '180px' }} />
            </div>
          </div>

          {/* Group Info */}
          <div className="mb-4">
            <Title level={4} className="mb-2">{selectedGroup.name}</Title>
            <Text type="secondary">
              {selectedGroup.memberCount} {language === 'ja' ? 'メンバー' : 'thành viên'}
            </Text>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <Text strong className="block mb-2 text-blue-700">
              {language === 'ja' ? '参加方法:' : 'Cách tham gia:'}
            </Text>
            <ol className="text-sm text-gray-700 space-y-1 ml-4">
              <li>{language === 'ja' ? 'QRコードをスキャンしてください' : 'Quét mã QR bằng camera'}</li>
              <li>{language === 'ja' ? 'またはリンクをコピーして共有してください' : 'Hoặc sao chép link để chia sẻ'}</li>
              <li>{language === 'ja' ? 'リンクを開いてグループに参加してください' : 'Mở link và tham gia nhóm'}</li>
            </ol>
          </div>

          {/* Group Link */}
          <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
            <Text type="secondary" className="text-xs block mb-1">
              {language === 'ja' ? 'グループリンク:' : 'Link nhóm:'}
            </Text>
            <Text
              code
              copyable
              className="text-xs"
              style={{ wordBreak: 'break-all' }}
            >
              https://teachmate.app/group/{selectedGroup.id}
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  );
}
