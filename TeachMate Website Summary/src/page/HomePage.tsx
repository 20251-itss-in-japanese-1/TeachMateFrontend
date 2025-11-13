import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Homepage } from '../components/Homepage';
import { mockGroups, mockSessions, mockAppointments } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { Teacher } from '../types';
import { toast } from 'sonner';
import { sendFriendRequest } from '../apis/friend.api';
import { mapFriendListData, mapFriendRequestData } from '../utils/mappers';

export const HomePage: React.FC = () => {
  const { currentUser, language, refetchFriendList, refetchFriendRequests, setFriends } = useAppContext();
  const navigate = useNavigate();

  const handleSendFriendRequest = async (teacher: Teacher) => {
    try {
      const response = await sendFriendRequest(teacher.id);
      
      if (response.success) {
        toast.success(
          language === 'ja'
            ? `${teacher.name}さんに友達リクエストを送信しました`
            : `Đã gửi lời mời kết bạn đến ${teacher.name}`
        );

        // Start short-term polling to reflect state quickly
        let attempts = 0;
        const maxAttempts = 12;
        const poll = async () => {
          attempts++;
          try {
            const friendListResponse = await refetchFriendList();
            if (friendListResponse.data?.success) {
              const mappedFriends = mapFriendListData(friendListResponse.data.data.friends);
              setFriends(mappedFriends);
              if (mappedFriends.some(f => f.id === teacher.id)) {
                toast.success(
                  language === 'ja'
                    ? `${teacher.name}と友達になりました`
                    : `Bạn và ${teacher.name} đã trở thành bạn bè`
                );
                return true;
              }
            }

            const requestsRes = await refetchFriendRequests();
            if (requestsRes.data?.success) {
              const mappedRequests = mapFriendRequestData(requestsRes.data.data);
            }
          } catch (e) {
            // ignore transient errors
          }
          return false;
        };

        const stopNow = await poll();
        if (!stopNow) {
          const interval = setInterval(async () => {
            const done = await poll();
            if (done || attempts >= maxAttempts) {
              clearInterval(interval);
            }
          }, 5000);
        }
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

  const handleViewTeacherProfile = (teacher: Teacher) => {
    navigate(`/profile/${teacher.id}`, { state: { teacher } });
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

  if (!currentUser) {
    return null;
  }

  return (
    <Homepage
      user={currentUser}
      language={language}
      groups={mockGroups}
      exchangeSessions={mockSessions}
      appointments={mockAppointments}
      onSendFriendRequest={handleSendFriendRequest}
      onViewTeacherProfile={handleViewTeacherProfile}
      onJoinGroup={handleJoinGroup}
      onViewAllTeachers={() => navigate('/teachers')}
      onViewAllGroups={() => navigate('/groups')}
    />
  );
};
