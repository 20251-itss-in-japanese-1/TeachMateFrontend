import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button as AntButton } from 'antd';
import { Loader2, MessageCircle, Users as UsersIcon, Search as SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { Teacher } from '../types';
import { getThreadChat } from '../apis/chat.api';
import { useThreadGroups } from '../hooks/useThreadGroups';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const getAvatarColor = (id: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export const ContactsPage: React.FC = () => {
  const {
    language,
    friends,
    setSelectedThreadId,
    refetchThreads,
    refetchFriendList,
    refetchFriendRequests
  } = useAppContext();

  const t = translations[language];
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const activeTab = searchParams.get('tab') === 'groups' ? 'groups' : 'friends';

  useEffect(() => {
    if (!searchParams.get('tab')) {
      const next = new URLSearchParams(searchParams);
      next.set('tab', 'friends');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { data: threadGroupsData, isLoading: isLoadingGroups } = useThreadGroups(true);

  const groups = useMemo(() => {
    if (threadGroupsData?.success && Array.isArray(threadGroupsData.data)) {
      return threadGroupsData.data.map((group: any) => {
        const rawAvatar = group.avatar || group.avatarUrl;
        const avatar = typeof rawAvatar === 'string' && rawAvatar.trim() !== '' ? rawAvatar.trim() : '';
        return {
          id: group._id || group.id || '',
          name: group.name || 'Group',
          memberCount: Array.isArray(group.members) ? group.members.length : 0,
          avatar,
          description: group.lastMessage?.content || ''
        };
      });
    }
    return [] as Array<{ id: string; name: string; memberCount: number; avatar: string; description: string }>;
  }, [threadGroupsData]);

  const filteredFriends = useMemo(() => {
    return friends.filter(friend => {
      const normalizedQuery = searchQuery.toLowerCase();
      return searchQuery === '' ||
        friend.name.toLowerCase().includes(normalizedQuery) ||
        friend.specialties.some(s => s.toLowerCase().includes(normalizedQuery));
    });
  }, [friends, searchQuery]);

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      const normalizedQuery = searchQuery.toLowerCase();
      return searchQuery === '' ||
        group.name.toLowerCase().includes(normalizedQuery) ||
        group.description.toLowerCase().includes(normalizedQuery);
    });
  }, [groups, searchQuery]);

  const setActiveTab = (tab: 'friends' | 'groups') => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
    setSearchQuery('');
  };

  const handleStartChat = async (teacher: Teacher) => {
    try {
      const response = await getThreadChat({ recipientId: teacher.id });

      if (response.success && response.data) {
        const threadId = response.data._id;
        setSelectedThreadId(threadId);
        navigate(`/chat/${threadId}`);

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
      console.error('Failed to start chat from contacts:', error);
      toast.error(
        language === 'ja'
          ? `エラー: ${error.response?.data?.message || error.message}`
          : `Lỗi: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleOpenGroup = (group: { id: string; name: string; memberCount: number; avatar: string; description: string }) => {
    setSelectedThreadId(group.id || null);
    navigate(`/chat/${group.id}`, { state: { group } });
  };

  const friendTabLabel = language === 'ja' ? '友達リスト' : 'Danh sách bạn bè';
  const groupTabLabel = language === 'ja' ? 'グループとコミュニティ' : 'Nhóm và cộng đồng';

  const renderFriends = () => {
    if (filteredFriends.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <MessageCircle className="w-10 h-10 mb-3" />
          <p className="text-lg">{t.noFriends}</p>
          <p className="text-sm">{language === 'ja' ? '新しい友達を追加してみましょう' : 'Hãy kết bạn để bắt đầu trò chuyện'}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="bg-white border-2 border-green-100 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-green-100">
                {friend.avatar ? <AvatarImage src={friend.avatar} alt={friend.name} /> : null}
                <AvatarFallback className={`${getAvatarColor(friend.id)} text-white text-lg font-semibold`}>
                  {friend.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{friend.name}</p>
                <p className="text-sm text-green-700 truncate">{friend.specialties[0] || (language === 'ja' ? '未設定' : 'Chưa cập nhật')}</p>
              </div>
              <AntButton
                type="primary"
                onClick={() => handleStartChat(friend)}
                className="!bg-green-600 hover:!bg-green-700"
              >
                {language === 'ja' ? 'チャット' : 'Nhắn tin'}
              </AntButton>
            </div>
            {friend.bio && (
              <p className="text-sm text-gray-600 line-clamp-2">{friend.bio}</p>
            )}
            {friend.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {friend.specialties.slice(0, 3).map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 border border-green-100"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGroups = () => {
    if (isLoadingGroups) {
      return (
        <div className="h-full flex items-center justify-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-green-600" />
          <span>{language === 'ja' ? '読み込み中...' : 'Đang tải nhóm...'}</span>
        </div>
      );
    }

    if (filteredGroups.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <UsersIcon className="w-10 h-10 mb-3" />
          <p className="text-lg">{t.noGroups}</p>
          <p className="text-sm">{language === 'ja' ? 'グループを作成してみましょう' : 'Tạo hoặc tham gia một nhóm để kết nối'}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white border-2 border-green-100 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{group.name}</p>
                <p className="text-sm text-green-700">
                  {group.memberCount} {language === 'ja' ? 'メンバー' : 'thành viên'}
                </p>
                {group.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.description}</p>
                )}
              </div>
            </div>
            <AntButton
              type="primary"
              onClick={() => handleOpenGroup(group)}
              className="!bg-green-600 hover:!bg-green-700 flex items-center gap-2 justify-center"
            >
              <UsersIcon className="w-4 h-4" />
              {language === 'ja' ? 'グループを開く' : 'Mở nhóm'}
            </AntButton>
          </div>
        ))}
      </div>
    );
  };

  const placeholderText = activeTab === 'friends'
    ? (language === 'ja' ? '友達を検索...' : 'Tìm kiếm bạn bè...')
    : (language === 'ja' ? 'グループを検索...' : 'Tìm kiếm nhóm...');

  const totalLabel = activeTab === 'friends'
    ? `${filteredFriends.length} ${language === 'ja' ? '人の友達' : 'bạn'}`
    : `${filteredGroups.length} ${language === 'ja' ? 'グループ' : 'nhóm'}`;

  return (
    <div className="h-full bg-gradient-to-br from-green-50 to-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-green-100">
        <div>
          <p className="text-xs uppercase tracking-wide text-green-600">{language === 'ja' ? '連絡先' : 'Danh bạ'}</p>
          <h1 className="text-2xl font-semibold text-gray-800">
            {activeTab === 'friends' ? friendTabLabel : groupTabLabel}
          </h1>
        </div>
        <div className="flex gap-2">
          <AntButton
            type={activeTab === 'friends' ? 'primary' : 'default'}
            onClick={() => setActiveTab('friends')}
            className={activeTab === 'friends' ? '!bg-green-600 hover:!bg-green-700' : '!text-green-700 !border-green-200 hover:!bg-green-50'}
          >
            {friendTabLabel}
          </AntButton>
          <AntButton
            type={activeTab === 'groups' ? 'primary' : 'default'}
            onClick={() => setActiveTab('groups')}
            className={activeTab === 'groups' ? '!bg-green-600 hover:!bg-green-700' : '!text-green-700 !border-green-200 hover:!bg-green-50'}
          >
            {groupTabLabel}
          </AntButton>
        </div>
      </div>

      <div className="px-6 py-3 bg-white/70 backdrop-blur border-b border-green-100 flex items-center gap-3">
        <SearchIcon className="w-4 h-4 text-green-500" />
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholderText}
            className="border-green-200 focus:border-green-400 focus:ring-green-200"
          />
        </div>
        <span className="text-sm text-gray-600">{totalLabel}</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'friends' ? renderFriends() : renderGroups()}
      </div>
    </div>
  );
};
