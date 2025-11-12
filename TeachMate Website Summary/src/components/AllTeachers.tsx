import React, { useState, useMemo, useEffect } from 'react';
import { Teacher } from '../types';
import { translations, Language } from '../translations';
import {
  Card,
  Button as AntButton,
  Input as AntInput,
  Select,
  Slider as AntSlider,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Pagination,
  Empty
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CloseOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { TeacherCard } from './TeacherCard';
import { friendSuggest } from '../apis/friend.api';
import { searchTeacher } from '../apis/user.api';
import { mapUserToTeacher } from '../utils/mappers';

const { Text, Title } = Typography;

interface AllTeachersProps {
  language: Language;
  onSendFriendRequest: (teacher: Teacher) => void;
  onViewTeacherProfile: (teacher: Teacher) => void;
  onBack: () => void;
}

export function AllTeachers({
  language,
  onSendFriendRequest,
  onViewTeacherProfile,
  onBack
}: AllTeachersProps) {
  const t = translations[language];

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedNationality, setSelectedNationality] = useState<string>('all');
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 20]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 12;

  // API data states
  const [suggestedTeachers, setSuggestedTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [totalTeachers, setTotalTeachers] = useState(0);

  // Fetch friend suggestions from API
  useEffect(() => {
    const fetchFriendSuggestions = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await friendSuggest(currentPage, itemsPerPage);

        if (response.success) {
          const mappedTeachers = response.data.map(user => mapUserToTeacher(user));
          setSuggestedTeachers(mappedTeachers);
          setTotalTeachers(response.meta.total);
        }
      } catch (error) {
        console.error('Failed to fetch friend suggestions:', error);
        setSuggestedTeachers([]);
        setTotalTeachers(0);
      } finally {
        setIsLoadingTeachers(false);
      }
    };

    fetchFriendSuggestions();
  }, [currentPage, itemsPerPage]);

  // Polling friend suggestions periodically when not searching
  useEffect(() => {
    if (searchQuery.trim()) return; // don't poll while searching

    let active = true;
    const poll = async () => {
      try {
        const response = await friendSuggest(currentPage, itemsPerPage);
        if (active && response.success) {
          const mappedTeachers = response.data.map(user => mapUserToTeacher(user));
          setSuggestedTeachers(mappedTeachers);
          setTotalTeachers(response.meta.total);
        }
      } catch (e) {
        // ignore transient errors in polling
      }
    };

    const interval = setInterval(poll, 10000); // 10s
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [searchQuery, currentPage, itemsPerPage]);

  // Search teachers from API with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      return; // Skip search if query is empty
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await searchTeacher(searchQuery);
        if (response.success) {
          const mappedTeachers = response.data.map(user => mapUserToTeacher(user));
          setSuggestedTeachers(mappedTeachers);
          setTotalTeachers(mappedTeachers.length);
          setCurrentPage(1); // Reset to first page on new search
        }
      } catch (error) {
        console.error('Failed to search teachers:', error);
      } finally {
        setIsLoadingTeachers(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get all unique specialties for filter
  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    suggestedTeachers.forEach(teacher => {
      teacher.specialties.forEach(specialty => specialties.add(specialty));
    });
    return Array.from(specialties).sort();
  }, [suggestedTeachers]);

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    return suggestedTeachers.filter(teacher => {
      const matchesSearch = searchQuery === '' ||
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        teacher.bio.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = selectedSpecialty === 'all' ||
        teacher.specialties.includes(selectedSpecialty);

      const matchesNationality = selectedNationality === 'all' ||
        teacher.nationality === selectedNationality;

      const matchesExperience = teacher.experience >= experienceRange[0] &&
        teacher.experience <= experienceRange[1];

      return matchesSearch && matchesSpecialty && matchesNationality && matchesExperience;
    });
  }, [suggestedTeachers, searchQuery, selectedSpecialty, selectedNationality, experienceRange]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedNationality('all');
    setExperienceRange([0, 20]);
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AntButton
              icon={<ArrowLeftOutlined />}
              onClick={onBack}
              size="large"
            >
              {language === 'ja' ? '戻る' : 'Quay lại'}
            </AntButton>
            <Title level={1} className="mb-0">
              {language === 'ja' ? 'すべての教師' : 'Tất cả giáo viên'}
            </Title>
          </div>
          <Text type="secondary" className="text-lg">
            {isLoadingTeachers
              ? (language === 'ja' ? '読み込み中...' : 'Đang tải...')
              : `${totalTeachers} ${language === 'ja' ? '人の教師' : 'giáo viên'}`
            }
          </Text>
        </div>

        {/* Search and Filter Section */}
        <Card className="shadow-lg" bodyStyle={{ padding: '24px' }}>
          <Space direction="vertical" size="large" className="w-full">
            {/* Search Bar */}
            <AntInput
              size="large"
              placeholder={language === 'ja' ? '教師名、専門分野で検索...' : 'Tìm kiếm tên giáo viên, chuyên môn...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />

            {/* Filter Toggle and Results Count */}
            <Space className="w-full justify-between">
              <AntButton
                onClick={() => setShowFilters(!showFilters)}
                icon={showFilters ? <CloseOutlined /> : <FilterOutlined />}
              >
                {t.filterBySpecialty}
              </AntButton>
              <Space>
                <Text type="secondary">
                  {language === 'ja'
                    ? `${filteredTeachers.length} 件の結果`
                    : `${filteredTeachers.length} kết quả`}
                </Text>
                <AntButton type="link" onClick={clearFilters}>
                  {t.clearFilters}
                </AntButton>
              </Space>
            </Space>

            {/* Filters Panel */}
            {showFilters && (
              <>
                <Divider className="my-2" />
                <div className="bg-blue-50 p-4 rounded-lg">
                  <Row gutter={[16, 16]}>
                    {/* Specialty Filter */}
                    <Col xs={24} md={8}>
                      <Text strong className="block mb-2">{t.filterBySpecialty}</Text>
                      <Select
                        value={selectedSpecialty}
                        onChange={setSelectedSpecialty}
                        className="w-full"
                        size="large"
                        options={[
                          { value: 'all', label: t.allSpecialties },
                          ...allSpecialties.map(specialty => ({ value: specialty, label: specialty }))
                        ]}
                      />
                    </Col>

                    {/* Nationality Filter */}
                    <Col xs={24} md={8}>
                      <Text strong className="block mb-2">{t.filterByNationality}</Text>
                      <Select
                        value={selectedNationality}
                        onChange={setSelectedNationality}
                        className="w-full"
                        size="large"
                        options={[
                          { value: 'all', label: t.allNationalities },
                          { value: 'Japanese', label: t.japanese },
                          { value: 'Vietnamese', label: t.vietnamese }
                        ]}
                      />
                    </Col>

                    {/* Experience Range Filter */}
                    <Col xs={24} md={8}>
                      <Text strong className="block mb-2">{t.filterByExperience}</Text>
                      <AntSlider
                        range
                        value={experienceRange}
                        onChange={(value) => setExperienceRange(value as [number, number])}
                        max={20}
                        min={0}
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{experienceRange[0]} {t.yearsExperience}</span>
                        <span>{experienceRange[1]} {t.yearsExperience}</span>
                      </div>
                    </Col>
                  </Row>
                </div>
              </>
            )}
          </Space>
        </Card>

        <Divider className="my-6" />

        {/* Teachers Grid Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {isLoadingTeachers ? (
            <div className="flex justify-center items-center py-20">
              <Space direction="vertical" align="center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <Text type="secondary">{language === 'ja' ? '読み込み中...' : 'Đang tải...'}</Text>
              </Space>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <Empty
              description={
                <Space direction="vertical">
                  <Text>{language === 'ja' ? '教師が見つかりません' : 'Không tìm thấy giáo viên nào'}</Text>
                  <Text type="secondary" className="block mb-4">
                    {language === 'ja'
                      ? '検索条件を変更して再試行してください'
                      : 'Hãy thử thay đổi bộ lọc tìm kiếm'}
                  </Text>
                  <AntButton onClick={clearFilters}>
                    {language === 'ja' ? 'フィルターをクリア' : 'Xóa bộ lọc'}
                  </AntButton>
                </Space>
              }
            />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {filteredTeachers.map((teacher) => (
                  <Col xs={24} sm={12} lg={8} xl={6} key={teacher.id}>
                    <TeacherCard
                      teacher={teacher}
                      onViewProfile={onViewTeacherProfile}
                      onStartChat={onSendFriendRequest}
                      language={language}
                    />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalTeachers > itemsPerPage && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    current={currentPage}
                    total={totalTeachers}
                    pageSize={itemsPerPage}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showTotal={(total) =>
                      language === 'ja'
                        ? `合計 ${total} 人`
                        : `Tổng cộng ${total} giáo viên`
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


