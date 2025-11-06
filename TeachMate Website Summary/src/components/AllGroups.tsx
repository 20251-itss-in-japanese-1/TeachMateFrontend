import React, { useState, useMemo } from 'react';
import { translations, Language } from '../translations';
import { Card } from './ui/card';
import { Button as AntButton } from 'antd';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Users, Search, X, ArrowLeft } from 'lucide-react';

interface AllGroupsProps {
  groups: Array<{ id: string; name: string; memberCount: number; avatar: string; description: string }>;
  language: Language;
  onJoinGroup: (groupId: string) => void;
  onBack: () => void;
}

export function AllGroups({
  groups,
  language,
  onJoinGroup,
  onBack
}: AllGroupsProps) {
  const t = translations[language];

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    return groups.filter(group =>
      searchQuery === '' ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  // Paginated groups
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroups, currentPage]);

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <AntButton
            type="default"
            onClick={onBack}
            className="!flex items-center gap-2 !border-blue-200 hover:!border-blue-300"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </AntButton>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {language === 'ja' ? 'すべてのグループ' : 'Tất cả nhóm'}
          </h1>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md border-2 border-blue-100 p-6">
          {/* Search Bar */}
          <div className="relative mb-2">
            <Input
              placeholder={language === 'ja' ? 'グループ名、説明で検索...' : 'Tìm kiếm tên nhóm, mô tả...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-12 py-3 text-base border-2 border-gray-200 focus:border-blue-400 rounded-lg"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-600">
              {language === 'ja'
                ? `${filteredGroups.length} 件のグループ`
                : `${filteredGroups.length} nhóm`}
            </span>
            {searchQuery && (
              <AntButton
                type="text"
                onClick={() => setSearchQuery('')}
                className="!flex items-center gap-2 !text-gray-500 hover:!text-blue-600"
              >
                <X className="w-4 h-4" />
                {language === 'ja' ? 'クリア' : 'Xóa'}
              </AntButton>
            )}
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'ja' ? 'グループが見つかりません' : 'Không tìm thấy nhóm nào'}
            </h3>
            <p className="text-gray-500 mb-4">
              {language === 'ja'
                ? '検索条件を変更して再試行してください'
                : 'Hãy thử thay đổi từ khóa tìm kiếm'}
            </p>
            <AntButton
              type="default"
              onClick={() => setSearchQuery('')}
              className="!border-blue-200 hover:!border-blue-300"
            >
              {language === 'ja' ? 'クリア' : 'Xóa tìm kiếm'}
            </AntButton>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedGroups.map((group) => (
                <Card
                  key={group.id}
                  className="p-6 border-2 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate mb-2 font-semibold">{group.name}</h3>
                      <Badge variant="secondary">
                        {group.memberCount} {language === 'ja' ? 'メンバー' : 'thành viên'}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {group.description}
                  </p>

                  <AntButton
                    type="primary"
                    onClick={() => onJoinGroup(group.id)}
                    className="w-full !flex items-center justify-center gap-2 !bg-blue-600 hover:!bg-blue-700"
                  >
                    <Users className="w-4 h-4" />
                    {t.joinGroup}
                  </AntButton>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2 items-center">
                  <AntButton
                    type="default"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="!border-blue-200 hover:!border-blue-300"
                  >
                    {language === 'ja' ? '前へ' : 'Trước'}
                  </AntButton>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <AntButton
                          key={i}
                          type={currentPage === pageNum ? 'primary' : 'default'}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 ${currentPage === pageNum ? '!bg-blue-600 hover:!bg-blue-700' : '!border-blue-200 hover:!border-blue-300'}`}
                        >
                          {pageNum}
                        </AntButton>
                      );
                    })}
                  </div>
                  <AntButton
                    type="default"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="!border-blue-200 hover:!border-blue-300"
                  >
                    {language === 'ja' ? '次へ' : 'Sau'}
                  </AntButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

