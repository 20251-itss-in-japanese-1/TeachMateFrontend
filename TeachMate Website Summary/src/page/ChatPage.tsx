import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { ChatInterface } from '../components/ChatInterface';
import { GroupChatInterface } from '../components/GroupChatInterface';
import { Teacher } from '../types';
import { useChat } from '../hooks/useChat';
import { toast } from 'sonner';
import { sendFriendRequest } from '../apis/friend.api';
import { mapFriendListData } from '../utils/mappers';

export const ChatPage: React.FC = () => {
  const { threadId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentUser, 
    language, 
    friends, 
    threads, 
    selectedThreadId, 
    setSelectedThreadId,
    refetchThreads,
    refetchFriendList,
    setFriends
  } = useAppContext();

  const [chatTeacher, setChatTeacher] = useState<Teacher | null>(null);
  const [chatGroup, setChatGroup] = useState<any>(null);

  // Use chat hook for caching messages
  const { data: threadDetailData, isLoading: isLoadingThreadDetail, refetch: refetchThreadDetail } = useChat(selectedThreadId);

  // Refetch messages periodically
  useEffect(() => {
    if (!selectedThreadId) return;
    
    const interval = setInterval(() => {
      refetchThreadDetail();
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedThreadId, refetchThreadDetail]);

  // Handle thread selection from URL or location state
  useEffect(() => {
    if (threadId) {
      setSelectedThreadId(threadId);
      const thread = threads.find(t => t.id === threadId);
      
      if (thread) {
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
      }
    } else if (location.state?.teacher) {
      // Direct chat with teacher
      setChatTeacher(location.state.teacher);
      setChatGroup(null);
    } else if (location.state?.group) {
      // Direct chat with group
      setChatGroup(location.state.group);
      setChatTeacher(null);
    }
  }, [threadId, location.state, threads, setSelectedThreadId]);

  const handleBack = () => {
    setChatTeacher(null);
    setChatGroup(null);
    setSelectedThreadId(null);
    navigate('/chat');
  };

  const handleViewProfile = (teacher: Teacher) => {
    navigate(`/profile/${teacher.id}`, { state: { teacher } });
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

        // Polling logic
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

  const handleThreadCreated = (threadId: string) => {
    setSelectedThreadId(threadId);
    refetchThreads();
  };

  if (!currentUser) {
    return null;
  }

  // Show empty state if no chat is selected
  if (!chatTeacher && !chatGroup) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <p className="text-lg">{language === 'ja' ? '会話が選択されていません' : 'Không có cuộc trò chuyện nào'}</p>
          <p className="text-sm mt-2">{language === 'ja' ? '左側のリストから友達またはグループを選択してください' : 'Chọn một người bạn hoặc nhóm từ danh sách bên trái'}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {chatTeacher && (
        <ChatInterface
          currentTeacher={currentUser}
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
          onBack={handleBack}
          onViewProfile={handleViewProfile}
          isFriend={friends.some(friend => friend.id === chatTeacher.id)}
          onSendFriendRequest={handleSendFriendRequest}
          language={language}
          onThreadCreated={handleThreadCreated}
        />
      )}

      {chatGroup && (
        <GroupChatInterface
          currentUser={currentUser}
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
          onBack={handleBack}
          onRefreshThread={refetchThreadDetail}
          language={language}
        />
      )}
    </>
  );
};
