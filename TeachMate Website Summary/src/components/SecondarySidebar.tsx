import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UserPlus, Users, Hash, Flag, Loader2 } from 'lucide-react';
import { Button as AntButton, Modal, Input as AntInput, Select, message } from 'antd';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Badge as AntBadge } from 'antd';
import { translations, Language } from '../translations';
import { Teacher } from '../types';
import { reportUser } from '../apis/user.api';
import { sendFriendRequest } from '../apis/friend.api';
import { useThreadsStrangers } from '../hooks/useThreadsStrangers';
import { useThreadGroups } from '../hooks/useThreadGroups';
import { mapThreadData } from '../utils/mappers';

const { TextArea } = AntInput;

// Generate random avatar colors
const getAvatarColor = (id: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

const GroupIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="64 64 896 896"
    focusable="false"
    aria-hidden="true"
    className={className}
    fill="currentColor"
  >
    <path d="M824.2 699.9a301.55 301.55 0 00-86.4-60.4C783.1 602.8 812 546.8 812 484c0-110.8-92.4-201.7-203.2-200-109.1 1.7-197 90.6-197 200 0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 00-86.4 60.4C345 754.6 314 826.8 312 903.8a8 8 0 008 8.2h56c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5A226.62 226.62 0 01612 684c60.9 0 118.2 23.7 161.3 66.8C814.5 792 838 846.3 840 904.3c.1 4.3 3.7 7.7 8 7.7h56a8 8 0 008-8.2c-2-77-33-149.2-87.8-203.9zM612 612c-34.2 0-66.4-13.3-90.5-37.5a126.86 126.86 0 01-37.5-91.8c.3-32.8 13.4-64.5 36.3-88 24-24.6 56.1-38.3 90.4-38.7 33.9-.3 66.8 12.9 91 36.6 24.8 24.3 38.4 56.8 38.4 91.4 0 34.2-13.3 66.3-37.5 90.5A127.3 127.3 0 01612 612zM361.5 510.4c-.9-8.7-1.4-17.5-1.4-26.4 0-15.9 1.5-31.4 4.3-46.5.7-3.6-1.2-7.3-4.5-8.8-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 01-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6 24.7-25.3 57.9-39.1 93.2-38.7 31.9.3 62.7 12.6 86 34.4 7.9 7.4 14.7 15.6 20.4 24.4 2 3.1 5.9 4.4 9.3 3.2 17.6-6.1 36.2-10.4 55.3-12.4 5.6-.6 8.8-6.6 6.3-11.6-32.5-64.3-98.9-108.7-175.7-109.9-110.9-1.7-203.3 89.2-203.3 199.9 0 62.8 28.9 118.8 74.2 155.5-31.8 14.7-61.1 35-86.5 60.4-54.8 54.7-85.8 126.9-87.8 204a8 8 0 008 8.2h56.1c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5 29.4-29.4 65.4-49.8 104.7-59.7 3.9-1 6.5-4.7 6-8.7z" />
  </svg>
);

const groupBlueGradient = { background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' };
const groupGreenGradient = { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' };
const groupMockAvatar = 'https://ui-avatars.com/api/?name=Group&background=3b82f6&color=ffffff&size=128';

interface FriendRequest {
  id: string;
  fromUser: Teacher;
  status: string;
  createdAt: string;
}

interface Thread {
  id: string;
  type: 'direct_friend' | 'direct_stranger' | 'group';
  name?: string;
  avatar?: string;
  createdById?: string;
  otherUser?: Teacher;
  lastMessage?: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    contentType: string;
  };
  members: any[];
  unreadCount: number;
  isLastMessageRead: boolean;
}

interface SecondarySidebarProps {
  view: 'chat' | 'contacts';
  language: Language;
  friends: Teacher[];
  groups?: Array<{ id: string; name: string; memberCount: number; avatar: string; description: string }>;
  friendRequests: FriendRequest[];
  threads?: Thread[];
  isLoadingThreads?: boolean;
  onSelectChat: (teacher: Teacher) => void;
  onSelectGroup: (group: any) => void;
  onSelectThread?: (thread: Thread) => void;
  onAddFriend: () => void;
  onCreateGroup: () => void;
  onAcceptFriendRequest: (requestId: string) => void;
  onRejectFriendRequest: (requestId: string) => void;
  currentUserId: string;
}

export function SecondarySidebar({
  view,
  language,
  friends,
  groups = [],
  friendRequests,
  threads = [],
  isLoadingThreads = false,
  onSelectChat,
  onSelectGroup,
  onSelectThread,
  onAddFriend,
  onCreateGroup,
  onAcceptFriendRequest,
  onRejectFriendRequest,
  currentUserId
}: SecondarySidebarProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'categorized' | 'read'>('all');
  const [loadingRequests, setLoadingRequests] = useState<Set<string>>(new Set());
  const [showStrangerThreads, setShowStrangerThreads] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const contactsTab = searchParams.get('tab') === 'groups' ? 'groups' : 'friends';

  const handleContactsTabChange = (tab: 'friends' | 'groups') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
    setSearchQuery('');
  };

  // Fetch thread groups here to keep the sidebar self-contained
  const { data: threadGroupsData, isLoading: isLoadingThreadGroups } = useThreadGroups(view === 'chat' || view === 'contacts');
  const mappedThreadGroups = useMemo(() => {
    if (threadGroupsData?.success && Array.isArray(threadGroupsData.data)) {
      return threadGroupsData.data.map((group: any) => {
        const rawAvatar = group.avatar || group.avatarUrl;
        const avatar = typeof rawAvatar === 'string' && rawAvatar.trim() !== '' ? rawAvatar.trim() : '';
        return {
          id: group._id || group.id || '',
          name: group.name || 'Group',
          memberCount: Array.isArray(group.members) ? group.members.length : 0,
          avatar,
          description: group.lastMessage?.content || '',
        };
      });
    }
    return [] as Array<{ id: string; name: string; memberCount: number; avatar: string; description: string }>;
  }, [threadGroupsData]);

  const effectiveGroups = mappedThreadGroups.length > 0 ? mappedThreadGroups : groups;
  
  // Report modal states
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportingUser, setReportingUser] = useState<Teacher | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleAccept = async (requestId: string) => {
    setLoadingRequests(prev => new Set(prev).add(requestId));
    await onAcceptFriendRequest(requestId);
    setLoadingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  const handleReject = async (requestId: string) => {
    setLoadingRequests(prev => new Set(prev).add(requestId));
    await onRejectFriendRequest(requestId);
    setLoadingRequests(prev => {
      const newSet = new Set(prev);
      newSet.delete(requestId);
      return newSet;
    });
  };

  const handleOpenReportModal = (user: Teacher) => {
    setReportingUser(user);
    setReportModalVisible(true);
    setReportReason('');
  };

  const handleSubmitReport = async () => {
    if (!reportingUser || !reportReason.trim()) {
      message.warning(language === 'ja' ? '理由を入力してください' : 'Vui lòng nhập lý do báo cáo');
      return;
    }

    setIsSubmittingReport(true);
    try {
      const response = await reportUser({
        targetUserId: reportingUser.id,
        reason: reportReason.trim(),
        targetType: 'user'
      });

      if (response.success) {
        message.success(language === 'ja' ? '報告が送信されました' : 'Đã gửi báo cáo thành công');
        setReportModalVisible(false);
        setReportingUser(null);
        setReportReason('');
      } else {
        message.error(response.message || (language === 'ja' ? '報告の送信に失敗しました' : 'Gửi báo cáo thất bại'));
      }
    } catch (error) {
      console.error('Failed to report user:', error);
      message.error(language === 'ja' ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Split threads: keep direct_stranger threads (from getThreads) where last sender is not the current user in the stranger bucket
  const { primaryThreads, strangerThreadsFromFeed } = useMemo(() => {
    const stranger: Thread[] = [];
    const primary: Thread[] = [];

    threads.forEach((thread) => {
      const isDirectStranger = thread.type === 'direct_stranger';
      const isCreatedByCurrentUser = thread.createdById === currentUserId;

      if (isDirectStranger && !isCreatedByCurrentUser) {
        stranger.push(thread);
      } else {
        primary.push(thread);
      }
    });

    return { primaryThreads: primary, strangerThreadsFromFeed: stranger };
  }, [threads, currentUserId]);

  const filteredThreads = primaryThreads.filter(thread => {
    const name = thread.name || '';
    const lastMessageContent = thread.lastMessage?.content || '';
    return searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Stranger threads (polled & cached)
  const { data: strangerThreadsData, refetch: refetchStrangerThreads, isFetching: isFetchingStrangers, isLoading: isLoadingStrangers } = useThreadsStrangers(showStrangerThreads);
  const strangerThreads = useMemo(() => {
    if (strangerThreadsData?.success) {
      return mapThreadData(strangerThreadsData.data, currentUserId) || [];
    }
    return [];
  }, [strangerThreadsData, currentUserId]);

  // Merge stranger threads coming from both the dedicated endpoint and the main threads feed
  const mergedStrangerThreads = useMemo(() => {
    const map = new Map<string, Thread>();
    strangerThreadsFromFeed.forEach((t) => map.set(t.id, t));
    strangerThreads.forEach((t) => map.set(t.id, t));
    return Array.from(map.values());
  }, [strangerThreadsFromFeed, strangerThreads]);

  const hasStrangerData = (strangerThreadsData?.success && strangerThreads.length > 0) || strangerThreadsFromFeed.length > 0;
  const initialStrangerLoading = showStrangerThreads && isLoadingStrangers && !hasStrangerData;
  const showStrangerFetching = showStrangerThreads && isFetchingStrangers && strangerThreads.length > 0;

  const filteredStrangerThreads = mergedStrangerThreads.filter(thread => {
    const name = thread.name || '';
    const lastMessageContent = thread.lastMessage?.content || '';
    return searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessageContent.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const threadListToRender = showStrangerThreads ? filteredStrangerThreads : filteredThreads;
  const loadingThreads = showStrangerThreads ? initialStrangerLoading : isLoadingThreads;

  if (view === 'chat') {
    return (
      <div className="w-96 bg-gradient-to-b from-blue-50 to-white border-r-2 border-blue-100 flex flex-col h-full shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b-2 border-blue-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchTeachers}
                className="pl-9 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
              />
            </div>
            <AntButton
              onClick={onAddFriend}
              type="default"
              shape="circle"
              title={t.addFriend}
              className="!flex items-center justify-center w-9 h-9 !border-blue-300 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-400"
            >
              <UserPlus className="w-4 h-4" />
            </AntButton>
            <AntButton
              onClick={onCreateGroup}
              type="default"
              shape="circle"
              title={t.createGroupChat}
              className="!flex items-center justify-center w-9 h-9 !border-blue-300 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-400"
            >
              <Users className="w-4 h-4" />
            </AntButton>
          </div>
        </div>

        {/* Message Filters */}
        <div className="px-4 py-3 border-b-2 border-blue-100 bg-white/60 flex-shrink-0">
          <div className="flex gap-2 flex-wrap">
            <AntButton
              type={messageFilter === 'all' && !showStrangerThreads ? 'primary' : 'default'}
              size="middle"
              onClick={() => {
                setShowStrangerThreads(false);
                setMessageFilter('all');
              }}
              className={`flex-1 min-w-[120px] ${messageFilter === 'all' && !showStrangerThreads ? '!bg-blue-600 hover:!bg-blue-700' : '!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300'}`}
            >
              {t.allMessages}
            </AntButton>
            <AntButton
              type={messageFilter === 'read' && !showStrangerThreads ? 'primary' : 'default'}
              size="middle"
              onClick={() => {
                setShowStrangerThreads(false);
                setMessageFilter('read');
              }}
              className={`flex-1 min-w-[120px] ${messageFilter === 'read' && !showStrangerThreads ? '!bg-blue-600 hover:!bg-blue-700' : '!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300'}`}
            >
              {t.markedAsRead}
            </AntButton>
            <AntButton
              type={messageFilter === 'unread' && !showStrangerThreads ? 'primary' : 'default'}
              size="middle"
              onClick={() => {
                setShowStrangerThreads(false);
                setMessageFilter('unread');
              }}
              className={`flex-1 min-w-[120px] ${messageFilter === 'unread' && !showStrangerThreads ? '!bg-blue-600 hover:!bg-blue-700' : '!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300'}`}
            >
              {t.unreadMessages}
            </AntButton>
            <AntButton
              type={showStrangerThreads ? 'primary' : 'default'}
              size="middle"
              onClick={() => {
                setShowStrangerThreads(true);
                refetchStrangerThreads();
              }}
              className={`flex-1 min-w-[150px] ${showStrangerThreads ? '!bg-indigo-600 hover:!bg-indigo-700' : '!text-indigo-600 !border-indigo-200 hover:!bg-indigo-50 hover:!border-indigo-300'}`}
            >
              <span className="flex items-center justify-center gap-2">
                {t.strangerMessages}
                {showStrangerFetching && <Loader2 className="w-4 h-4 animate-spin" />}
              </span>
            </AntButton>
          </div>
          {showStrangerThreads && (
            <div className="mt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStrangerThreads(false)}
                className="text-indigo-600 hover:text-indigo-700"
              >
                {t.backToAll}
              </Button>
            </div>
          )}
        </div>

        {/* Threads List */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-2">
            {loadingThreads ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm">{language === 'ja' ? '読み込み中...' : 'Đang tải...'}</p>
              </div>
            ) : threadListToRender.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t.noConversations}</p>
              </div>
            ) : (
              threadListToRender.map((thread) => {
                const isGroup = thread.type === 'group';
                const rawAvatar = thread.avatar && thread.avatar.trim() !== '' ? thread.avatar : undefined;
                const displayAvatar = isGroup ? rawAvatar || groupMockAvatar : rawAvatar;
                return (
                <div
                  key={thread.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all border group ${
                    thread.unreadCount > 0 
                      ? 'border-blue-300 bg-blue-50/50' 
                      : 'border-transparent hover:border-blue-200'
                  }`}
                >
                  <button
                    onClick={() => onSelectThread && onSelectThread(thread)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="relative flex-shrink-0">
                      {displayAvatar ? (
                        <Avatar className="w-10 h-10 border-2 border-blue-100">
                          <AvatarImage src={displayAvatar} alt={thread.name || ''} className="object-cover" />
                          <AvatarFallback className={`${isGroup ? 'bg-gradient-to-br from-blue-400 to-blue-600' : getAvatarColor(thread.id)} text-white font-semibold`}>
                            {isGroup ? <GroupIcon className="w-5 h-5 text-white" /> : thread.name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                      ) : isGroup ? (
                        <div
                          className="w-10 h-10 rounded-full border-2 border-blue-100 flex items-center justify-center text-white font-semibold"
                          style={groupBlueGradient}
                        >
                          <GroupIcon className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full border-2 border-blue-100 flex items-center justify-center ${getAvatarColor(thread.id)} text-white font-semibold`}>
                          {thread.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      {thread.type === 'direct_friend' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold text-gray-800 truncate ${thread.unreadCount > 0 ? 'text-blue-700' : ''}`}>
                          {thread.name}
                        </p>
                        {thread.unreadCount > 0 && (
                          <AntBadge 
                            count={thread.unreadCount} 
                            className="ml-2"
                            style={{ backgroundColor: '#2563eb' }}
                          />
                        )}
                      </div>
                      {thread.lastMessage && (
                        <p className={`text-sm truncate ${
                          thread.unreadCount > 0 
                            ? 'text-blue-700 font-medium' 
                            : 'text-gray-600'
                        }`}>
                          {thread.lastMessage.senderName}: {thread.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>

                  {thread.type !== 'group' && thread.otherUser && (
                    <>
                      {thread.type === 'direct_stranger' && thread.lastMessage?.senderId === currentUserId && (
                        <AntButton
                          type="text"
                          size="small"
                          icon={<UserPlus className="w-4 h-4" />}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const res = await sendFriendRequest(thread.otherUser!.id);
                              if (res?.success) {
                                message.success(language === 'ja' ? 'フレンド申請を送信しました' : 'Đã gửi lời mời kết bạn');
                              } else {
                                message.error(res?.message || (language === 'ja' ? '送信に失敗しました' : 'Gửi thất bại'));
                              }
                            } catch (err: any) {
                              console.error('sendFriendRequest failed', err);
                              message.error(language === 'ja' ? 'エラーが発生しました' : 'Đã xảy ra lỗi');
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity !text-blue-600 hover:!bg-blue-50"
                          title={language === 'ja' ? '友達追加' : 'Kết bạn'}
                        />
                      )}
                    <AntButton
                      type="text"
                      size="small"
                      icon={<Flag className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReportModal(thread.otherUser as Teacher);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity !text-red-500 hover:!bg-red-50"
                      title={language === 'ja' ? 'ユーザーを報告' : 'Báo cáo người dùng'}
                    />
                    </>
                  )}
                </div>
              );
              })
            )}
          </div>
        </ScrollArea>

        {/* Report User Modal (chat view) */}
        <Modal
          title={language === 'ja' ? 'ユーザーを報告' : 'Báo cáo người dùng'}
          open={reportModalVisible}
          onCancel={() => {
            setReportModalVisible(false);
            setReportingUser(null);
            setReportReason('');
          }}
          footer={[
            <AntButton
              key="cancel"
              onClick={() => {
                setReportModalVisible(false);
                setReportingUser(null);
                setReportReason('');
              }}
              disabled={isSubmittingReport}
            >
              {language === 'ja' ? 'キャンセル' : 'Hủy'}
            </AntButton>,
            <AntButton
              key="submit"
              type="primary"
              danger
              onClick={handleSubmitReport}
              loading={isSubmittingReport}
            >
              {language === 'ja' ? '報告する' : 'Gửi báo cáo'}
            </AntButton>
          ]}
          centered
        >
          {reportingUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  {reportingUser.avatar ? (
                    <AvatarImage src={reportingUser.avatar} alt={reportingUser.name} />
                  ) : null}
                  <AvatarFallback className={`${getAvatarColor(reportingUser.id)} text-white`}>
                    {reportingUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{reportingUser.name}</p>
                  <p className="text-sm text-gray-500">{reportingUser.specialties[0]}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ja' ? '報告理由' : 'Lý do báo cáo'}
                </label>
                <TextArea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder={language === 'ja' ? '理由を入力してください...' : 'Nhập lý do báo cáo...'}
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // Contacts View
  return (
    <div className="w-72 bg-gradient-to-b from-green-50 to-white border-r-2 border-green-100 flex flex-col h-full shadow-sm">
      <div className="p-4 border-b-2 border-green-100 bg-white/80 backdrop-blur-sm">
        <h3 className="text-sm text-gray-600 mb-3">{language === 'ja' ? '連絡先' : 'Danh bạ'}</h3>
        <div className="flex flex-col gap-2">
          <AntButton
            block
            type={contactsTab === 'friends' ? 'primary' : 'default'}
            onClick={() => handleContactsTabChange('friends')}
            className={contactsTab === 'friends' ? '!bg-green-600 hover:!bg-green-700' : '!text-green-700 !border-green-200 hover:!bg-green-50'}
          >
            {language === 'ja' ? '友達リスト' : 'Danh sách bạn bè'}
          </AntButton>
          <AntButton
            block
            type={contactsTab === 'groups' ? 'primary' : 'default'}
            onClick={() => handleContactsTabChange('groups')}
            className={contactsTab === 'groups' ? '!bg-green-600 hover:!bg-green-700' : '!text-green-700 !border-green-200 hover:!bg-green-50'}
          >
            {language === 'ja' ? 'グループ và cộng đồng' : 'Nhóm và cộng đồng'}
          </AntButton>
        </div>
      </div>

      <div className="p-4 border-t border-green-100 bg-white/70 backdrop-blur-sm flex flex-col gap-2">
        <AntButton
          block
          type="default"
          onClick={onAddFriend}
          className="!text-green-700 !border-green-200 hover:!bg-green-50"
          icon={<UserPlus className="w-4 h-4" />}
        >
          {t.addFriend}
        </AntButton>
        <AntButton
          block
          type="default"
          onClick={onCreateGroup}
          className="!text-green-700 !border-green-200 hover:!bg-green-50"
          icon={<Users className="w-4 h-4" />}
        >
          {t.createGroupChat}
        </AntButton>
      </div>
    </div>
  );
}
