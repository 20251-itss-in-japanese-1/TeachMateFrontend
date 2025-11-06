import React, { useState } from 'react';
import { Search, MoreVertical, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  created: string;
  status: 'active' | 'inactive' | 'archived';
  reports: number;
}

interface GroupManagementProps {
  groups: Group[];
  onUpdateGroupStatus: (groupId: string, status: 'active' | 'inactive' | 'archived') => void;
  onViewReports: (groupId: string) => void;
}

export function GroupManagement({ groups, onUpdateGroupStatus, onViewReports }: GroupManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
    const matchesReport = reportFilter === 'all' || 
                         (reportFilter === 'reported' && group.reports > 0) ||
                         (reportFilter === 'clean' && group.reports === 0);
    return matchesSearch && matchesStatus && matchesReport;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'inactive': return 'bg-orange-100 text-orange-700';
      case 'archived': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleViewReports = (group: Group) => {
    setSelectedGroup(group);
    setReportModalOpen(true);
    onViewReports && onViewReports(group.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="mb-6">
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search groups by name or description..."
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
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-1/2 flex justify-end">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block text-right">Groups</label>
              <Select value={reportFilter} onValueChange={setReportFilter}>
                <SelectTrigger className="h-10 w-48 border-gray-200">
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="reported">With Reports</SelectItem>
                  <SelectItem value="clean">No Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Group Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Members</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Reports</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.map(group => (
                <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">{group.name}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{group.description}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{group.members}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">{group.created}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(group.status)}`}>
                      {group.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {group.reports > 0 ? (
                      <button onClick={() => handleViewReports(group)} className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2.5 py-1 text-sm font-medium hover:bg-red-200 transition-colors">
                        <AlertCircle className="h-4 w-4" />
                        {group.reports}
                      </button>
                    ) : (
                      <span className="text-gray-400">0</span>
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
                        {group.status !== 'active' && <DropdownMenuItem onClick={() => onUpdateGroupStatus(group.id, 'active')}>Activate Group</DropdownMenuItem>}
                        {group.status !== 'inactive' && <DropdownMenuItem onClick={() => onUpdateGroupStatus(group.id, 'inactive')}>Deactivate Group</DropdownMenuItem>}
                        {group.status !== 'archived' && <DropdownMenuItem onClick={() => onUpdateGroupStatus(group.id, 'archived')} className="text-orange-600">Archive Group</DropdownMenuItem>}
                        <DropdownMenuItem onClick={() => handleViewReports(group)} className="border-t pt-2">
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

        {filteredGroups.length === 0 && (
          <div className="text-center py-12 text-gray-500">No groups found matching your criteria</div>
        )}
      </div>

      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Group Reports</DialogTitle>
            <DialogDescription>Reports for {selectedGroup?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">This group has {selectedGroup?.reports || 0} report(s).</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
