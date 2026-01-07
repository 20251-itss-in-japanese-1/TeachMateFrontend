import React, { useEffect, useMemo, useState } from 'react';
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
  Popover,
  Spin
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
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { Copy, RotateCcw, ZoomIn, ZoomOut, Download, XCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { translations, Language } from '../translations';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { Check, Eye, MessageCircle } from 'lucide-react';
import { sendMessage, sendMessageWithFile, getThreadChat, deleteMessage } from '../apis/chat.api';
import { reportUser } from '../apis/user.api';
import { getThreads } from '../apis/thread.api';
import { TeacherProfile } from './TeacherProfile';
import { useThreadAttachments } from '../hooks/useThreadAttachments';
import { getThreadSchedules, joinSchedule, createSchedule } from '../apis/schedule.api';
import { Schedule } from '../types/schedule.type';

const { Panel } = Collapse;
const { TextArea } = AntInput;
const { Text, Title } = Typography;

// Helper function to render message text with links and inline images
const renderMessageWithLinks = (
  text: string, 
  onImageClick: (url: string) => void
) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const imageRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp))/i;
  const isMobile = window.innerWidth < 640;

  // If message is only an image URL, display it large
  if (imageRegex.test(text.trim()) && text.trim().match(urlRegex)?.length === 1 && text.trim() === text.trim().match(urlRegex)?.[0]) {
    return (
      <div className="my-2 flex justify-center">
        <div
          onClick={() => onImageClick(text)}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src={text}
            alt="chat-img"
            className={isMobile ? "max-w-[90vw] max-h-[40vh] rounded-lg border shadow" : "max-w-xs max-h-60 rounded-lg border shadow"}
            style={{ display: "inline-block" }}
          />
        </div>
      </div>
    );
  }

  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (imageRegex.test(part)) {
      return (
        <div key={i} className="my-2">
          <div
            onClick={() => onImageClick(part)}
            className="cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src={part}
              alt="chat-img"
              className={isMobile ? "max-w-[90vw] max-h-[40vh] rounded-lg border shadow" : "max-w-xs max-h-60 rounded-lg border shadow"}
              style={{ display: "inline-block" }}
            />
          </div>
        </div>
      );
    }
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline break-all hover:text-blue-300"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// Helper function to render attachments
const renderAttachment = (attachment: { kind: string; mime: string; url: string }, index: number, setImageModalVisible: (visible: boolean) => void, setSelectedImage: (url: string) => void) => {
  const isImage = attachment.mime.startsWith('image/');
  const isPDF = attachment.mime === 'application/pdf';
  const isDoc = attachment.mime.includes('word') || attachment.mime.includes('document');
  const isPPT = attachment.mime.includes('presentation') || attachment.mime.includes('powerpoint');
  const isExcel = attachment.mime.includes('sheet') || attachment.mime.includes('excel');
  
  if (isImage) {
    return (
      <div key={index} className="mt-2 inline-block relative group">
        <div 
          onClick={() => {
            setSelectedImage(attachment.url);
            setImageModalVisible(true);
          }}
          className="cursor-pointer relative"
        >
          <img 
            src={attachment.url} 
            alt="attachment" 
            className="max-w-xs rounded-lg shadow-md hover:shadow-lg transition-shadow"
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const response = await fetch(attachment.url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = attachment.url.split('/').pop() || 'image.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Download failed:', error);
                // Fallback: open in new tab
                window.open(attachment.url, '_blank');
              }
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="Download"
          >
            <DownloadOutlined className="text-gray-700 text-sm" />
          </button>
        </div>
      </div>
    );
  }
  
  // For files (PDF, DOCX, PPTX, etc.)
  let icon = <FileOutlined className="text-blue-600" />;
  let color = 'blue';
  let typeName = 'File';
  
  if (isPDF) {
    icon = <FileOutlined className="text-red-600" />;
    color = 'red';
    typeName = 'PDF';
  } else if (isDoc) {
    icon = <FileOutlined className="text-blue-600" />;
    color = 'blue';
    typeName = 'DOCX';
  } else if (isPPT) {
    icon = <FileOutlined className="text-orange-600" />;
    color = 'orange';
    typeName = 'PPTX';
  } else if (isExcel) {
    icon = <FileOutlined className="text-green-600" />;
    color = 'green';
    typeName = 'XLSX';
  }
  
  return (
    <div key={index} className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
      <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {attachment.url.split('/').pop() || typeName}
        </div>
        <div className="text-xs text-gray-500">{typeName}</div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <EyeOutlined className="text-lg" />
        </a>
        <a
          href={attachment.url}
          download
          className="text-green-600 hover:text-green-700 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <DownloadOutlined className="text-lg" />
        </a>
      </div>
    </div>
  );
};

interface ChatInterfaceProps {
  currentTeacher: Teacher;
  selectedTeacher: Teacher;
  threadDetail?: {
    thread: any;
    messages: any[];
  } | null;
  threadId?: string;
  isLoadingMessages?: boolean;
  onBack: () => void;
  onViewProfile: (teacher: Teacher) => void;
  isFriend: boolean;
  onSendFriendRequest: (teacher: Teacher) => void;
  language: Language;
  onThreadCreated?: (threadId: string) => void;
  onRefreshThread?: () => Promise<any>;
  onRefreshThreads?: () => Promise<any>;
}

interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

interface EnhancedMessage extends Message {
  reactions?: MessageReaction[];
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
  threadId,
  isLoadingMessages = false,
  onBack,
  onViewProfile,
  isFriend,
  onSendFriendRequest,
  language,
  onThreadCreated,
  onRefreshThread,
  onRefreshThreads
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
  const [optimisticMessages, setOptimisticMessages] = useState<{ id: string; content: string; createdAt: Date }[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loadingResend, setLoadingResend] = useState<string | null>(null);

  // Fetch thread attachments with 2s polling
  const { data: attachmentsData } = useThreadAttachments(
    threadDetail?.thread?.id,
    !!threadDetail?.thread?.id
  );

  // Auto-scroll to bottom when messages update or optimistic messages added
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadDetail?.messages?.length, optimisticMessages.length]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [nickname, setNickname] = useState(selectedTeacher.name);
  const [editingNickname, setEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState(selectedTeacher.name);

  // Update nickname when selectedTeacher changes
  React.useEffect(() => {
    setNickname(selectedTeacher.name);
    setTempNickname(selectedTeacher.name);
  }, [selectedTeacher.id, selectedTeacher.name]);
  
  // Upload & Appointment Modals
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState<any>(null);
  const [appointmentTime, setAppointmentTime] = useState('12:00');
  const [appointmentTitle, setAppointmentTitle] = useState('');
  const [appointmentDescription, setAppointmentDescription] = useState('');
  const [creatingSchedule, setCreatingSchedule] = useState(false);
  
  // Teacher profile modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileTeacher, setSelectedProfileTeacher] = useState<Teacher | null>(null);
  
  // File selection
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  
  // Mock data
  const [threadSchedules, setThreadSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  
  // Convert API attachments to SharedMedia format
  const sharedMedia: SharedMedia[] = React.useMemo(() => {
    if (!attachmentsData?.success) return [];
    
    const media: SharedMedia[] = [];
    
    // Add images
    attachmentsData.data.image.forEach((img, idx) => {
      media.push({
        id: `img-${idx}`,
        type: 'image',
        name: img.url.split('/').pop() || `image-${idx}.jpg`,
        url: img.url,
        date: new Date()
      });
    });
    
    // Add files
    attachmentsData.data.file.forEach((file, idx) => {
      media.push({
        id: `file-${idx}`,
        type: 'file',
        name: file.url.split('/').pop() || `file-${idx}`,
        url: file.url,
        date: new Date()
      });
    });
    
    // Add links
    attachmentsData.data.link.forEach((link, idx) => {
      media.push({
        id: `link-${idx}`,
        type: 'link',
        name: link.url.split('/').pop() || `link-${idx}`,
        url: link.url,
        date: new Date()
      });
    });
    
    return media;
  }, [attachmentsData]);
  
  const [commonGroups] = useState([
    { id: '1', name: 'Mathematics Education Exchange', memberCount: 124 },
    { id: '3', name: 'STEM Education Innovation', memberCount: 189 }
  ]);

  const resolvedThreadId = useMemo(() => {
    return threadDetail?.thread?._id || threadDetail?.thread?.id || threadId;
  }, [threadDetail, threadId]);

  useEffect(() => {
    if (!resolvedThreadId) return;

    let active = true;
    const fetchSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const res = await getThreadSchedules(resolvedThreadId, { upcoming: true });
        if (active && res.success && Array.isArray(res.data)) {
          setThreadSchedules(res.data as Schedule[]);
        }
      } catch (error: any) {
        if (!active) return;
        const message = error?.response?.data?.message || error.message || 'Failed to load schedules';
        toast.error(
          language === 'ja'
            ? `スケジュールの取得に失敗しました: ${message}`
            : `Không thể tải lịch hẹn: ${message}`
        );
        setThreadSchedules([]);
      } finally {
        if (active) setLoadingSchedules(false);
      }
    };

    fetchSchedules();
    return () => {
      active = false;
    };
  }, [resolvedThreadId, language]);

  const formatScheduleDate = (schedule: Schedule) => {
    if (schedule.startAt) return dayjs(schedule.startAt);
    if (schedule.date && schedule.time) {
      const [day, month, year] = schedule.date.split('/').map(Number);
      const [hour, minute] = schedule.time.split(':').map(Number);
      return dayjs(new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0));
    }
    return null;
  };

  const handleJoinSchedule = async (scheduleId: string) => {
    if (!scheduleId) return;
    setJoiningId(scheduleId);
    try {
      const res = await joinSchedule(scheduleId);
      if (res.success) {
        toast.success(
          language === 'ja' ? 'スケジュールに参加しました' : 'Đã tham gia lịch hẹn'
        );
        if (resolvedThreadId) {
          const refreshed = await getThreadSchedules(resolvedThreadId, { upcoming: true });
          if (refreshed.success && Array.isArray(refreshed.data)) {
            setThreadSchedules(refreshed.data);
          }
        }
      } else {
        toast.error(res.message || (language === 'ja' ? '参加に失敗しました' : 'Tham gia thất bại'));
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(
        language === 'ja' ? `参加に失敗しました: ${msg}` : `Tham gia thất bại: ${msg}`
      );
    } finally {
      setJoiningId(null);
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || isSending) return;
    
    // Resolve thread id from detail or prop (URL)
    const resolvedThreadId = threadDetail?.thread?._id || threadDetail?.thread?.id || threadId;

    // Require thread ID before sending
    if (!resolvedThreadId) {
      toast.error(
        language === 'ja'
          ? 'スレッドIDが必要です'
          : 'Cần có ID cuộc trò chuyện'
      );
      return;
    }
    
    setIsSending(true);
    try {
      let response;
      
      // If files are selected, use sendMessageWithFile API
      if (selectedFiles.length > 0) {
        const fileData = {
          content: newMessage.trim() || '',
          threadId: resolvedThreadId,
          files: selectedFiles
        };
        response = await sendMessageWithFile(fileData);
      } else {
        // Otherwise use regular sendMessage API
        const messageData = {
          content: newMessage,
          threadId: resolvedThreadId
        };
        response = await sendMessage(messageData);
      }
      
      if (response.success) {
        setNewMessage('');
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        toast.success(
          language === 'ja' 
            ? 'メッセージを送信しました' 
            : 'Đã gửi tin nhắn'
        );
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

  const handleDeleteMessage = async (messageId: string) => {
    setDeletingMessageId(messageId);
    try {
      const res = await deleteMessage(messageId);
      if (res?.success) {
        toast.success(language === 'ja' ? 'メッセージを削除しました' : 'Đã xóa tin nhắn');
      } else {
        toast.error(res?.message || (language === 'ja' ? '削除に失敗しました' : 'Xóa thất bại'));
      }
    } catch (error: any) {
      console.error('Failed to delete message', error);
      toast.error(language === 'ja' ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
    } finally {
      await onRefreshThread?.();
      await onRefreshThreads?.();
      setDeletingMessageId(null);
    }
  };

  const confirmDeleteMessage = (messageId: string) => {
    Modal.confirm({
      title: language === 'ja' ? 'メッセージを削除しますか？' : 'Xóa tin nhắn?',
      content: language === 'ja' ? 'このメッセージを削除します。' : 'Bạn có chắc muốn xóa tin nhắn này?',
      okText: language === 'ja' ? '削除' : 'Xóa',
      cancelText: language === 'ja' ? 'キャンセル' : 'Hủy',
      okButtonProps: { danger: true, loading: deletingMessageId === messageId },
      onOk: () => handleDeleteMessage(messageId)
    });
  };

  const handleReportConversation = () => {
    let reason = '';
    Modal.confirm({
      title: language === 'ja' ? '会話を報告' : 'Báo cáo cuộc trò chuyện',
      content: (
        <div className="mt-2">
          <Text className="block mb-2 text-gray-600">
            {language === 'ja' ? '理由を入力してください' : 'Vui lòng nhập lý do báo cáo'}
          </Text>
          <TextArea
            rows={4}
            placeholder={language === 'ja' ? 'スパム、不適切な内容など' : 'Spam, nội dung không phù hợp, v.v.'}
            onChange={(e: any) => {
              reason = e.target.value;
            }}
          />
        </div>
      ),
      okText: language === 'ja' ? '報告' : 'Báo cáo',
      cancelText: language === 'ja' ? 'キャンセル' : 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        if (!reason || !reason.trim()) {
          toast.error(language === 'ja' ? '理由を入力してください' : 'Vui lòng nhập lý do');
          return Promise.reject();
        }
        try {
          await reportUser({
            targetUserId: selectedTeacher.id,
            targetType: 'user',
            reason: reason.trim()
          });
          toast.success(language === 'ja' ? '報告を送信しました' : 'Đã gửi báo cáo');
        } catch (err) {
          console.error('Report conversation failed:', err);
          toast.error(language === 'ja' ? '報告の送信に失敗しました' : 'Gửi báo cáo thất bại');
          return Promise.reject(err);
        }
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

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAppointment = async () => {
    if (!appointmentDate || !appointmentTitle.trim()) {
      toast.error(language === 'ja' ? '日時とタイトルを入力してください' : 'Vui lòng nhập ngày giờ và tiêu đề');
      return;
    }
    const resolvedThreadId = threadDetail?.thread?._id || threadDetail?.thread?.id || threadId;
    if (!resolvedThreadId) {
      toast.error(language === 'ja' ? 'スレッドIDが必要です' : 'Cần có ID cuộc trò chuyện');
      return;
    }

    const timePart = appointmentTime || '00:00';
    const dateIso = appointmentDate.format('YYYY-MM-DD');
    const startAtIso = dayjs(`${dateIso}T${timePart}`).toISOString();
    const userId = (currentTeacher as any)?.id || (currentTeacher as any)?._id;

    const payload = {
      title: appointmentTitle.trim(),
      description: appointmentDescription.trim() || undefined,
      date: dateIso,
      time: appointmentTime,
      startAt: startAtIso,
      threadId: resolvedThreadId,
      userId,
    };

    setCreatingSchedule(true);
    try {
      const res = await createSchedule(payload as any);
      if (res?.success) {
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

        if (onRefreshThread) {
          try { await onRefreshThread(); } catch (e) { /* ignore */ }
        }
        if (onRefreshThreads) {
          try { await onRefreshThreads(); } catch (e) { /* ignore */ }
        }
      } else {
        toast.error(res?.message || (language === 'ja' ? '作成に失敗しました' : 'Tạo lịch thất bại'));
      }
    } catch (err: any) {
      console.error('createSchedule failed', err);
      toast.error(language === 'ja' ? `エラー: ${err?.message || err}` : `Lỗi: ${err?.message || err}`);
    } finally {
      setCreatingSchedule(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <Space size="middle">
            <Tooltip title={t.back}>
              <AntButton 
                type="text" 
                icon={<LeftOutlined />} 
                onClick={onBack}
                size="large"
                className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              />
            </Tooltip>
            
            <div 
              onClick={() => {
                setSelectedProfileTeacher(selectedTeacher);
                setProfileModalOpen(true);
              }}
              className="flex items-center gap-3 cursor-pointer hover:bg-white/80 rounded-2xl px-3 py-2 transition-all duration-300 hover:shadow-md"
            >
              <div className="relative">
                <AntAvatar size={48} src={selectedTeacher.avatar} className="ring-2 ring-blue-100 ring-offset-2">
                  {selectedTeacher.name.charAt(0)}
                </AntAvatar>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div>
                <Title level={5} style={{ margin: 0 }} className="text-gray-800 font-semibold">
                  {nickname}
                </Title>
                <Text type="secondary" className="text-xs">
                  {selectedTeacher.nationality === 'Japanese' ? t.japanese : t.vietnamese}
                </Text>
              </div>
            </div>

            {!isFriend && (
              <AntButton
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => onSendFriendRequest(selectedTeacher)}
                className="shadow-md hover:shadow-lg transition-all duration-200 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 border-0"
              >
                {language === 'ja' ? '友達になる' : 'Kết bạn'}
              </AntButton>
            )}
          </Space>

          <Space size="small">
            <Tooltip title={language === 'ja' ? 'メッセージを検索' : 'Tìm kiếm tin nhắn'}>
              <AntButton
                type={showSearch ? 'primary' : 'text'}
                icon={<SearchOutlined />}
                onClick={() => setShowSearch(!showSearch)}
                className="hover:bg-blue-50 rounded-xl transition-all duration-200"
                style={showSearch ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderColor: 'transparent' } : {}}
              />
            </Tooltip>
            
            <Tooltip title={language === 'ja' ? '会話情報' : 'Thông tin cuộc trò chuyện'}>
              <AntButton
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="hover:bg-blue-50 rounded-xl transition-all duration-200"
              />
            </Tooltip>
          </Space>
        </div>

        {/* Search Bar with animation */}
        {showSearch && (
          <div className="mt-3 animate-in slide-in-from-top duration-200">
            <AntInput
              placeholder={language === 'ja' ? 'メッセージを検索...' : 'Tìm kiếm tin nhắn...'}
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        )}
      </div>

      {/* Messages Area with custom scrollbar */}
      <div className="flex-1 overflow-hidden relative">
        <style>
          {`
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
            }
            
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: rgba(156, 163, 175, 0.3);
              border-radius: 20px;
              transition: background-color 0.2s;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: rgba(156, 163, 175, 0.5);
            }

            .message-bubble {
              animation: slideIn 0.3s ease-out;
            }

            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .message-bubble:hover {
              transform: translateY(-1px);
              transition: all 0.2s ease;
            }
          `}
        </style>
        
        <ScrollArea className="h-full custom-scrollbar">
          <div className="p-6 pb-4">
            {isLoadingMessages ? (
              <div className="flex justify-center items-center h-[calc(100vh-280px)]">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    {language === 'ja' ? '読み込み中...' : 'Đang tải...'}
                  </p>
                </div>
              </div>
            ) : threadDetail && threadDetail.messages.length > 0 ? (
              <div className="space-y-4">
                {threadDetail.messages.map((message, index) => {
                  const isOwnMessage = message.senderId._id === currentTeacher.id;
                  const messageDate = new Date(message.createdAt);
                  const isLastUserMessage = index === threadDetail.messages.length - 1 && isOwnMessage;
                  const senderAvatar = isOwnMessage ? currentTeacher.avatar : message.senderId.avatarUrl;
                  const senderName = isOwnMessage ? currentTeacher.name : message.senderId.name;
                  const readByOthers = (message.readBy || []).some((reader: { _id: string }) => reader._id !== message.senderId._id);
                  const timeLabel = dayjs(messageDate).format('HH:mm');

                  return (
                    <div
                      key={message._id}
                      className={`w-full flex mb-4 animate-fade-in ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      } group`}
                    >
                      <div className={`flex flex-col gap-1 max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        {/* Tin nhắn, nút xóa, avatar cùng dòng */}
                        <div className={`flex items-start gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          {!isOwnMessage && (
                            <div className="w-9 h-9 flex-shrink-0">
                              <Avatar className="w-9 h-9 ring-2 ring-white shadow-md">
                                <AvatarImage 
                                  src={senderAvatar || ''} 
                                  alt={senderName}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white text-sm font-semibold">
                                  {senderName?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}

                          {/* Nút xóa bên trái tin nhắn, cùng dòng với avatar */}
                          {isOwnMessage && (
                            <Tooltip title={language === 'ja' ? 'メッセージを削除' : 'Xóa tin nhắn'}>
                              <AntButton
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                loading={deletingMessageId === message._id}
                                onClick={() => confirmDeleteMessage(message._id)}
                                className="!p-0 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity self-center"
                              />
                            </Tooltip>
                          )}

                          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                            {/* Message content */}
                            <div
                              className="relative w-fit max-w-[70vw] px-4 py-3 shadow-sm bg-blue-500 text-white rounded-xl border border-blue-300"
                            >
                              <div className="text-[15px] leading-relaxed break-words text-left">
                                {message.content && renderMessageWithLinks(message.content, (url) => {
                                  setSelectedImage(url);
                                  setImageModalVisible(true);
                                  setZoomLevel(1);
                                })}
                              </div>
                              
                              {/* Render attachments */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className={message.content?.trim() ? 'mt-2' : ''}>
                                  {message.attachments.map((attachment: { kind: string; mime: string; url: string }, idx: number) => renderAttachment(attachment, idx, setImageModalVisible, setSelectedImage))}
                                </div>
                              )}
                            </div>
                            
                            {/* Thời gian và trạng thái xem/đã xem dưới tin nhắn, căn lề phải */}
                            {isOwnMessage && (
                              <div className="flex items-center justify-end gap-2 px-1 mt-1">
                                <Text className="text-xs text-gray-400 font-medium">{timeLabel}</Text>
                                {readByOthers ? (
                                  <Eye className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>

                          {isOwnMessage && (
                            <div className="w-9 h-9 flex-shrink-0">
                              <Avatar className="w-9 h-9 ring-2 ring-white shadow-md">
                                <AvatarImage 
                                  src={senderAvatar || ''} 
                                  alt={senderName}
                                  className="object-cover"
                                />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-500 text-white text-sm font-semibold">
                                  {senderName?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : optimisticMessages.length > 0 ? (
              <div className="space-y-4">
                {optimisticMessages.map((msg) => (
                  <div key={msg.id} className="flex items-end gap-2 message-bubble justify-end">
                    {/* Message Bubble (own, no avatar) */}
                    <div className="flex flex-col items-end max-w-[70%]">
                      <div className="flex items-center gap-1.5 px-3 justify-end mb-1">
                        <Text className="text-xs text-gray-400 font-medium">
                          {msg.createdAt.toLocaleTimeString(language === 'ja' ? 'ja-JP' : 'vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </div>

                      <div className="px-4 py-3 my-1 shadow-sm bg-blue-500 text-white rounded-2xl border border-blue-300">
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words text-left">
                          {msg.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 justify-end mt-1">
                        <Check className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-280px)]">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                  </div>
                  <p className="text-gray-500 font-medium text-lg mb-2">
                    {language === 'ja' ? 'メッセージがありません' : 'Chưa có tin nhắn nào'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {language === 'ja' 
                      ? '最初のメッセージを送信してください' 
                      : 'Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white flex-shrink-0">
        {/* File Preview Area */}
        {selectedFiles.length > 0 && (
          <div className="px-4 pt-3 pb-2 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-2 max-w-4xl mx-auto">
              {selectedFiles.map((file, index) => {
                const isImage = file.type.startsWith('image/');
                if (isImage) {
                  // Preview for images
                  const imageUrl = URL.createObjectURL(file);
                  return (
                    <div key={index} className="relative group">
                      <img 
                        src={imageUrl} 
                        alt={file.name}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
                      />
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold shadow-md opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  );
                } else {
                  // Text display for files
                  return (
                    <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200 shadow-sm">
                      <FileOutlined className="text-blue-600" />
                      <span className="text-sm text-gray-700 max-w-[150px] truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        className="ml-1 text-red-500 hover:text-red-700 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        <div className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) {
                setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
              }
            }}
          />
          <Space.Compact style={{ width: '100%' }} className="rounded-3xl overflow-hidden shadow-sm">
            <Tooltip title={language === 'ja' ? 'ファイルをアップロード' : 'Tải lên tệp'}>
              <AntButton 
                icon={<UploadOutlined />} 
                onClick={() => fileInputRef.current?.click()}
                className="h-12 px-4 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border-0"
              />
            </Tooltip>
            
            <Tooltip title={language === 'ja' ? '予定を設定' : 'Đặt lịch hẹn'}>
              <AntButton 
                icon={<CalendarOutlined />}
                onClick={() => setAppointmentModalVisible(true)}
                className="h-12 px-4 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 border-0"
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
              className="!h-12 border-0 focus:ring-0 text-[15px] px-4"
            />
            
            <AntButton 
              type="primary" 
              icon={<SendOutlined className="rotate-0 group-hover:rotate-45 transition-transform duration-300" />}
              onClick={handleSendMessage}
              loading={isSending}
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
              className="h-12 px-6 bg-[#0084ff] border-0 hover:bg-[#0073e6] disabled:bg-gray-300 transition-all duration-300 font-medium group"
            >
              {language === 'ja' ? '送信' : 'Gửi'}
            </AntButton>
          </Space.Compact>
        </div>
      </div>

      {/* Upload File Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <UploadOutlined className="text-white" />
            </div>
            <span className="font-semibold">{language === 'ja' ? 'ファイルをアップロード' : 'Tải lên tệp tin'}</span>
          </div>
        }
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onOk={handleUploadFile}
        okText={language === 'ja' ? 'アップロード' : 'Tải lên'}
        cancelText={language === 'ja' ? 'キャンセル' : 'Hủy'}
        okButtonProps={{
          className: "bg-gradient-to-r from-blue-600 to-blue-500 border-0 hover:from-blue-700 hover:to-blue-600"
        }}
        className="modern-modal"
      >
        <div className="py-6">
          <Text className="block mb-4 text-gray-600">
            {language === 'ja' ? `${selectedTeacher.name}とファイルを共有` : `Chia sẻ tệp với ${selectedTeacher.name}`}
          </Text>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors duration-200 text-center cursor-pointer bg-gray-50/50">
            <UploadOutlined className="text-4xl text-gray-400 mb-3" />
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" className="w-full" />
          </div>
        </div>
      </Modal>

      {/* Create Appointment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <CalendarOutlined className="text-white" />
            </div>
            <span className="font-semibold">{language === 'ja' ? '予定を設定' : 'Đặt lịch hẹn'}</span>
          </div>
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
        confirmLoading={creatingSchedule}
        okText={language === 'ja' ? '設定' : 'Đặt lịch'}
        cancelText={language === 'ja' ? 'キャンセル' : 'Hủy'}
        width={520}
        okButtonProps={{
          className: "bg-gradient-to-r from-purple-600 to-pink-500 border-0 hover:from-purple-700 hover:to-pink-600"
        }}
        className="modern-modal"
      >
        <div className="py-4 space-y-5">
          <div>
            <Text strong className="block mb-2 text-gray-700">
              {language === 'ja' ? 'タイトル' : 'Tiêu đề'}
            </Text>
            <AntInput
              placeholder={language === 'ja' ? 'ミーティングのタイトル' : 'Tiêu đề cuộc hẹn'}
              value={appointmentTitle}
              onChange={(e) => setAppointmentTitle(e.target.value)}
              className="rounded-lg border-gray-300 hover:border-purple-400 focus:border-purple-500"
            />
          </div>
          
          <div>
            <Text strong className="block mb-2 text-gray-700">
              {language === 'ja' ? '日付' : 'Ngày'}
            </Text>
            <DatePicker
              value={appointmentDate}
              onChange={setAppointmentDate}
              format="DD/MM/YYYY"
              placeholder={language === 'ja' ? '日付を選択' : 'Chọn ngày'}
              style={{ width: '100%' }}
              className="rounded-lg border-gray-300 hover:border-purple-400"
            />
          </div>
          
          <div>
            <Text strong className="block mb-2 text-gray-700">
              {language === 'ja' ? '時刻' : 'Giờ'}
            </Text>
            <AntInput
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
              className="rounded-lg border-gray-300 hover:border-purple-400 focus:border-purple-500"
            />
          </div>
          
          <div>
            <Text strong className="block mb-2 text-gray-700">
              {language === 'ja' ? '説明' : 'Mô tả'}
            </Text>
            <TextArea
              placeholder={language === 'ja' ? '詳細を入力...' : 'Nhập mô tả...'}
              value={appointmentDescription}
              onChange={(e) => setAppointmentDescription(e.target.value)}
              rows={4}
              className="rounded-lg border-gray-300 hover:border-purple-400 focus:border-purple-500"
            />
          </div>
        </div>
      </Modal>

      {/* Info Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <InfoCircleOutlined className="text-white text-lg" />
            </div>
            <span className="font-semibold text-lg">{language === 'ja' ? '会話情報' : 'Thông tin cuộc trò chuyện'}</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={420}
        className="modern-drawer"
      >
        {/* Avatar & Nickname */}
        <div className="text-center mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
          <div className="relative inline-block mb-4">
            <AntAvatar size={100} src={selectedTeacher.avatar} className="ring-4 ring-white shadow-xl">
              {selectedTeacher.name.charAt(0)}
            </AntAvatar>
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-md" />
          </div>
          
          {editingNickname ? (
            <Space.Compact style={{ width: '100%' }} className="mt-3">
              <AntInput
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                placeholder={language === 'ja' ? 'ニックネーム' : 'Biệt danh'}
                className="rounded-l-xl border-gray-300"
              />
              <AntButton 
                type="primary" 
                onClick={handleSaveNickname}
                className="rounded-r-xl bg-gradient-to-r from-blue-600 to-blue-500 border-0"
              >
                {language === 'ja' ? '保存' : 'Lưu'}
              </AntButton>
            </Space.Compact>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-3">
              <Title level={4} style={{ margin: 0 }} className="text-gray-800">{nickname}</Title>
              <Tooltip title={language === 'ja' ? '編集' : 'Chỉnh sửa'}>
                <AntButton
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingNickname(true);
                    setTempNickname(nickname);
                  }}
                  className="hover:bg-blue-100 rounded-lg"
                />
              </Tooltip>
            </div>
          )}
        </div>

        <Collapse 
          defaultActiveKey={['1', '2', '3']} 
          ghost
          expandIconPosition="end"
          className="modern-collapse"
        >
          {/* Reminders */}
          <Panel 
            header={
              <Space>
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <BellOutlined className="text-yellow-600" />
                </div>
                <Text strong className="text-gray-800">{language === 'ja' ? 'リマインダー' : 'Nhắc hẹn'}</Text>
              </Space>
            } 
            key="1"
          >
            {loadingSchedules ? (
              <div className="py-4 flex justify-center"><Spin /></div>
            ) : threadSchedules.length === 0 ? (
              <Empty description={language === 'ja' ? '予定がありません' : 'Chưa có lịch hẹn'} />
            ) : (
              <List
                size="small"
                dataSource={threadSchedules}
                renderItem={(schedule: Schedule) => {
                  const dt = formatScheduleDate(schedule);
                  const statusColor =
                    schedule.status === 'completed' ? 'green' : schedule.status === 'cancelled' ? 'red' : 'blue';
                  return (
                    <List.Item
                      className="hover:bg-gray-50 rounded-lg transition-colors px-2"
                      actions={[
                        <AntButton
                          key="join"
                          type="link"
                          size="small"
                          loading={joiningId === schedule._id}
                          onClick={() => handleJoinSchedule(schedule._id)}
                        >
                          {language === 'ja' ? '参加' : 'Tham gia'}
                        </AntButton>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <CalendarOutlined className="text-blue-600" />
                          </div>
                        }
                        title={
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-800">{schedule.title}</span>
                            {schedule.status && <Tag color={statusColor}>{schedule.status}</Tag>}
                          </div>
                        }
                        description={
                          <span className="text-gray-500 text-sm">
                            {dt ? dt.format('DD/MM/YYYY HH:mm') : schedule.time || ''}
                          </span>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Panel>

          {/* Common Groups */}
          <Panel 
            header={
              <Space>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <TeamOutlined className="text-green-600" />
                </div>
                <Text strong className="text-gray-800">{language === 'ja' ? '共通グループ' : 'Nhóm chung'}</Text>
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
                  <List.Item className="hover:bg-gray-50 rounded-lg transition-colors px-2">
                    <List.Item.Meta
                      avatar={
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <TeamOutlined className="text-purple-600" />
                        </div>
                      }
                      title={<span className="font-medium text-gray-800">{group.name}</span>}
                      description={
                        <span className="text-gray-500 text-sm">
                          {`${group.memberCount} ${language === 'ja' ? 'メンバー' : 'thành viên'}`}
                        </span>
                      }
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
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                  <PictureOutlined className="text-pink-600" />
                </div>
                <Text strong className="text-gray-800">{language === 'ja' ? '共有メディア' : 'Ảnh/Video/File'}</Text>
              </Space>
            } 
            key="3"
          >
            <Collapse ghost size="small" className="media-collapse">
              <Panel header={`${language === 'ja' ? '画像・動画' : 'Ảnh/Video'} (${sharedMedia.filter(m => m.type === 'image' || m.type === 'video').length})`} key="3-1">
                <div className="grid grid-cols-3 gap-2">
                  {sharedMedia.filter(m => m.type === 'image' || m.type === 'video').map((item: SharedMedia) => (
                    <div 
                      key={item.id}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedImage(item.url);
                        setImageModalVisible(true);
                      }}
                    >
                      <img 
                        src={item.url} 
                        alt={item.name}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  ))}
                </div>
              </Panel>
              
              <Panel header={`${language === 'ja' ? 'ファイル' : 'File'} (${sharedMedia.filter(m => m.type === 'file').length})`} key="3-2">
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'file')}
                  renderItem={(item: SharedMedia) => (
                    <List.Item 
                      className="hover:bg-gray-50 rounded-lg transition-colors px-2"
                      actions={[
                        <Tooltip title={language === 'ja' ? 'ダウンロード' : 'Tải xuống'} key="download">
                          <AntButton
                            type="text"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = item.url;
                              link.download = item.name;
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          />
                        </Tooltip>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <FileOutlined className="text-orange-600" />
                          </div>
                        }
                        title={<span className="text-sm font-medium">{item.name}</span>}
                        description={<span className="text-xs">{dayjs(item.date).format('DD/MM/YYYY')}</span>}
                      />
                    </List.Item>
                  )}
                />
              </Panel>
              
              <Panel header={`${language === 'ja' ? 'リンク' : 'Link'} (${sharedMedia.filter(m => m.type === 'link').length})`} key="3-3">
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'link')}
                  renderItem={(item: SharedMedia) => (
                    <List.Item 
                      className="hover:bg-gray-50 rounded-lg transition-colors px-2 cursor-pointer"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <LinkOutlined className="text-indigo-600" />
                          </div>
                        }
                        title={
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.name}
                          </a>
                        }
                        description={<span className="text-xs">{dayjs(item.date).format('DD/MM/YYYY')}</span>}
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
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <SettingOutlined className="text-gray-600" />
                </div>
                <Text strong className="text-gray-800">{language === 'ja' ? '設定' : 'Thiết lập'}</Text>
              </Space>
            } 
            key="4"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <AntButton 
                danger 
                icon={<WarningOutlined />}
                block
                onClick={handleReportConversation}
                className="h-11 rounded-xl hover:shadow-md transition-all duration-200 font-medium"
              >
                {language === 'ja' ? '会話を報告' : 'Báo cáo cuộc trò chuyện'}
              </AntButton>
              
              <AntButton 
                danger 
                icon={<DeleteOutlined />}
                block
                onClick={handleDeleteHistory}
                className="h-11 rounded-xl hover:shadow-md transition-all duration-200 font-medium"
              >
                {language === 'ja' ? '履歴を削除' : 'Xóa lịch sử trò chuyện'}
              </AntButton>
            </Space>
          </Panel>
        </Collapse>
      </Drawer>

      {/* Image Modal with Zoom Controls */}
      <Modal
        open={imageModalVisible}
        onCancel={() => {
          setImageModalVisible(false);
          setZoomLevel(1);
        }}
        footer={null}
        width="auto"
        centered
        className="image-preview-modal"
      >
        <div>
          <div className="flex gap-2 mb-4">
            <AntButton
              icon={<ZoomOut className="h-4 w-4" />}
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
              title={language === 'ja' ? '縮小' : 'Thu nhỏ'}
            />
            <AntButton
              icon={<ZoomIn className="h-4 w-4" />}
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
              title={language === 'ja' ? '拡大' : 'Phóng to'}
            />
            <AntButton
              icon={<Download className="h-4 w-4" />}
              onClick={() => {
                const link = document.createElement('a');
                link.href = selectedImage;
                link.download = selectedImage.split('/').pop() || 'image';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              title={language === 'ja' ? 'ダウンロード' : 'Tải xuống'}
            />
            <AntButton
              icon={<XCircle className="h-4 w-4" />}
              onClick={() => {
                setImageModalVisible(false);
                setZoomLevel(1);
              }}
              title={language === 'ja' ? '閉じる' : 'Đóng'}
            />
          </div>
          <div className="flex justify-center items-center" style={{ minHeight: 300 }}>
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[70vh] rounded-lg shadow"
              style={{ objectFit: 'contain', transform: `scale(${zoomLevel})` }}
            />
          </div>
        </div>
      </Modal>

      {/* Teacher Profile Modal */}
      <TeacherProfile
        teacher={selectedProfileTeacher}
        open={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedProfileTeacher(null);
        }}
        onStartChat={async (teacher) => {
          setProfileModalOpen(false);
          setSelectedProfileTeacher(null);
          
          try {
            // Call getThreadChat API to get or create thread
            const response = await getThreadChat({ recipientId: teacher.id });
            
            if (response.success && response.data) {
              const threadId = response.data._id;
              if (onThreadCreated) {
                onThreadCreated(threadId);
              }
            } else {
              toast.error(
                language === 'ja'
                  ? 'スレッドの作成に失敗しました'
                  : 'Không thể tạo cuộc trò chuyện'
              );
            }
          } catch (error: any) {
            console.error('Failed to get or create thread:', error);
            toast.error(
              language === 'ja'
                ? `エラー: ${error.message}`
                : `Lỗi: ${error.message}`
            );
          }
        }}
        language={language}
      />
    </div>
  );
}
