export interface Teacher {
  id: string;
  name: string;
  nationality: 'Japanese' | 'Vietnamese';
  avatar: string;
  specialties: string[];
  experience: number;
  interests: string[];
  bio: string;
  subjects: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'slide';
  slideUrl?: string;
}

export interface ExchangeSession {
  id: string;
  teacher1Id: string;
  teacher2Id: string;
  date: Date;
  topic: string;
  status: 'confirmed' | 'pending' | 'completed';
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
}

export interface Appointment {
  id: string;
  teacher1Id: string;
  teacher2Id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'appointment' | 'group_join' | 'message' | 'system';
  title: string;
  message: string;
  fromUserId?: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}
