import React, { useState } from 'react';
import { Search, MoreVertical, Bell, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface User {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'banned';
  joinDate: string;
  lastActive: string;
  reports: number;
}

interface UserManagementProps {
  users: User[];
  onUpdateUserStatus: (userId: string, status: 'active' | 'inactive' | 'banned') => void;
  onViewReports: (userId: string) => void;
}

type ReportItem = {
  id: string;
  userId: string;
  reason: string;
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
};

const MOCK_USER_REPORTS: Record<string, ReportItem[]> = {
  '1': [
    { id: 'r1', userId: '1', reason: 'Spam', description: 'User is sending spam messages', reportedBy: 'reporter_a', reportedAt: '2025-10-20', status: 'pending' },
    { id: 'r2', userId: '1', reason: 'Harassment', description: 'Inappropriate language in group chat', reportedBy: 'reporter_b', reportedAt: '2025-10-19', status: 'pending' },
  ],
  '3': [
    { id: 'r3', userId: '3', reason: 'Promotional Spam', description: 'Posting ads repeatedly', reportedBy: 'reporter_c', reportedAt: '2025-10-17', status: 'pending' },
    { id: 'r4', userId: '3', reason: 'Abuse', description: 'Abusive language to others', reportedBy: 'reporter_d', reportedAt: '2025-10-16', status: 'pending' },
    { id: 'r5', userId: '3', reason: 'Misinformation', description: 'Sharing false teaching tips', reportedBy: 'reporter_e', reportedAt: '2025-10-15', status: 'pending' },
    { id: 'r6', userId: '3', reason: 'Spam', description: 'Repeated promotional links', reportedBy: 'reporter_f', reportedAt: '2025-10-14', status: 'pending' },
    { id: 'r7', userId: '3', reason: 'Harassment', description: 'Targeted harassment', reportedBy: 'reporter_g', reportedAt: '2025-10-13', status: 'pending' },
  ],
  '4': [
    { id: 'r8', userId: '4', reason: 'Off-topic', description: 'Posting unrelated content', reportedBy: 'reporter_h', reportedAt: '2025-10-18', status: 'pending' }
  ],
  '6': [
    { id: 'r9', userId: '6', reason: 'Spam', description: 'Posting promotional content', reportedBy: 'reporter_i', reportedAt: '2025-10-17', status: 'pending' },
    { id: 'r10', userId: '6', reason: 'Inappropriate', description: 'Inappropriate content shared', reportedBy: 'reporter_j', reportedAt: '2025-10-16', status: 'pending' },
    { id: 'r11', userId: '6', reason: 'Harassment', description: 'Harassing other members', reportedBy: 'reporter_k', reportedAt: '2025-10-15', status: 'pending' },
  ],
};

export function UserManagement({ users, onUpdateUserStatus, onViewReports }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReports, setSelectedReports] = useState<ReportItem[]>([]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesReport = reportFilter === 'all' || 
                         (reportFilter === 'reported' && user.reports > 0) ||
                         (reportFilter === 'clean' && user.reports === 0);
    return matchesSearch && matchesStatus && matchesReport;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'inactive': return 'bg-slate-100 text-slate-700';
      case 'banned': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewReports = (user: User) => {
    setSelectedUser(user);
    setSelectedReports(MOCK_USER_REPORTS[user.id] || []);
    setReportModalOpen(true);
    onViewReports && onViewReports(user.id);
  };

  const updateReportStatus = (reportId: string, status: ReportItem['status']) => {
    setSelectedReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    toast.success(`Report ${reportId} marked ${status}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* Search & Filters card */}
      <div className="bg-white rounded-lg border p-6">
        <div className="mb-6">
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-md border-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-1/2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-48 border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/2 flex justify-end">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block text-right">Reports</label>
              <Select value={reportFilter} onValueChange={setReportFilter}>
                <SelectTrigger className="h-10 w-48 border-gray-200">
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="reported">With Reports</SelectItem>
                  <SelectItem value="clean">No Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Username</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Last Active</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Reports</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{user.lastActive}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {user.reports > 0 ? (
                      <button
                        onClick={() => handleViewReports(user)}
                        className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2.5 py-1 text-sm font-medium hover:bg-red-200 transition-colors"
                        aria-label={`View ${user.reports} reports`}
                      >
                        <Bell className="h-4 w-4" />
                        {user.reports}
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48 z-50">
                        {user.status === 'active' && (
                          <DropdownMenuItem onClick={() => onUpdateUserStatus(user.id, 'inactive')}>Deactivate</DropdownMenuItem>
                        )}

                        {user.status === 'inactive' && (
                          <DropdownMenuItem onClick={() => onUpdateUserStatus(user.id, 'active')}>Activate User</DropdownMenuItem>
                        )}

                        {user.status !== 'banned' && (
                          <DropdownMenuItem onClick={() => onUpdateUserStatus(user.id, 'banned')} className="text-red-600">Ban User</DropdownMenuItem>
                        )}

                        {user.status === 'banned' && (
                          <DropdownMenuItem onClick={() => onUpdateUserStatus(user.id, 'active')}>Unban User</DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => handleViewReports(user)} className="border-t pt-2">
                          <AlertCircle className="h-4 w-4 mr-2 text-gray-500" />
                          View Reports
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">No users found matching your criteria</div>
        )}
      </div>

      {/* Reports Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Reports</DialogTitle>
            <DialogDescription>Reports for {selectedUser?.username}</DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {selectedReports.length === 0 ? (
              <p className="text-sm text-gray-600">No reports found for this user.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-600">Reason</th>
                      <th className="px-4 py-2 text-left text-gray-600">Reported By</th>
                      <th className="px-4 py-2 text-left text-gray-600">Date</th>
                      <th className="px-4 py-2 text-left text-gray-600">Status</th>
                      <th className="px-4 py-2 text-left text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedReports.map(report => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium">{report.reason}</div>
                          <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                        </td>
                        <td className="px-4 py-3 align-top text-gray-700">{report.reportedBy}</td>
                        <td className="px-4 py-3 align-top text-gray-700">{report.reportedAt}</td>
                        <td className="px-4 py-3 align-top">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                            report.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top space-x-2">
                          {report.status !== 'resolved' && (
                            <Button variant="ghost" size="sm" onClick={() => updateReportStatus(report.id, 'resolved')}>
                              Resolve
                            </Button>
                          )}
                          {report.status !== 'dismissed' && (
                            <Button variant="ghost" size="sm" onClick={() => updateReportStatus(report.id, 'dismissed')}>
                              Dismiss
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
