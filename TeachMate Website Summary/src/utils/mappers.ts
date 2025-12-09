import { Teacher } from '../types';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?w=400';

/**
 * Map user data from API to Teacher interface
 */
export function mapUserToTeacher(user: any): Teacher {
  return {
    id: user._id,
    name: user.name,
    nationality: user.nationality,
    avatar: user.avatarUrl || DEFAULT_AVATAR,
    specialties: user.specialties_major || [],
    experience: user.yearsExperience || user.experience || 0,
    interests: user.specialties_interest || [],
    bio: user.introduction || user.bio || '',
    subjects: user.specialties_subject || []
  };
}


export function getAvatarUrl(avatarUrl?: string): string {
  return avatarUrl || DEFAULT_AVATAR;
}


export function mapFriendListData(friends: any[]): Teacher[] {
  return friends.map(friend => mapUserToTeacher(friend));
}

export function mapFriendRequestData(requests: any[]): Array<{
  id: string;
  fromUser: Teacher;
  status: string;
  createdAt: string;
}> {
  return requests.map(request => ({
    id: request._id,
    fromUser: mapUserToTeacher(request.fromUserId),
    status: request.status,
    createdAt: request.createdAt
  }));
}

/**
 * Map thread data from API
 */
export function mapThreadData(threads: any[], currentUserId?: string) {
  return threads.map(thread => {
    const createdById = thread.createdBy?._id;
    const threadData: any = {
      id: thread._id,
      type: thread.type,
      name: thread.name,
      avatar: thread.avatar,
      createdById,
      members: thread.members,
      unreadCount: thread.unreadCount || 0,
      isLastMessageRead: thread.isLastMessageRead || false,
      lastMessage: thread.lastMessage ? {
        id: thread.lastMessage._id,
        senderId: thread.lastMessage.senderId._id,
        senderName: thread.lastMessage.senderId.name,
        content: thread.lastMessage.content,
        contentType: thread.lastMessage.contentType
      } : undefined
    };

    // For direct conversations, find the other user's info
    if (thread.type === 'direct_friend' || thread.type === 'direct_stranger') {
      const otherMember = thread.members.find(
        (member: any) => member.userId._id !== currentUserId
      );
      
      if (otherMember) {
        const otherUserAvatar = getAvatarUrl(otherMember.userId.avatarUrl);
        
        threadData.otherUser = {
          id: otherMember.userId._id,
          name: otherMember.userId.name,
          nationality: 'Japanese', // Default
          avatar: otherUserAvatar,
          specialties: [],
          experience: 0,
          interests: [],
          bio: '',
          subjects: []
        };
        
        // Set avatar and name for direct conversations
        threadData.avatar = otherUserAvatar;
        threadData.name = otherMember.userId.name;
      }
    }

    return threadData;
  });
}
