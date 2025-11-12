import React, { useState, useEffect } from 'react';
import { Teacher, Notification } from './types';
import { mockGroups, mockReports, mockSessions, mockAppointments } from './data/mockData';
import { LoginRegistration } from './components/LoginRegistration';
import { PrimaryNavbar } from './components/PrimaryNavbar';
import { SecondarySidebar } from './components/SecondarySidebar';
import { Homepage } from './components/Homepage';
import { ChatInterface } from './components/ChatInterface';
import { GroupChatInterface } from './components/GroupChatInterface';
import { TeacherProfile } from './components/TeacherProfile';
import { UserProfileEdit } from './components/UserProfileEdit';
import { UserProfileView } from './components/UserProfileView';
import { AllTeachers } from './components/AllTeachers';
import { AllGroups } from './components/AllGroups';
import { NotificationsPage } from './components/NotificationsPage';
import { LanguageToggle } from './components/LanguageToggle';
import { AddFriendModal } from './components/AddFriendModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { translations, Language } from './translations';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { getUserProfile } from './apis/user.api';
import { sendFriendRequest, getFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriendList } from './apis/friend.api';
import { getThreads} from './apis/thread.api';
import { mapUserToTeacher, mapFriendListData, mapFriendRequestData, mapThreadData } from './utils/mappers';
import { useChat } from './hooks/useChat';
import 'antd/dist/reset.css';

type ViewType = 'home' | 'chat' | 'contacts' | 'all-teachers' | 'all-groups' | 'notifications' | 'admin';

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

interface ThreadDetail {
  thread: {
    id: string;
    name?: string;
    avatar?: string;
    type: string;
    members: any[];
  };
  messages: any[];
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [language, setLanguage] = useState<Language>('ja');
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Teacher | null>(null);
  const [chatTeacher, setChatTeacher] = useState<Teacher | null>(null);
  const [chatGroup, setChatGroup] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [friends, setFriends] = useState<Teacher[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoadingFriendRequests, setIsLoadingFriendRequests] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Use chat hook for caching messages
  const { data: threadDetailData, isLoading: isLoadingThreadDetail, refetch: refetchThreadDetail } = useChat(selectedThreadId);

  // Refetch messages periodically (optional - for real-time feel)
  useEffect(() => {
    if (!selectedThreadId) return;
    
    const interval = setInterval(() => {
      refetchThreadDetail();
    }, 5000); // Refetch every 5 seconds

    return () => clearInterval(interval);
  }, [selectedThreadId, refetchThreadDetail]);

  const t = translations[language];

  // Check for existing token on mount and fetch user profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await getUserProfile();
          
          if (response.success) {
            const user = mapUserToTeacher(response.data);
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Fetch friend requests when authenticated
  useEffect(() => {
    const fetchFriendRequests = async () => {
      if (!isAuthenticated || isAdmin) return;
      
      setIsLoadingFriendRequests(true);
      try {
        const response = await getFriendRequest();
        
        if (response.success) {
          const mappedRequests = mapFriendRequestData(response.data);
          setFriendRequests(mappedRequests);
        }
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
        setFriendRequests([]);
      } finally {
        setIsLoadingFriendRequests(false);
      }
    };

    fetchFriendRequests();
  }, [isAuthenticated, isAdmin]);

  // Fetch friend list when authenticated
  useEffect(() => {
    const fetchFriendList = async () => {
      if (!isAuthenticated || isAdmin) return;
      
      try {
        const response = await getFriendList();
        
        if (response.success) {
          const mappedFriends = mapFriendListData(response.data.friends);
          setFriends(mappedFriends);
        }
      } catch (error) {
        console.error('Failed to fetch friend list:', error);
        setFriends([]);
      }
    };

    fetchFriendList();
  }, [isAuthenticated, isAdmin]);

  // Fetch threads function
  const fetchThreads = async () => {
    if (!isAuthenticated || isAdmin) return;
    
    setIsLoadingThreads(true);
    try {
      const response = await getThreads();
      
      if (response.success) {
        const mappedThreads = mapThreadData(response.data, currentUser?.id);
        setThreads(mappedThreads);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
      setThreads([]);
    } finally {
      setIsLoadingThreads(false);
    }
  };
  useEffect(() => {
    fetchThreads();
  }, [isAuthenticated, isAdmin, currentUser?.id]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ja' ? 'vi' : 'ja');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAuthenticated(true);
    setActiveView('admin');
    toast.success('Admin login successful');
  };

  const handleLogin = async (userData: { name: string; email: string; nationality: 'Japanese' | 'Vietnamese' }, token?: string) => {
    if (token) {
      localStorage.setItem('token', token);
      
      try {
        const response = await getUserProfile();
        
        if (response.success) {
          const newUser = mapUserToTeacher(response.data);
          setCurrentUser(newUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to fetch user profile after login:', error);
        toast.error('Failed to load user profile');
        localStorage.removeItem('token');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setActiveView('home');
    setChatTeacher(null);
    
    // Clear stored token
    localStorage.removeItem('token');
  };

  const handleSaveProfile = (updatedUser: Teacher) => {
    setCurrentUser(updatedUser);
    toast.success(language === 'ja' ? 'プロフィールを更新しました' : 'Đã cập nhật hồ sơ');
  };

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    if (view !== 'chat') {
      setChatTeacher(null);
      setChatGroup(null);
    }
  };

  const handleSelectChat = (teacher: Teacher) => {
    setChatTeacher(teacher);
    setChatGroup(null);
    setActiveView('chat');
  };

  const handleSelectGroup = (group: any) => {
    setChatGroup(group);
    setChatTeacher(null);
    setActiveView('chat');
  };

  const handleSelectThread = async (thread: Thread) => {
    try {
      // Set the selected thread ID to trigger useChat hook
      setSelectedThreadId(thread.id);

      // Set chat based on thread type
      if (thread.type === 'group') {
        setChatGroup({
          id: thread.id,
          name: thread.name,
          avatar: thread.avatar,
          members: thread.members
        });
        setChatTeacher(null);
      } else {
        if (thread.otherUser) {
          setChatTeacher(thread.otherUser);
        }
        setChatGroup(null);
      }
      
      setActiveView('chat');

      // Refresh threads to update unread count in background
      const threadsResponse = await getThreads();
      if (threadsResponse.success) {
        const mappedThreads = mapThreadData(threadsResponse.data, currentUser?.id);
        setThreads(mappedThreads);
      }
    } catch (error) {
      console.error('Failed to select thread:', error);
      toast.error(
        language === 'ja'
          ? 'メッセージの読み込みに失敗しました'
          : 'Không thể tải tin nhắn'
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
      } else {
        toast.error(
          language === 'ja'
            ? 'リクエストの送信に失敗しました'
            : 'Gửi lời mời thất bại'
        );
      }
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(
        language === 'ja'
          ? `エラー: ${errorMessage}`
          : `Lỗi: ${errorMessage}`
      );
    }
  };

  const handleJoinGroup = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      toast.success(
        language === 'ja'
          ? `${group.name}に参加しました`
          : `Đã tham gia ${group.name}`
      );
    }
  };

  const handleAddFriend = () => {
    setIsAddFriendModalOpen(true);
  };

  const handleCreateGroup = () => {
    setIsCreateGroupModalOpen(true);
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
        
        // Refetch friend list
        const friendListResponse = await getFriendList();
        if (friendListResponse.success) {
          const mappedFriends = mapFriendListData(friendListResponse.data.friends);
          setFriends(mappedFriends);
        }
        
        // Refetch friend requests
        const updatedRequests = await getFriendRequest();
        if (updatedRequests.success) {
          const mappedRequests = mapFriendRequestData(updatedRequests.data);
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
      
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(
        language === 'ja'
          ? `エラー: ${errorMessage}`
          : `Lỗi: ${errorMessage}`
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
        
        // Remove the rejected request from the list
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
      
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(
        language === 'ja'
          ? `エラー: ${errorMessage}`
          : `Lỗi: ${errorMessage}`
      );
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="relative">
          <div className="absolute top-4 right-4 z-50">
            <LanguageToggle language={language} onToggle={toggleLanguage} />
          </div>
          <LoginRegistration
            onLogin={handleLogin}
            onAdminLogin={handleAdminLogin}
            language={language}
          />
        </div>
        <Toaster />
      </>
    );
  }

  // Admin Panel
  if (isAdmin) {
    return (
      <>
        <AdminDashboard onLogout={handleLogout} />
        <Toaster />
      </>
    );
  }

  // Main application layout
  return (
    <>
      <div className="h-screen flex overflow-hidden">
        {/* Primary Navbar (1.5cm / ~80px) */}
        <PrimaryNavbar
          user={currentUser!}
          activeView={activeView}
          onViewChange={handleViewChange}
          onViewProfile={() => setIsViewingProfile(true)}
          onEditProfile={() => setIsEditingProfile(true)}
          onLogout={handleLogout}
          onViewNotifications={() => setActiveView('notifications')}
          unreadNotificationsCount={0}
          language={language}
        />

        {/* Secondary Sidebar (shown for chat and contacts views) */}
        {(activeView === 'chat' || activeView === 'contacts') && (
          <SecondarySidebar
            view={activeView as 'chat' | 'contacts'}
            language={language}
            friends={friends}
            groups={mockGroups}
            friendRequests={friendRequests}
            threads={threads}
            isLoadingThreads={isLoadingThreads}
            onSelectChat={handleSelectChat}
            onSelectGroup={handleSelectGroup}
            onSelectThread={handleSelectThread}
            onAddFriend={handleAddFriend}
            onCreateGroup={handleCreateGroup}
            onAcceptFriendRequest={handleAcceptFriendRequest}
            onRejectFriendRequest={handleRejectFriendRequest}
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
            {activeView === 'home' && (
              <Homepage
                user={currentUser!}
                language={language}
                groups={mockGroups}
                exchangeSessions={mockSessions}
                appointments={mockAppointments}
                onSendFriendRequest={handleSendFriendRequest}
                onViewTeacherProfile={setSelectedProfile}
                onJoinGroup={handleJoinGroup}
                onViewAllTeachers={() => setActiveView('all-teachers')}
                onViewAllGroups={() => setActiveView('all-groups')}
              />
            )}

            {activeView === 'all-teachers' && (
              <AllTeachers
                language={language}
                onSendFriendRequest={handleSendFriendRequest}
                onViewTeacherProfile={setSelectedProfile}
                onBack={() => setActiveView('home')}
              />
            )}

            {activeView === 'all-groups' && (
              <AllGroups
                groups={mockGroups}
                language={language}
                onJoinGroup={handleJoinGroup}
                onBack={() => setActiveView('home')}
              />
            )}

            {activeView === 'notifications' && (
              <>
                <NotificationsPage
                  language={language}
                  onBack={() => setActiveView('home')}
                />
              </>
            )}

            {activeView === 'chat' && chatTeacher && (
              <ChatInterface
                currentTeacher={currentUser!}
                selectedTeacher={chatTeacher}
                threadDetail={threadDetailData?.success ? {
                  thread: {
                    id: threadDetailData.data.thread._id,
                    name: threadDetailData.data.thread.name,
                    avatar: threadDetailData.data.thread.avatar,
                    type: threadDetailData.data.thread.type,
                    members: threadDetailData.data.thread.members
                  },
                  messages: threadDetailData.data.messages
                } : null}
                isLoadingMessages={isLoadingThreadDetail}
                onBack={() => {
                  setChatTeacher(null);
                  setSelectedThreadId(null);
                }}
                onViewProfile={setSelectedProfile}
                isFriend={friends.some(friend => friend.id === chatTeacher.id)}
                onSendFriendRequest={handleSendFriendRequest}
                language={language}
              />
            )}

            {activeView === 'chat' && chatGroup && (
              <GroupChatInterface
                currentUser={currentUser!}
                selectedGroup={chatGroup}
                threadDetail={threadDetailData?.success ? {
                  thread: {
                    id: threadDetailData.data.thread._id,
                    name: threadDetailData.data.thread.name,
                    avatar: threadDetailData.data.thread.avatar,
                    type: threadDetailData.data.thread.type,
                    members: threadDetailData.data.thread.members
                  },
                  messages: threadDetailData.data.messages
                } : null}
                isLoadingMessages={isLoadingThreadDetail}
                onBack={() => {
                  setChatGroup(null);
                  setSelectedThreadId(null);
                }}
                language={language}
              />
            )}

            {activeView === 'chat' && !chatTeacher && !chatGroup && (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <p className="text-lg">{t.noConversations}</p>
                  <p className="text-sm mt-2">{language === 'ja' ? '左側のリストから友達またはグループを選択してください' : 'Chọn một người bạn hoặc nhóm từ danh sách bên trái'}</p>
                </div>
              </div>
            )}

            {activeView === 'contacts' && (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <p className="text-lg">{language === 'ja' ? '連絡先管理' : 'Quản lý danh bạ'}</p>
                  <p className="text-sm mt-2">{language === 'ja' ? '左側のリストから友達やグループを管理できます' : 'Quản lý bạn bè và nhóm từ danh sách bên trái'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TeacherProfile
        teacher={selectedProfile}
        open={selectedProfile !== null}
        onClose={() => setSelectedProfile(null)}
        onStartChat={(teacher) => {
          setActiveView('chat');
          setChatTeacher(teacher);
          setSelectedProfile(null);
        }}
        language={language}
      />

      <UserProfileEdit
        user={currentUser!}
        open={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        onSave={handleSaveProfile}
        language={language}
      />

      <UserProfileView
        user={currentUser!}
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
          // Refetch threads list after creating group
          fetchThreads();
          // Switch to chat view to see the new group
          setActiveView('chat');
        }}
        language={language}
      />

      <Toaster />
    </>
  );
}
