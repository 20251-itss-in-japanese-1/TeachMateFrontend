import React, { useState } from 'react';
import { Search, UserPlus, Users, Hash } from 'lucide-react';
import { Button as AntButton } from 'antd';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { translations, Language } from '../translations';
import { Teacher } from '../types';

// Generate random avatar colors
const getAvatarColor = (id: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
  ];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

interface SecondarySidebarProps {
  view: 'chat' | 'contacts';
  language: Language;
  friends: Teacher[];
  groups: Array<{ id: string; name: string; memberCount: number; avatar: string }>;
  friendRequests: Array<{ id: string; teacher: Teacher }>;
  onSelectChat: (teacher: Teacher) => void;
  onSelectGroup: (group: { id: string; name: string; memberCount: number; avatar: string }) => void;
  onAddFriend: () => void;
  onCreateGroup: () => void;
}

export function SecondarySidebar({
  view,
  language,
  friends,
  groups,
  friendRequests,
  onSelectChat,
  onSelectGroup,
  onAddFriend,
  onCreateGroup
}: SecondarySidebarProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'categorized' | 'read'>('all');

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (view === 'chat') {
    return (
      <div className="w-96 bg-gradient-to-b from-blue-50 to-white border-r-2 border-blue-100 flex flex-col shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b-2 border-blue-100 bg-white/80 backdrop-blur-sm">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchTeachers}
                className="pl-9 border-blue-200 focus:border-blue-400 focus:ring-blue-200"
              />
            </div>
            <AntButton
              onClick={onAddFriend}
              type="default"
              shape="circle"
              title={t.addFriend}
              className="!flex items-center justify-center w-9 h-9 !border-blue-300 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-400"
            >
              <UserPlus className="w-4 h-4" />
            </AntButton>
            <AntButton
              onClick={onCreateGroup}
              type="default"
              shape="circle"
              title={t.createGroupChat}
              className="!flex items-center justify-center w-9 h-9 !border-blue-300 !text-blue-600 hover:!bg-blue-50 hover:!border-blue-400"
            >
              <Users className="w-4 h-4" />
            </AntButton>
          </div>
        </div>

        {/* Message Filters */}
        <div className="px-4 py-3 border-b-2 border-blue-100 bg-white/60">
          <div className="flex gap-2">
            <AntButton
              type={messageFilter === 'all' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setMessageFilter('all')}
              className={`flex-1 ${messageFilter === 'all' ? '!bg-blue-600 hover:!bg-blue-700' : '!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300'}`}
            >
              {t.allMessages}
            </AntButton>
            <AntButton
              type={messageFilter === 'read' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setMessageFilter('read')}
              className={`flex-1 ${messageFilter === 'read' ? '!bg-blue-600 hover:!bg-blue-700' : '!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300'}`}
            >
              {t.markedAsRead}
            </AntButton>
            <AntButton
              type={messageFilter === 'unread' ? 'primary' : 'default'}
              size="middle"
              onClick={() => setMessageFilter('unread')}
              className={`flex-1 ${messageFilter === 'unread' ? '!bg-blue-600 hover:!bg-blue-700' : '!text-blue-600 !border-blue-200 hover:!bg-blue-50 hover:!border-blue-300'}`}
            >
              {t.unreadMessages}
            </AntButton>
          </div>
        </div>

        {/* Friends & Groups List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t.noFriends}</p>
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onSelectChat(friend)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all border border-transparent hover:border-blue-200"
                >
                  <Avatar className="w-10 h-10 border-2 border-blue-100 flex-shrink-0">
                    {friend.avatar ? (
                      <AvatarImage src={friend.avatar} alt={friend.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className={`${getAvatarColor(friend.id)} text-white font-semibold`}>
                      {friend.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{friend.name}</p>
                    <p className="text-sm text-blue-600 truncate">
                      {friend.specialties[0]}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm flex-shrink-0" />
                </button>
              ))
            )}

            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 hover:shadow-sm transition-all border border-transparent hover:border-blue-200"
              >
                <Avatar className="w-10 h-10 border-2 border-blue-100 flex-shrink-0">
                  {group.avatar ? (
                    <AvatarImage src={group.avatar} alt={group.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600">
                      <Hash className="w-5 h-5 text-white" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{group.name}</p>
                  <p className="text-sm text-blue-600">
                    {group.memberCount} members
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Contacts View
  return (
    <div className="w-96 bg-gradient-to-b from-green-50 to-white border-r-2 border-green-100 flex flex-col h-full shadow-sm">
      {/* Search Bar and Action Buttons */}
      <div className="p-4 border-b-2 border-green-100 flex-shrink-0 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchFriends}
              className="pl-9 border-green-200 focus:border-green-400 focus:ring-green-200"
            />
          </div>
          <AntButton
            onClick={onAddFriend}
            type="default"
            shape="circle"
            title={t.addFriend}
            className="!flex items-center justify-center w-9 h-9 !border-green-300 !text-green-600 hover:!bg-green-50 hover:!border-green-400"
          >
            <UserPlus className="w-4 h-4" />
          </AntButton>
          <AntButton
            onClick={onCreateGroup}
            type="default"
            shape="circle"
            title={t.createGroupChat}
            className="!flex items-center justify-center w-9 h-9 !border-green-300 !text-green-600 hover:!bg-green-50 hover:!border-green-400"
          >
            <Users className="w-4 h-4" />
          </AntButton>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4 overflow-hidden">
        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-gray-600">{t.friendRequests}</h3>
              <Badge variant="secondary">{friendRequests.length}</Badge>
            </div>
            <div className="space-y-2">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-green-50/70 border border-green-200 hover:border-green-300 transition-all"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0 border border-green-200">
                    {request.teacher.avatar ? (
                      <AvatarImage src={request.teacher.avatar} alt={request.teacher.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className={`${getAvatarColor(request.teacher.id)} text-white font-semibold text-xs`}>
                      {request.teacher.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{request.teacher.name}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <AntButton
                      type="primary"
                      size="small"
                      className="flex items-center justify-center min-w-[28px] !h-7 !bg-green-600 !text-white hover:!bg-green-700"
                    >
                      ✓
                    </AntButton>
                    <AntButton
                      size="small"
                      className="flex items-center justify-center min-w-[28px] !h-7 border-green-300 text-green-700 hover:!bg-green-50 hover:border-green-400"
                    >
                      ✕
                    </AntButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friend List */}
        <div className="px-4 mb-4">
          <h3 className="text-sm text-gray-600 mb-2">{t.friendList}</h3>
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{t.noFriends}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onSelectChat(friend)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 hover:shadow-sm transition-all border border-transparent hover:border-green-200"
                >
                  <Avatar className="w-10 h-10 border-2 border-green-100 flex-shrink-0">
                    {friend.avatar ? (
                      <AvatarImage src={friend.avatar} alt={friend.name} className="object-cover" />
                    ) : null}
                    <AvatarFallback className={`${getAvatarColor(friend.id)} text-white font-semibold`}>
                      {friend.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{friend.name}</p>
                    <p className="text-sm text-green-600 truncate">
                      {friend.specialties[0]}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Groups & Communities */}
        <div className="px-4 mb-4">
          <h3 className="text-sm text-gray-600 mb-2">{t.groupsList}</h3>
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{t.noGroups}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 hover:shadow-sm transition-all border border-transparent hover:border-green-200"
                >
                  <Avatar className="w-10 h-10 border-2 border-green-100 flex-shrink-0">
                    {group.avatar ? (
                      <AvatarImage src={group.avatar} alt={group.name} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600">
                        <Hash className="w-5 h-5 text-white" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{group.name}</p>
                    <p className="text-sm text-green-600">
                      {group.memberCount} members
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
