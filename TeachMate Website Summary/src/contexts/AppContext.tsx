import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Teacher } from '../types';
import { Language } from '../translations';
import { getUserProfile } from '../apis/user.api';
import { mapUserToTeacher, mapFriendListData, mapFriendRequestData, mapThreadData } from '../utils/mappers';
import { useThreads } from '../hooks/useThreads';
import { useNotifications } from '../hooks/useNoti';
import { useFriendList, useFriendRequests } from '../hooks/useFriend';
import { getTokenFromLocalStorage, removeTokenFromLocalStorage } from '../apis/localtoken';

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

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentUser: Teacher | null;
  isLoading: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsAdmin: (value: boolean) => void;
  setCurrentUser: (user: Teacher | null) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  
  // Friends & Requests
  friends: Teacher[];
  friendRequests: FriendRequest[];
  setFriends: React.Dispatch<React.SetStateAction<Teacher[]>>;
  setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
  refetchFriendList: () => Promise<any>;
  refetchFriendRequests: () => Promise<any>;
  
  // Threads
  threads: Thread[];
  setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
  refetchThreads: () => Promise<any>;
  
  // Notifications
  unreadNotificationsCount: number;
  
  // Chat State
  selectedThreadId: string | null;
  setSelectedThreadId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Teacher | null>(null);
  const [language, setLanguage] = useState<Language>('ja');
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<Teacher[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      console.log('AppContext: Initializing authentication...');
      const token = getTokenFromLocalStorage();
      console.log('AppContext: Token from localStorage:', token ? 'exists' : 'null');
      
      if (token) {
        try {
          console.log('AppContext: Fetching user profile...');
          const response = await getUserProfile();
          console.log('AppContext: getUserProfile response:', response);
          
          if (response.success) {
            const user = mapUserToTeacher(response.data);
            console.log('AppContext: User authenticated:', user.name);
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            console.log('AppContext: getUserProfile failed, removing token');
            removeTokenFromLocalStorage();
          }
        } catch (error) {
          console.error('AppContext: Failed to fetch user profile:', error);
          removeTokenFromLocalStorage();
        }
      } else {
        console.log('AppContext: No token found, user not authenticated');
      }
      
      setIsLoading(false);
      console.log('AppContext: Initialization complete');
    };

    initAuth();
  }, []);

  // React Query friend requests polling & mapping
  const { data: friendRequestsData, refetch: refetchFriendRequests } = useFriendRequests(isAuthenticated && !isAdmin);
  useEffect(() => {
    if (friendRequestsData?.success) {
      setFriendRequests(mapFriendRequestData(friendRequestsData.data));
    }
  }, [friendRequestsData]);

  // React Query friend list polling & mapping
  const { data: friendListData, refetch: refetchFriendList } = useFriendList(isAuthenticated && !isAdmin);
  useEffect(() => {
    if (friendListData?.success) {
      setFriends(mapFriendListData(friendListData.data.friends));
    }
  }, [friendListData]);

  // React Query threads polling & mapping
  const { data: threadsData, refetch: refetchThreads } = useThreads(isAuthenticated && !isAdmin);
  useEffect(() => {
    if (threadsData?.success) {
      setThreads(mapThreadData(threadsData.data, currentUser?.id));
    }
  }, [threadsData, currentUser?.id]);

  // React Query notifications polling & mapping
  const { data: notificationsData } = useNotifications(isAuthenticated && !isAdmin);
  useEffect(() => {
    if (notificationsData?.success) {
      const unread = (notificationsData.data || []).filter((n) => !n.read).length;
      setUnreadNotificationsCount(unread);
    }
  }, [notificationsData]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ja' ? 'vi' : 'ja');
  };

  const value: AppContextType = {
    isAuthenticated,
    isAdmin,
    currentUser,
    isLoading,
    setIsAuthenticated,
    setIsAdmin,
    setCurrentUser,
    language,
    setLanguage,
    toggleLanguage,
    friends,
    friendRequests,
    setFriends,
    setFriendRequests,
    refetchFriendList,
    refetchFriendRequests,
    threads,
    setThreads,
    refetchThreads,
    unreadNotificationsCount,
    selectedThreadId,
    setSelectedThreadId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
