import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Homepage } from '../components/Homepage';
import { mockSessions } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { Appointment, Teacher } from '../types';
import { toast } from 'sonner';
import { sendFriendRequest } from '../apis/friend.api';
import { joinThreadGroup } from '../apis/thread.api';
import { mapFriendListData, mapFriendRequestData } from '../utils/mappers';
import { Schedule } from '../types/schedule.type';
import { useUserSchedules } from '../hooks/useUserSchedules';
import { useThreadGroups } from '../hooks/useThreadGroups';

const mapThreadGroupToDisplay = (group: any) => ({
  id: group._id || group.id || '',
  name: group.name || 'Group',
  memberCount: Array.isArray(group.members) ? group.members.length : 0,
  avatar: group.avatar || '',
  description: group.lastMessage?.content || '',
});

const mapScheduleToAppointment = (schedule: Schedule): Appointment => {
  const parseDateTime = () => {
    if (schedule.startAt) {
      return new Date(schedule.startAt);
    }
    if (schedule.date && schedule.time) {
      const [day, month, year] = schedule.date.split('/').map(Number);
      const [hour, minute] = schedule.time.split(':').map(Number);
      return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0);
    }
    return new Date();
  };

  const start = parseDateTime();
  const status: Appointment['status'] = schedule.status === 'completed'
    ? 'completed'
    : schedule.status === 'cancelled'
      ? 'cancelled'
      : 'upcoming';

  return {
    id: schedule._id,
    teacher1Id: schedule.userId || '',
    teacher2Id: schedule.threadId || '',
    title: schedule.title,
    date: start,
    time: schedule.time || start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: schedule.description || '',
    status,
    createdAt: schedule.createdAt ? new Date(schedule.createdAt) : new Date(),
  };
};

export const HomePage: React.FC = () => {
  const { currentUser, language, refetchFriendList, refetchFriendRequests, setFriends } = useAppContext();
  const navigate = useNavigate();
  const {
    data: scheduleData,
    isLoading: isLoadingSchedules,
  } = useUserSchedules({ upcoming: true }, !!currentUser);

  const {
    data: groupData,
    isLoading: isLoadingGroups,
    refetch: refetchGroups,
  } = useThreadGroups(!!currentUser);

  const appointments: Appointment[] = useMemo(() => {
    if (scheduleData?.success && Array.isArray(scheduleData.data)) {
      return scheduleData.data.map(mapScheduleToAppointment);
    }
    return [];
  }, [scheduleData]);

  const groups = useMemo(() => {
    if (groupData?.success && Array.isArray(groupData.data)) {
      return groupData.data.slice(0, 10).map(mapThreadGroupToDisplay);
    }
    return [];
  }, [groupData]);

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

  const handleJoinGroup = async (groupId: string) => {
    try {
      const res = await joinThreadGroup(groupId);
      if (res.success) {
        await refetchGroups();
        const group = groups.find(g => g.id === groupId);
        toast.success(
          language === 'ja'
            ? `${group?.name || 'グループ'}に参加しました`
            : `Đã tham gia ${group?.name || 'nhóm'}`
        );
        navigate(`/chat/${res.data}`);
      } else {
        toast.error(res.message || (language === 'ja' ? '参加に失敗しました' : 'Tham gia thất bại'));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      toast.error(
        language === 'ja'
          ? `エラー: ${message}`
          : `Lỗi: ${message}`
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
      groups={groups}
      exchangeSessions={mockSessions}
      appointments={appointments}
      onSendFriendRequest={handleSendFriendRequest}
      onViewTeacherProfile={handleViewTeacherProfile}
      onJoinGroup={handleJoinGroup}
      onViewAllTeachers={() => navigate('/teachers')}
      onViewAllGroups={() => navigate('/groups')}
    />
  );
};
