import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DeleteOutlined,
  LogoutOutlined,
  QrcodeOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { translations, Language } from '../translations';
import { toast } from 'sonner';
import { Check, Eye } from 'lucide-react';
import { sendMessage, sendMessageWithFile, createSchedule, createPoll, getThreadPolls, getThreadSchedules, votePoll, joinSchedule, leaveSchedule, getThreadChat, deleteMessage } from '../apis/chat.api';
import { reportUser } from '../apis/user.api';
import { TeacherProfile } from './TeacherProfile';
import { useThreadAttachments } from '../hooks/useThreadAttachments';

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
  participants?: string[]; // added to track joined users
}

interface GroupPoll {
  id: string;
  question: string;
  options: Array<{ id?: string; text: string; votes: number; voters: string[] }>;
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
  selectedGroup: any;
  threadDetail?: {
    thread: any;
    messages: any[];
  } | null;
  isLoadingMessages?: boolean;
  onBack: () => void;
  language: Language;
  onRefreshThread?: () => Promise<any>;
  onRefreshThreads?: () => Promise<any>;
}

interface GroupMessage extends Message {
  senderName: string;
  senderAvatar: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '😂', '🎉', '👏'];

// Generate avatar colors
const getAvatarColor = (id?: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  if (!id) return colors[0];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

// Helper function to render attachments
const renderAttachment = (attachment: { kind?: string; mime?: string; url?: string }, index: number, setImageModalVisible: (visible: boolean) => void, setSelectedImage: (url: string) => void) => {
  const mime = attachment?.mime || '';
  const isImage = mime.startsWith('image/');
  const isPDF = mime === 'application/pdf';
  const isDoc = mime.includes('word') || mime.includes('document');
  const isPPT = mime.includes('presentation') || mime.includes('powerpoint');
  const isExcel = mime.includes('sheet') || mime.includes('excel');
  
  if (isImage) {
    return (
      <div key={index} className="mt-2 inline-block relative group">
        <div 
          onClick={() => {
            if (attachment?.url) setSelectedImage(attachment.url);
            setImageModalVisible(true);
          }}
          className="cursor-pointer relative"
        >
          <img 
            src={attachment?.url || ''} 
            alt="attachment" 
            className="max-w-xs rounded-lg shadow-md hover:shadow-lg transition-shadow"
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
          <button
            onClick={async (e) => {
              e.stopPropagation();
              try {
                if (!attachment?.url) throw new Error('No attachment URL');
                const response = await fetch(attachment.url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const filename = (attachment.url && attachment.url.split ? attachment.url.split('/').pop() : '') || 'image.jpg';
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Download failed:', error);
                // Fallback: open in new tab
                if (attachment?.url) window.open(attachment.url, '_blank');
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
  
  const filename = attachment?.url && attachment.url.split ? attachment.url.split('/').pop() : '';
  return (
    <div key={index} className="flex items-center gap-2 mt-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
      <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {filename || typeName}
        </div>
        <div className="text-xs text-gray-500">{typeName}</div>
      </div>
      <div className="flex items-center gap-2">
        {attachment?.url ? (
          <>
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
          </>
        ) : (
          <span className="text-xs text-gray-400">No file</span>
        )}
      </div>
    </div>
  );
};

// Helper to render message text with clickable links and inline images
const renderMessageWithLinks = (
  text: string,
  onImageClick: (url: string) => void
) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const imageRegex = /(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp))/i;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // If the message is only an image URL, display the image prominently
  if (
    imageRegex.test(text.trim()) &&
    text.trim().match(urlRegex)?.length === 1 &&
    text.trim() === text.trim().match(urlRegex)?.[0]
  ) {
    return (
      <div className="my-2 flex justify-center">
        <div
          onClick={() => onImageClick(text)}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src={text}
            alt="chat-img"
            className={isMobile ? 'max-w-[90vw] max-h-[40vh] rounded-lg border shadow' : 'max-w-xs max-h-60 rounded-lg border shadow'}
            style={{ display: 'inline-block' }}
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
              className={isMobile ? 'max-w-[90vw] max-h-[40vh] rounded-lg border shadow' : 'max-w-xs max-h-60 rounded-lg border shadow'}
              style={{ display: 'inline-block' }}
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

export function GroupChatInterface({
  currentUser,
  selectedGroup,
  threadDetail,
  isLoadingMessages = false,
  onBack,
  language,
  onRefreshThread,
  onRefreshThreads
}: GroupChatInterfaceProps) {
  const t = translations[language];
  const navigate = useNavigate();
  const [creatingPoll, setCreatingPoll] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  // Real members / events / polls loaded from thread or backend
  const [groupMembers, setGroupMembers] = useState<Teacher[]>([]); // will populate from threadDetail
  const [groupEvents, setGroupEvents] = useState<GroupEvent[]>([]); // schedules from backend
  const [groupPolls, setGroupPolls] = useState<GroupPoll[]>([]); // polls from backend
  
  // Fetch thread attachments with 2s polling
  const { data: attachmentsData } = useThreadAttachments(
    threadDetail?.thread?.id,
    !!threadDetail?.thread?.id
  );
  
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
        uploadedBy: 'Unknown',
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
        uploadedBy: 'Unknown',
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
        uploadedBy: 'Unknown',
        date: new Date()
      });
    });
    
    return media;
  }, [attachmentsData]);
  // Shared media (images/files/links) referenced in the UI
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
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
  const [isSending, setIsSending] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Teacher profile modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileTeacher, setSelectedProfileTeacher] = useState<Teacher | null>(null);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || isSending) return;
    
    setIsSending(true);
    try {
      let response;
      
      // If files are selected, use sendMessageWithFile API
      if (selectedFiles.length > 0) {
        const fileData = {
          content: newMessage.trim() || (language === 'ja' ? 'ファイルを共有しました' : 'Đã chia sẻ tệp tin'),
          threadId: threadDetail?.thread?._id || selectedGroup.id,
          files: selectedFiles
        };
        response = await sendMessageWithFile(fileData);
      } else {
        // Otherwise use regular sendMessage API
        const messageData = {
          content: newMessage,
          threadId: threadDetail?.thread?._id || selectedGroup.id
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
        );        // The useChat hook will automatically refetch
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

  const [showMemberDrawer, setShowMemberDrawer] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<string[]>([]);

  // Optional: keep small fallback mock if APIs return nothing (kept minimal)
  const fallbackEvents: GroupEvent[] = [
    { id: '1', title: language === 'ja' ? 'オンラインミーティング' : 'Họp trực tuyến', date: new Date('2025-10-25T15:00:00'), time: '15:00', description: language === 'ja' ? '教育方法についての討論' : 'Thảo luận về phương pháp giảng dạy' }
  ];
  const fallbackPolls: GroupPoll[] = [
    { id: '1', question: language === 'ja' ? '次回のミーティング時間は?' : 'Thời gian họp tiếp theo?', options: [{ text: language === 'ja' ? '月曜日 14:00' : 'Thứ 2 14:00', votes: 12, voters: ['user1', 'user2'] }], totalVotes: 12, createdBy: 'Yuki Tanaka', createdAt: new Date() }
  ];

  // Populate members/events/polls when threadDetail changes
  React.useEffect(() => {
    const threadId = threadDetail?.thread?._id || selectedGroup.id;
    // members
    if (threadDetail?.thread?.members) {
      const mapped = (threadDetail.thread.members || []).map((m: any) => ({
        id: m.userId?._id || m._id || m.id,
        name: m.userId?.name || m.name || 'Unknown',
        nationality: m.userId?.nationality || 'Japanese',
        avatar: m.userId?.avatarUrl || m.avatar || '',
        specialties: m.userId?.specialties || [''],
        experience: m.userId?.experience || 0,
        interests: m.userId?.interests || [],
        bio: m.userId?.bio || '',
        subjects: m.userId?.subjects || []
      }));
      setGroupMembers(mapped);
    }

    // fetch schedules for this thread
    (async () => {
      try {
        const res = await getThreadSchedules(threadId);
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          // Map backend schedule shape to GroupEvent if necessary
          const mappedEvents = res.data.map((s: any) => ({
            id: s._id || s.id,
            title: s.title,
            date: s.startAt ? new Date(s.startAt) : (s.date ? new Date(s.date) : new Date()),
            time: s.time || (s.startAt ? new Date(s.startAt).toISOString().substr(11,5) : '00:00'),
            description: s.description || '',
            participants: s.participants || s.attendees || []
          }));
          setGroupEvents(mappedEvents);
        } else {
          setGroupEvents(fallbackEvents);
        }
      } catch (err) {
        console.error('getThreadSchedules failed', err);
        setGroupEvents(fallbackEvents);
      }
    })();

    // fetch polls for this thread (use helper below)
    fetchPolls(threadId).catch(e => console.error('fetchPolls failed', e));
  }, [threadDetail, selectedGroup.id, language]);

  // helper: fetch polls and set state
  const fetchPolls = async (threadId: string) => {
    try {
      const res = await getThreadPolls(threadId);
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const mappedPolls = res.data.map((p: any) => ({
          id: p._id || p.id,
          question: p.question,
          // preserve option ids for voting
          options: (p.options || []).map((o: any, idx: number) => ({
            id: o._id || o.id || String(idx),
            text: o.text,
            votes: o.votes || 0,
            voters: o.voters || []
          })),
           totalVotes: p.totalVotes || (p.options || []).reduce((acc: number, o: any) => acc + (o.votes || 0), 0),
           createdBy: p.createdBy?.name || p.createdBy || '',
           createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
         }));
         setGroupPolls(mappedPolls);
       } else {
         setGroupPolls(fallbackPolls);
       }
     } catch (err) {
       console.error('getThreadPolls failed', err);
       setGroupPolls(fallbackPolls);
     }
  };

  // Vote handler: call votePoll then refresh polls + thread messages
  const handleVote = async (pollId: string, optionIndex: number) => {
    if (voting) return;
    setVoting(true);
    setVotingPollId(pollId);
    const threadId = threadDetail?.thread?._id || selectedGroup.id;
    try {
      // find option id from mapped polls
      const poll = groupPolls.find(p => p.id === pollId);
      const option = poll?.options?.[optionIndex];
      const optionId = option?.id;
      const userId = (currentUser as any)?.id || (currentUser as any)?._id;
      if (!optionId) {
        throw new Error('Option id not found');
      }
      const res = await votePoll(pollId, optionId, userId);
       if (res?.success) {
         toast.success(language === 'ja' ? '投票しました' : 'Đã bỏ phiếu');
         // refresh polls and thread messages
         await fetchPolls(threadId);
         if (onRefreshThread) {
           try { await onRefreshThread(); } catch (e) { /* ignore */ }
         }
       } else {
         toast.error(res?.message || (language === 'ja' ? '投票に失敗しました' : 'Bỏ phiếu thất bại'));
       }
     } catch (err) {
       console.error('votePoll failed', err);
       toast.error(language === 'ja' ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
     } finally {
       setVoting(false);
       setVotingPollId(null);
     }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateAppointment = async () => {
    if (!appointmentDate || !appointmentTitle.trim()) {
      toast.error(language === 'ja' ? '日時とタイトルを入力してください' : 'Vui lòng nhập ngày giờ và tiêu đề');
      return;
    }

    // Build ISO startAt (combine date + time). DatePicker value supports .format()
    const timePart = appointmentTime || '00:00';
    const combined = `${appointmentDate.format('YYYY-MM-DD')}T${timePart}`;
    const startAtIso = new Date(combined).toISOString();
    
    try {
      const threadId = threadDetail?.thread?._id || selectedGroup.id;
      const userId = (currentUser as any).id || (currentUser as any)._id;
      // Send date in ISO (YYYY-MM-DD) and include startAt ISO datetime to avoid "Invalid Date"
      const dateIso = appointmentDate.format('YYYY-MM-DD');
      const payload = {
        title: appointmentTitle,
        description: appointmentDescription || undefined,
        date: dateIso,        // ISO date
        time: appointmentTime,
        startAt: startAtIso,  // ISO datetime
        threadId,
        userId
      };

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

        // refresh thread/messages via parent query refetch
        if (onRefreshThread) {
          try { await onRefreshThread(); } catch (e) { /* ignore */ }
        }
      } else {
        toast.error(res?.message || (language === 'ja' ? '作成に失敗しました' : 'Tạo thất bại'));
      }
    } catch (err: any) {
      console.error('createSchedule failed', err);
      toast.error(language === 'ja' ? `エラー: ${err?.message || err}` : `Lỗi: ${err?.message || err}`);
    }
  };

  const handleCreatePoll = async () => {
    const question = pollQuestion.trim();
    const validOptions = pollOptions.map(o => o.trim()).filter(o => o);

    if (!question) {
      toast.error(language === 'ja' ? '質問を入力してください' : 'Vui lòng nhập câu hỏi');
      return;
    }
    if (question.length > 100) {
      toast.error(language === 'ja' ? '質問は100文字以内で入力してください' : 'Câu hỏi tối đa 100 ký tự');
      return;
    }
    if (validOptions.length < 2) {
      toast.error(language === 'ja' ? '少なくとも2つの選択肢を入力してください' : 'Vui lòng nhập ít nhất 2 lựa chọn');
      return;
    }

    const payload = {
      threadId: threadDetail?.thread?._id || selectedGroup.id,
      question,
      options: validOptions,
      allowMultiple: pollAllowMultiple
    };

    setCreatingPoll(true);
    try {
      const res = await createPoll(payload);
      if (res?.success) {
        toast.success(language === 'ja' ? 'アンケートを作成しました' : 'Đã tạo bình chọn');
        setCreatePollModalVisible(false);
        setPollQuestion('');
        setPollOptions(['', '']);
        setPollAllowMultiple(false);
        // refresh thread/messages so poll message appears
        if (onRefreshThread) {
          try { await onRefreshThread(); } catch (e) { /* ignore */ }
        }
      } else {
        toast.error(res?.message || (language === 'ja' ? '作成に失敗しました' : 'Tạo thất bại'));
      }
    } catch (err: any) {
      console.error('createPoll failed', err);
      toast.error(language === 'ja' ? `エラー: ${err?.message || err}` : `Lỗi: ${err?.message || err}`);
    } finally {
      setCreatingPoll(false);
    }
  };

  const handleAddPollOption = () => {
    // enforce max 5 options as spec (2 default + up to 3 more)
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    } else {
      toast.info(language === 'ja' ? '最大5つの選択肢まで追加できます' : 'Tối đa 5 lựa chọn');
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
    let reason = '';
    Modal.confirm({
      title: language === 'ja' ? 'グループを報告' : 'Báo cáo nhóm',
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
            targetUserId: selectedGroup.id,
            targetType: 'group',
            reason: reason.trim()
          });
          toast.success(language === 'ja' ? '報告を送信しました' : 'Đã gửi báo cáo');
        } catch (err) {
          console.error('Report group failed:', err);
          toast.error(language === 'ja' ? '報告の送信に失敗しました' : 'Gửi báo cáo thất bại');
          return Promise.reject(err);
        }
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

  // Join/Leave event handlers (update local state optimistically and call backend if available)
  const handleJoinEvent = async (eventId: string) => {
    const userId = (currentUser as any).id || (currentUser as any)._id;
    try {
      // Optimistic local update
      setGroupEvents(prev =>
        prev.map(ev =>
          ev.id === eventId
            ? { ...ev, participants: Array.isArray(ev.participants) ? [...ev.participants, userId] : [userId] }
            : ev
        )
      );

      // Attempt backend call but don't fail hard if API shape differs
      try {
        await joinSchedule(eventId);
      } catch (e) {
        console.warn('joinSchedule call failed or is not required:', e);
      }

      toast.success(language === 'ja' ? '参加しました' : 'Đã tham gia');

      if (onRefreshThread) {
        try { await onRefreshThread(); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('handleJoinEvent failed', err);
      toast.error(language === 'ja' ? '参加に失敗しました' : 'Tham gia thất bại');
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    const userId = (currentUser as any).id || (currentUser as any)._id;
    try {
      // Optimistic local update
      setGroupEvents(prev =>
        prev.map(ev =>
          ev.id === eventId
            ? { ...ev, participants: Array.isArray(ev.participants) ? ev.participants.filter((p: string) => p !== userId) : [] }
            : ev
        )
      );

      // Attempt backend call but don't fail hard if API shape differs
      try {
        await leaveSchedule(eventId);
      } catch (e) {
        console.warn('leaveSchedule call failed or is not required:', e);
      }

      toast.success(language === 'ja' ? '参加を辞退しました' : 'Đã rời');

      if (onRefreshThread) {
        try { await onRefreshThread(); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('handleLeaveEvent failed', err);
      toast.error(language === 'ja' ? '操作に失敗しました' : 'Thao tác thất bại');
    }
  };

  // Placeholder list of available teachers to add.
  // Replace this with your real data source or fetch logic as needed.
  const availableTeachers: Teacher[] = [];

  const filteredAvailableTeachers = availableTeachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
    (teacher.specialties || []).some(s => s.toLowerCase().includes(searchMemberQuery.toLowerCase()))
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
    <div className="h-full flex flex-col bg-white">
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
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
          `}
        </style>
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
              const isOwnMessage = message.senderId._id === currentUser.id;
              const showAvatar = index === 0 || 
                threadDetail.messages[index - 1].senderId._id !== message.senderId._id;
              const messageDate = new Date(message.createdAt);
              // Check if this is the last message sent by the current user
              const isLastUserMessage = index === threadDetail.messages.length - 1 && isOwnMessage;

              return (
                <div
                  key={message._id}
                  className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} mb-3 group max-w-[80%] ${isOwnMessage ? 'ml-auto' : 'mr-auto'}`}
                >
                  {/* Tin nhắn, nút xóa, avatar cùng dòng */}
                  <div className={`flex items-start gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    {/* Avatar for other users (left side) */}
                    {!isOwnMessage && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar ? (
                          <Avatar 
                            className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                            onClick={() => {
                              const member = groupMembers.find(m => m.id === message.senderId._id);
                              if (member) {
                                setSelectedProfileTeacher(member);
                                setProfileModalOpen(true);
                              } else {
                                setSelectedProfileTeacher({
                                  id: message.senderId._id,
                                  name: message.senderId.name,
                                  avatar: message.senderId.avatarUrl || '',
                                  nationality: 'Japanese',
                                  specialties: [],
                                  experience: 0,
                                  interests: [],
                                  bio: '',
                                  subjects: []
                                });
                                setProfileModalOpen(true);
                              }
                            }}
                          >
                            <AvatarImage 
                              src={message.senderId?.avatarUrl || ''} 
                              alt={message.senderId?.name || ''}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-purple-500 text-white text-xs">
                              {(message.senderId?.name || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
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

                    {/* Message Bubble */}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      {/* Sender name for group - only show for others */}
                      {!isOwnMessage && showAvatar && (
                        <Text className="text-xs text-gray-500 mb-1 px-3">
                          {message.senderId.name}
                        </Text>
                      )}

                      {(message.content?.trim() || (message.attachments && message.attachments.length > 0)) && (
                        <div
                          className={`relative w-fit max-w-[70vw] px-4 py-3 shadow-sm rounded-xl border ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white border-blue-300'
                              : 'bg-gray-100 text-gray-900 border-gray-200'
                          }`}
                        >
                          {message.content && message.content.trim() && (
                            <div className="text-[15px] leading-relaxed break-words text-left">
                              {renderMessageWithLinks(message.content, (url) => {
                                setSelectedImage(url);
                                setImageModalVisible(true);
                              })}
                            </div>
                          )}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className={message.content?.trim() ? 'mt-2' : ''}>
                              {message.attachments.map((attachment: any, idx: number) =>
                                renderAttachment(attachment, idx, setImageModalVisible, setSelectedImage)
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Avatar for own message (right side) */}
                    {isOwnMessage && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {showAvatar ? (
                          <Avatar className="w-8 h-8">
                            <AvatarImage 
                              src={currentUser.avatar || ''} 
                              alt={currentUser.name || ''}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-blue-600 text-white text-xs">
                              {(currentUser.name || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Thời gian dưới bên trái, status dưới bên phải */}
                  <div className={`flex items-center justify-between w-full px-1 mt-1 gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                    <Text className="text-xs text-gray-400">
                      {messageDate.toLocaleTimeString(language === 'ja' ? 'ja-JP' : 'vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    {isOwnMessage && isLastUserMessage && (
                      <div className="flex items-center">
                        {message.readBy && message.readBy.some((reader: any) => reader._id !== currentUser.id) ? (
                          <Eye className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <TeamOutlined className="text-5xl mx-auto mb-4 opacity-50" />
              <p>{language === 'ja' ? 'メッセージがありません' : 'Chưa có tin nhắn nào'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 flex-shrink-0">
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
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png,.gif,.jpeg,.zip"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) {
                setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
              }
            }}
          />
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Tooltip title={language === 'ja' ? 'ファイル' : 'File'}>
                <AntButton
                  icon={<UploadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
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
              disabled={isSending}
            />

            <AntButton
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isSending}
              loading={isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {language === 'ja' ? '送信' : 'Gửi'}
            </AntButton>
          </div>
        </div>
      </div>

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
        okButtonProps={{
          disabled: creatingPoll || !pollQuestion.trim() || (pollOptions.map(o => o.trim()).filter(o => o).length < 2) || pollQuestion.trim().length > 100,
          loading: creatingPoll
        }}
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
                disabled={pollOptions.length >= 5}
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
                        {member.name.charAt(0).toUpperCase()}
                      </AntAvatar>
                    }
                    title={member.name}
                    description={member.specialties && member.specialties.length ? member.specialties[0] : ''}
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
                renderItem={(event) => {
                  const attendeeCount = Array.isArray(event.participants) ? event.participants.length : 0;
                  const joined = Array.isArray(event.participants) && event.participants.includes(currentUser.id);
                  return (
                    <List.Item
                      actions={[
                        joined ? (
                          <AntButton key="leave" danger size="small" onClick={() => handleLeaveEvent(event.id)}>
                            {language === 'ja' ? '参加を辞退' : 'Rời'}
                          </AntButton>
                        ) : (
                          <AntButton key="join" type="primary" size="small" onClick={() => handleJoinEvent(event.id)}>
                            {language === 'ja' ? '参加' : 'Tham gia'}
                          </AntButton>
                        )
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CalendarOutlined className="text-green-600" />}
                        title={<div className="flex items-center justify-between gap-2"><span>{event.title}</span><Tag color={joined ? 'blue' : 'default'}>{attendeeCount} {language === 'ja' ? '参加者' : 'người'}</Tag></div>}
                        description={
                          <>
                            <div>{dayjs(event.date).format('DD/MM/YYYY')} {event.time}</div>
                            <Text type="secondary" className="text-xs">{event.description}</Text>
                          </>
                        }
                      />
                    </List.Item>
                  );
                }}
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
                    {poll.options.map((option, index) => {
                      const votedByMe = Array.isArray(option.voters) && option.voters.includes(currentUser.id);
                      const percent = poll.totalVotes ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={index} className="flex items-center justify-between gap-3 p-2 rounded">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Text className="text-sm">{option.text}</Text>
                              <Text className="text-sm text-gray-500">{option.votes} {language === 'ja' ? '票' : 'phiếu'}</Text>
                            </div>
                            <Progress
                              percent={percent}
                              size="small"
                              strokeColor="#1890ff"
                              className="mt-1"
                            />
                          </div>
                          <div className="ml-3">
                            {votedByMe ? (
                              <AntButton type="default" disabled>
                                {language === 'ja' ? '投票済み' : 'Đã bỏ phiếu'}
                              </AntButton>
                            ) : (
                              <AntButton
                                type="primary"
                                onClick={() => handleVote(poll.id, index)}
                                loading={voting && votingPollId === poll.id}
                              >
                                {language === 'ja' ? '投票' : 'Bầu'}
                              </AntButton>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                <div className="grid grid-cols-3 gap-2">
                  {sharedMedia.filter(m => m.type === 'image' || m.type === 'video').map((item) => (
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

              <Panel
                header={`${language === 'ja' ? 'ファイル' : 'File'} (${sharedMedia.filter(m => m.type === 'file').length})`}
                key="5-2"
              >
                <List
                  size="small"
                  dataSource={sharedMedia.filter(m => m.type === 'file')}
                  renderItem={(item) => (
                    <List.Item
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
                    <List.Item 
                      className="hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <List.Item.Meta
                        avatar={<LinkOutlined />}
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

      {/* Image Modal */}
      <Modal
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={[
          <AntButton
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            href={selectedImage}
            download
            className="bg-blue-600 hover:bg-blue-700"
          >
            {language === 'ja' ? 'ダウンロード' : 'Tải xuống'}
          </AntButton>,
          <AntButton key="close" onClick={() => setImageModalVisible(false)}>
            {language === 'ja' ? '閉じる' : 'Đóng'}
          </AntButton>
        ]}
        width="auto"
        centered
        className="image-preview-modal"
      >
        <div className="flex justify-center items-center p-4">
          <img 
            src={selectedImage} 
            alt="Preview" 
            style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
            className="rounded-lg"
          />
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
              navigate(`/chat/${threadId}`);
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