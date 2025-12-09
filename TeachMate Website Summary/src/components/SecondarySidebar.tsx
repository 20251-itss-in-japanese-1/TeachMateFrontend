import React, { useMemo, useState } from 'react';
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
  groups: Array<{ id: string; name: string; memberCount: number; avatar: string; description: string }>;
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
  groups,
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
              threadListToRender.map((thread) => (
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
                      <Avatar className="w-10 h-10 border-2 border-blue-100">
                        {thread.avatar ? (
                          <AvatarImage src={thread.avatar} alt={thread.name || ''} className="object-cover" />
                        ) : null}
                        <AvatarFallback className={`${thread.type === 'group' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : getAvatarColor(thread.id)} text-white font-semibold`}>
                          {thread.type === 'group' ? (
                            <Hash className="w-5 h-5 text-white" />
                          ) : (
                            thread.name?.charAt(0).toUpperCase() || '?'
                          )}
                        </AvatarFallback>
                      </Avatar>
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
              ))
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
    <div className="w-96 bg-gradient-to-b from-green-50 to-white border-r-2 border-green-100 flex flex-col h-full shadow-sm">
      {/* Search Bar and Action Buttons */}
      <div className="p-4 border-b-2 border-green-100 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchFriends}
              className="pl-9 border-green-200 focus:border-green-400 focus:ring-green-200"
            />
          </div>
          <AntButton
            onClick={onAddFriend}
            type="default"
            shape="circle"
            title={t.addFriend}
            className="!flex items-center justify-center w-9 h-9 !border-green-300 !text-green-600 hover:!bg-green-50 hover:!border-green-400"
          >
            <UserPlus className="w-4 h-4" />
          </AntButton>
          <AntButton
            onClick={onCreateGroup}
            type="default"
            shape="circle"
            title={t.createGroupChat}
            className="!flex items-center justify-center w-9 h-9 !border-green-300 !text-green-600 hover:!bg-green-50 hover:!border-green-400"
          >
            <Users className="w-4 h-4" />
          </AntButton>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4 overflow-hidden">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">{t.friendRequests}</h3>
              <Badge variant="secondary">{friendRequests.length}</Badge>
            </div>
            <div className="space-y-2">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-green-50/70 border border-green-200 hover:border-green-300 transition-all"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0 border border-green-200">
                    {request.fromUser.avatar ? (
                      <AvatarImage src={request.fromUser.avatar} alt={request.fromUser.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className={`${getAvatarColor(request.fromUser.id)} text-white font-semibold text-xs`}>
                      {request.fromUser.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{request.fromUser.name}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <AntButton
                      type="primary"
                      size="small"
                      onClick={() => handleAccept(request.id)}
                      loading={loadingRequests.has(request.id)}
                      disabled={loadingRequests.has(request.id)}
                      className="flex items-center justify-center min-w-[28px] !h-7 !bg-green-600 !text-white hover:!bg-green-700"
                    >
                      ✓
                    </AntButton>
                    <AntButton
                      size="small"
                      onClick={() => handleReject(request.id)}
                      loading={loadingRequests.has(request.id)}
                      disabled={loadingRequests.has(request.id)}
                      className="flex items-center justify-center min-w-[28px] !h-7 border-green-300 text-green-700 hover:!bg-green-50 hover:border-green-400"
                    >
                      ✕
                    </AntButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend List */}
        <div className="px-4 mb-4">
          <h3 className="text-sm text-gray-600 mb-2">{t.friendList}</h3>
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{t.noFriends}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 hover:shadow-sm transition-all border border-transparent hover:border-green-200 group"
                >
                  <button
                    onClick={() => onSelectChat(friend)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <Avatar className="w-10 h-10 border-2 border-green-100 flex-shrink-0">
                      {friend.avatar ? (
                        <AvatarImage src={friend.avatar} alt={friend.name} className="object-cover" />
                      ) : null}
                      <AvatarFallback className={`${getAvatarColor(friend.id)} text-white font-semibold`}>
                        {friend.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{friend.name}</p>
                      <p className="text-sm text-green-600 truncate">
                        {friend.specialties[0]}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm flex-shrink-0" />
                  </button>
                  <AntButton
                    type="text"
                    size="small"
                    icon={<Flag className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenReportModal(friend);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity !text-red-500 hover:!bg-red-50"
                    title={language === 'ja' ? 'ユーザーを報告' : 'Báo cáo người dùng'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Groups & Communities */}
        <div className="px-4 mb-4">
          <h3 className="text-sm text-gray-600 mb-2">{t.groupsList}</h3>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{t.noGroups}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 hover:shadow-sm transition-all border border-transparent hover:border-green-200"
                >
                  <Avatar className="w-10 h-10 border-2 border-green-100 flex-shrink-0">
                    {group.avatar ? (
                      <AvatarImage src={group.avatar} alt={group.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600">
                        <Hash className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{group.name}</p>
                    <p className="text-sm text-green-600">
                      {group.memberCount} members
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Report User Modal */}
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
