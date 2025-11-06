import React, { useState, useMemo } from 'react';
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
  Pagination
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CloseOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { TeacherCard } from './TeacherCard';

const { Text } = Typography;

interface AllTeachersProps {
  teachers: Teacher[];
  language: Language;
  onSendFriendRequest: (teacher: Teacher) => void;
  onViewTeacherProfile: (teacher: Teacher) => void;
  onBack: () => void;
}

export function AllTeachers({
  teachers,
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
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get all unique specialties for filter
  const allSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    teachers.forEach(teacher => {
      teacher.specialties.forEach(specialty => specialties.add(specialty));
    });
    return Array.from(specialties).sort();
  }, [teachers]);

  // Filter teachers based on search and filters
  const filteredTeachers = useMemo(() => {
    return teachers.filter(teacher => {
      // Search query filter
      const matchesSearch = searchQuery === '' ||
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Specialty filter
      const matchesSpecialty = selectedSpecialty === 'all' ||
        teacher.specialties.includes(selectedSpecialty);

      // Nationality filter
      const matchesNationality = selectedNationality === 'all' ||
        teacher.nationality === selectedNationality;

      // Experience range filter
      const matchesExperience = teacher.experience >= experienceRange[0] &&
        teacher.experience <= experienceRange[1];

      return matchesSearch && matchesSpecialty && matchesNationality && matchesExperience;
    });
  }, [teachers, searchQuery, selectedSpecialty, selectedNationality, experienceRange]);

  // Paginated teachers
  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, currentPage]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('all');
    setSelectedNationality('all');
    setExperienceRange([0, 20]);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <Space size="middle">
          <AntButton
            type="default"
            onClick={onBack}
            icon={<ArrowLeftOutlined />}
          >
            {t.back}
          </AntButton>
          <Text className="text-3xl font-bold text-blue-600">
            {language === 'ja' ? 'すべての教師' : 'Tất cả giáo viên'}
          </Text>
        </Space>

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
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              </div>
              <Text className="text-lg font-medium block mb-2">
                {t.noTeachersFound}
              </Text>
              <Text type="secondary" className="block mb-4">
                {language === 'ja'
                  ? '検索条件を変更して再試行してください'
                  : 'Hãy thử thay đổi bộ lọc tìm kiếm'}
              </Text>
              <AntButton type="primary" onClick={clearFilters}>
                {t.clearFilters}
              </AntButton>
            </div>
          ) : (
            <Space direction="vertical" size="large" className="w-full">
              {/* Teachers Grid */}
              <Row gutter={[16, 16]}>
                {paginatedTeachers.map((teacher) => (
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
              {totalPages > 1 && (
                <>
                  <Divider className="my-4" />
                  <div className="flex justify-center">
                    <Pagination
                      current={currentPage}
                      total={filteredTeachers.length}
                      pageSize={itemsPerPage}
                      onChange={setCurrentPage}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total) =>
                        language === 'ja'
                          ? `合計 ${total} 件`
                          : `Tổng ${total} kết quả`
                      }
                    />
                  </div>
                </>
              )}
            </Space>
          )}
        </div>
      </div>
    </div>
  );
}


