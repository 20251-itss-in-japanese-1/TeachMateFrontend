import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { AllGroups } from '../components/AllGroups';
import { useThreadGroups } from '../hooks/useThreadGroups';
import { joinThreadGroup } from '../apis/thread.api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export const AllGroupsPage: React.FC = () => {
  const { language, setSelectedThreadId } = useAppContext();
  const navigate = useNavigate();
  const { data: threadGroupsData, isLoading } = useThreadGroups(true);

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
          description: group.description || group.lastMessage?.content || ''
        };
      });
    }
    return [];
  }, [threadGroupsData]);

  const handleJoinGroup = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    try {
      const response = await joinThreadGroup(groupId);
      if (response.success) {
        toast.success(
          language === 'ja'
            ? `${group?.name || 'グループ'}に参加しました`
            : `Đã tham gia ${group?.name || 'nhóm'}`
        );
        setSelectedThreadId(groupId);
        navigate(`/chat/${groupId}`);
      } else {
        toast.error(
          language === 'ja'
            ? 'グループへの参加に失敗しました'
            : 'Không thể tham gia nhóm'
        );
      }
    } catch (error: any) {
      console.error('Failed to join group:', error);
      toast.error(
        language === 'ja'
          ? `エラー: ${error.response?.data?.message || error.message}`
          : `Lỗi: ${error.response?.data?.message || error.message}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-600">
            {language === 'ja' ? '読み込み中...' : 'Đang tải nhóm...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AllGroups
      groups={groups}
      language={language}
      onJoinGroup={handleJoinGroup}
      onBack={() => navigate('/')}
    />
  );
};
