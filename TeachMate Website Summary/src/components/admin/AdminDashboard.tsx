import React, { useState } from 'react';
import { UserManagement } from './UserManagement';
import { GroupManagement } from './GroupManagement';
import { Users, MessageSquare, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastActive: string;
  reports: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  status: 'active' | 'inactive' | 'archived';
  reports: number;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');

  // Mock data for users
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'john_doe',
      email: 'john@example.com',
      status: 'active',
      joinDate: '2024-01-15',
      lastActive: '2024-10-21',
      reports: 2
    },
    {
      id: '2',
      username: 'jane_smith',
      email: 'jane@example.com',
      status: 'active',
      joinDate: '2024-02-20',
      lastActive: '2024-10-20',
      reports: 0
    },
    {
      id: '3',
      username: 'spam_user',
      email: 'spam@example.com',
      status: 'banned',
      joinDate: '2024-03-10',
      lastActive: '2024-10-15',
      reports: 5
    },
    {
      id: '4',
      username: 'alice_wonder',
      email: 'alice@example.com',
      status: 'active',
      joinDate: '2024-04-05',
      lastActive: '2024-10-21',
      reports: 1
    },
    {
      id: '5',
      username: 'bob_builder',
      email: 'bob@example.com',
      status: 'inactive',
      joinDate: '2024-05-12',
      lastActive: '2024-09-01',
      reports: 0
    },
    {
      id: '6',
      username: 'charlie_brown',
      email: 'charlie@example.com',
      status: 'active',
      joinDate: '2024-06-18',
      lastActive: '2024-10-19',
      reports: 3
    }
  ]);

  // Mock data for groups
  const [groups, setGroups] = useState<Group[]>([
    {
      id: '1',
      name: 'General Discussion',
      description: 'General chat for all users',
      members: 45,
      created: '2024-01-10',
      status: 'active',
      reports: 0
    },
    {
      id: '2',
      name: 'Tech Support',
      description: 'Technical support and help',
      members: 28,
      created: '2024-02-15',
      status: 'active',
      reports: 1
    },
    {
      id: '3',
      name: 'Gaming Zone',
      description: 'Gaming discussions and tournaments',
      members: 62,
      created: '2024-03-20',
      status: 'active',
      reports: 2
    },
    {
      id: '4',
      name: 'Spam Group',
      description: 'Inactive spam group',
      members: 5,
      created: '2024-04-01',
      status: 'archived',
      reports: 5
    },
    {
      id: '5',
      name: 'Art & Design',
      description: 'Share and discuss art and design',
      members: 35,
      created: '2024-05-10',
      status: 'active',
      reports: 0
    },
    {
      id: '6',
      name: 'Music Lovers',
      description: 'Music sharing and recommendations',
      members: 52,
      created: '2024-06-05',
      status: 'inactive',
      reports: 1
    }
  ]);

  const handleUpdateUserStatus = (userId: string, status: 'active' | 'inactive' | 'banned') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
    toast.success(`User status updated to ${status}`);
  };

  const handleUpdateGroupStatus = (groupId: string, status: 'active' | 'inactive' | 'archived') => {
    setGroups(groups.map(group => 
      group.id === groupId ? { ...group, status } : group
    ));
    toast.success(`Group status updated to ${status}`);
  };

  const handleViewUserReports = (userId: string) => {
    const user = users.find(u => u.id === userId);
    toast.info(`Viewing reports for ${user?.username}`);
  };

  const handleViewGroupReports = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    toast.info(`Viewing reports for ${group?.name}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">User Management & Reports</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Users</span>
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'groups'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">Groups</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'users' ? (
        <UserManagement
          users={users}
          onUpdateUserStatus={handleUpdateUserStatus}
          onViewReports={handleViewUserReports}
        />
      ) : (
        <GroupManagement
          groups={groups}
          onUpdateGroupStatus={handleUpdateGroupStatus}
          onViewReports={handleViewGroupReports}
        />
      )}
    </div>
  );
}
