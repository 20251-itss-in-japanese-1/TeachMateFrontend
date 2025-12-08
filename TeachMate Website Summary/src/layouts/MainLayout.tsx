import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { PrimaryNavbar } from '../components/PrimaryNavbar';
import { SecondarySidebar } from '../components/SecondarySidebar';
import { LanguageToggle } from '../components/LanguageToggle';
import { TeacherProfile } from '../components/TeacherProfile';
import { UserProfileEdit } from '../components/UserProfileEdit';
import { UserProfileView } from '../components/UserProfileView';
import { AddFriendModal } from '../components/AddFriendModal';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { mockGroups } from '../data/mockData';
import { translations } from '../translations';
import { Teacher } from '../types';
import { toast } from 'sonner';
import { acceptFriendRequest, rejectFriendRequest, sendFriendRequest } from '../apis/friend.api';
import { mapFriendListData, mapFriendRequestData } from '../utils/mappers';
import { removeTokenFromLocalStorage } from '../apis/localtoken';
import { getThreadChat } from '../apis/chat.api';

type ViewType = 'home' | 'chat' | 'contacts' | 'all-teachers' | 'all-groups' | 'notifications' | 'admin';

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    language,
    toggleLanguage,
    friends,
    friendRequests,
    threads,
    unreadNotificationsCount,
    setIsAuthenticated,
    setIsAdmin,
    setCurrentUser,
    setFriends,
    setFriendRequests,
    setSelectedThreadId,
    refetchFriendList,
    refetchFriendRequests,
    refetchThreads,
  } = useAppContext();

  const [selectedProfile, setSelectedProfile] = useState<Teacher | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const t = translations[language];

  // Determine active view from current route
  const getActiveView = (): ViewType => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/chat')) return 'chat';
    if (path === '/contacts') return 'contacts';
    if (path === '/teachers') return 'all-teachers';
    if (path === '/groups') return 'all-groups';
    if (path === '/notifications') return 'notifications';
    if (path === '/admin') return 'admin';
    return 'home';
  };

  const activeView = getActiveView();

  const handleViewChange = (view: ViewType) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'contacts':
        navigate('/contacts');
        break;
      case 'all-teachers':
        navigate('/teachers');
        break;
      case 'all-groups':
        navigate('/groups');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    removeTokenFromLocalStorage();
    navigate('/login');
  };

  const handleSaveProfile = (updatedUser: Teacher) => {
    setCurrentUser(updatedUser);
    toast.success(language === 'ja' ? 'プロフィールを更新しました' : 'Đã cập nhật hồ sơ');
  };

  const handleSelectChat = async (teacher: Teacher) => {
    try {
      // Call getThreadChat API to get or create thread
      const response = await getThreadChat({ recipientId: teacher.id });
      
      if (response.success && response.data) {
        const threadId = response.data._id;
        setSelectedThreadId(threadId);
        navigate(`/chat/${threadId}`);
        
        // Refetch all related APIs
        await Promise.all([
          refetchThreads(),
          refetchFriendList(),
          refetchFriendRequests()
        ]);
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
  };

  const handleSelectGroup = (group: any) => {
    navigate('/chat', { state: { group } });
  };

  const handleSelectThread = async (thread: any) => {
    try {
      setSelectedThreadId(thread.id);
      navigate(`/chat/${thread.id}`);
    } catch (error) {
      console.error('Failed to select thread:', error);
      toast.error(
        language === 'ja'
          ? 'メッセージの読み込みに失敗しました'
          : 'Không thể tải tin nhắn'
      );
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      const response = await acceptFriendRequest(requestId);
      
      if (response.success) {
        toast.success(
          language === 'ja'
            ? '友達リクエストを承認しました'
            : 'Đã chấp nhận lời mời kết bạn'
        );
        
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
        
        const friendListResponse = await refetchFriendList();
        if (friendListResponse.data?.success) {
          const mappedFriends = mapFriendListData(friendListResponse.data.data.friends);
          setFriends(mappedFriends);
        }
        
        const updatedRequests = await refetchFriendRequests();
        if (updatedRequests.data?.success) {
          const mappedRequests = mapFriendRequestData(updatedRequests.data.data);
          setFriendRequests(mappedRequests);
        }
      } else {
        toast.error(
          language === 'ja'
            ? 'リクエストの承認に失敗しました'
            : 'Không thể chấp nhận lời mời'
        );
      }
    } catch (error: any) {
      console.error('Failed to accept friend request:', error);
      toast.error(
        language === 'ja'
          ? `エラー: ${error.response?.data?.message || error.message}`
          : `Lỗi: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      const response = await rejectFriendRequest(requestId);
      
      if (response.success) {
        toast.success(
          language === 'ja'
            ? '友達リクエストを拒否しました'
            : 'Đã từ chối lời mời kết bạn'
        );
        
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      } else {
        toast.error(
          language === 'ja'
            ? 'リクエストの拒否に失敗しました'
            : 'Không thể từ chối lời mời'
        );
      }
    } catch (error: any) {
      console.error('Failed to reject friend request:', error);
      toast.error(
        language === 'ja'
          ? `エラー: ${error.response?.data?.message || error.message}`
          : `Lỗi: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleSendFriendRequest = async (teacher: Teacher) => {
    try {
      const response = await sendFriendRequest(teacher.id);
      
      if (response.success) {
        toast.success(
          language === 'ja'
            ? `${teacher.name}さんに友達リクエストを送信しました`
            : `Đã gửi lời mời kết bạn đến ${teacher.name}`
        );
      }
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      toast.error(
        language === 'ja'
          ? `エラー: ${error.response?.data?.message || error.message}`
          : `Lỗi: ${error.response?.data?.message || error.message}`
      );
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Primary Navbar */}
      <PrimaryNavbar
        user={currentUser}
        activeView={activeView}
        onViewChange={handleViewChange}
        onViewProfile={() => setIsViewingProfile(true)}
        onEditProfile={() => setIsEditingProfile(true)}
        onLogout={handleLogout}
        onViewNotifications={() => navigate('/notifications')}
        unreadNotificationsCount={unreadNotificationsCount}
        language={language}
      />

      {/* Secondary Sidebar */}
      {(activeView === 'chat' || activeView === 'contacts') && (
        <SecondarySidebar
          view={activeView as 'chat' | 'contacts'}
          language={language}
          friends={friends}
          groups={mockGroups}
          friendRequests={friendRequests}
          threads={threads}
          isLoadingThreads={false}
          onSelectChat={handleSelectChat}
          onSelectGroup={handleSelectGroup}
          onSelectThread={handleSelectThread}
          onAddFriend={() => setIsAddFriendModalOpen(true)}
          onCreateGroup={() => setIsCreateGroupModalOpen(true)}
          onAcceptFriendRequest={handleAcceptFriendRequest}
          onRejectFriendRequest={handleRejectFriendRequest}
          currentUserId={currentUser.id}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b-2 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="mb-1">{t.appName}</h1>
            <p className="text-gray-600">{t.tagline}</p>
          </div>
          <LanguageToggle language={language} onToggle={toggleLanguage} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>

      {/* Modals */}
      <TeacherProfile
        teacher={selectedProfile}
        open={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        onStartChat={(teacher) => {
          handleSelectChat(teacher);
          setSelectedProfile(null);
        }}
        language={language}
      />

      <UserProfileEdit
        user={currentUser}
        open={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSave={handleSaveProfile}
        language={language}
      />

      <UserProfileView
        user={currentUser}
        open={isViewingProfile}
        onClose={() => setIsViewingProfile(false)}
        language={language}
      />

      <AddFriendModal
        open={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        teachers={[]}
        currentUserId={currentUser?.id || ''}
        onSendFriendRequest={handleSendFriendRequest}
        language={language}
      />

      <CreateGroupModal
        open={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        teachers={friends}
        onGroupCreated={() => {
          refetchThreads();
          navigate('/chat');
        }}
        language={language}
      />
    </div>
  );
};
