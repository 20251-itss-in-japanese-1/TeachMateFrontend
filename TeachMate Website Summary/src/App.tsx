import React, { useState } from 'react';
import { Teacher, Notification } from './types';
import { mockTeachers, mockGroups, mockFriendRequests, mockReports, mockSessions, mockAppointments, mockNotifications } from './data/mockData';
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
import 'antd/dist/reset.css';

type ViewType = 'home' | 'chat' | 'contacts' | 'all-teachers' | 'all-groups' | 'notifications' | 'admin';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [language, setLanguage] = useState<Language>('ja');
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [selectedProfile, setSelectedProfile] = useState<Teacher | null>(null);
  const [chatTeacher, setChatTeacher] = useState<Teacher | null>(null);
  const [chatGroup, setChatGroup] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [friends, setFriends] = useState<Teacher[]>([mockTeachers[0], mockTeachers[2]]);
  const [friendRequests, setFriendRequests] = useState(mockFriendRequests);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ja' ? 'vi' : 'ja');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setIsAuthenticated(true);
    setActiveView('admin');
    toast.success('Admin login successful');
  };

  const handleLogin = (userData: { name: string; email: string; nationality: 'Japanese' | 'Vietnamese' }) => {
    const newUser: Teacher = {
      id: 'current-user',
      name: userData.name,
      nationality: userData.nationality,
      avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?w=400',
      specialties: ['General Education'],
      experience: 5,
      interests: ['Teaching Methods', 'Cultural Exchange'],
      bio: 'Passionate educator looking to connect with teachers worldwide.',
      subjects: ['Various']
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setActiveView('home');
    setChatTeacher(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
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

  const handleSendFriendRequest = (teacher: Teacher) => {
    toast.success(
      language === 'ja'
        ? `${teacher.name}さんに友達リクエストを送信しました`
        : `Đã gửi lời mời kết bạn đến ${teacher.name}`
    );
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
          unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
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
            onSelectChat={handleSelectChat}
            onSelectGroup={handleSelectGroup}
            onAddFriend={handleAddFriend}
            onCreateGroup={handleCreateGroup}
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
                teachers={mockTeachers}
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
                teachers={mockTeachers}
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
              <NotificationsPage
                notifications={notifications}
                teachers={mockTeachers}
                language={language}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
                onBack={() => setActiveView('home')}
              />
            )}

            {activeView === 'chat' && chatTeacher && (
              <ChatInterface
                currentTeacher={currentUser!}
                selectedTeacher={chatTeacher}
                onBack={() => setChatTeacher(null)}
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
                onBack={() => setChatGroup(null)}
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
        teachers={mockTeachers}
        currentUserId={currentUser?.id || ''}
        onSendFriendRequest={handleSendFriendRequest}
        language={language}
      />

      <CreateGroupModal
        open={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        teachers={mockTeachers}
        onCreateGroup={(name, memberIds) => {
          toast.success(language === 'ja' ? `${name}を作成しました` : `Đã tạo nhóm ${name}`);
        }}
        language={language}
      />

      <Toaster />
    </>
  );
}
