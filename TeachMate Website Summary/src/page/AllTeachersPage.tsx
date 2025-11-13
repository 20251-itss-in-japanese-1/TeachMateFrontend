import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { AllTeachers } from '../components/AllTeachers';
import { Teacher } from '../types';
import { toast } from 'sonner';
import { sendFriendRequest } from '../apis/friend.api';
import { mapFriendListData, mapFriendRequestData } from '../utils/mappers';

export const AllTeachersPage: React.FC = () => {
  const { language, refetchFriendList, refetchFriendRequests, setFriends } = useAppContext();
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
            // ignore
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
      toast.error(
        language === 'ja'
          ? `エラー: ${error.response?.data?.message || error.message}`
          : `Lỗi: ${error.response?.data?.message || error.message}`
      );
    }
  };

  const handleViewTeacherProfile = (teacher: Teacher) => {
    navigate(`/profile/${teacher.id}`, { state: { teacher } });
  };

  return (
    <AllTeachers
      language={language}
      onSendFriendRequest={handleSendFriendRequest}
      onViewTeacherProfile={handleViewTeacherProfile}
      onBack={() => navigate('/')}
    />
  );
};
