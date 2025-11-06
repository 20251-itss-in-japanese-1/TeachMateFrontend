import React, { useState, useMemo } from 'react';
import { Teacher, ExchangeSession, Appointment } from '../types';
import { translations, Language } from '../translations';
import { 
  Card, 
  Button as AntButton, 
  Avatar as AntAvatar, 
  Badge as AntBadge, 
  Input as AntInput,
  Select,
  Slider as AntSlider,
  Space,
  Tag,
  Empty,
  Tooltip,
  Typography,
  Row,
  Col,
  Pagination
} from 'antd';
import { 
  UserAddOutlined, 
  TeamOutlined, 
  RightOutlined, 
  CalendarOutlined, 
  SearchOutlined, 
  FilterOutlined, 
  CloseOutlined,
  ClockCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface HomepageProps {
  user: Teacher;
  language: Language;
  teachers: Teacher[];
  groups: Array<{ id: string; name: string; memberCount: number; avatar: string; description: string }>;
  exchangeSessions: ExchangeSession[];
  appointments: Appointment[];
  onSendFriendRequest: (teacher: Teacher) => void;
  onViewTeacherProfile: (teacher: Teacher) => void;
  onJoinGroup: (groupId: string) => void;
  onViewSession?: (sessionId: string) => void;
  onNavigateHome?: () => void;
  onViewNotifications?: () => void;
  onViewAllTeachers?: () => void;
  onViewAllGroups?: () => void;
}

// Generate avatar colors
const getAvatarColor = (id: string) => {
  const colors = ['#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

export function Homepage({
  user,
  language,
  teachers,
  groups,
  exchangeSessions,
  appointments,
  onSendFriendRequest,
  onViewTeacherProfile,
  onJoinGroup,
  onViewSession,
  onNavigateHome,
  onViewNotifications,
  onViewAllTeachers,
  onViewAllGroups
}: HomepageProps) {
  const t = translations[language];

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedNationality, setSelectedNationality] = useState<string>('all');
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 20]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [teacherPage, setTeacherPage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);
  const itemsPerPage = 6;

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
      const matchesSearch = searchQuery === '' || 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSpecialty = selectedSpecialty === 'all' || 
        teacher.specialties.includes(selectedSpecialty);

      const matchesNationality = selectedNationality === 'all' || 
        teacher.nationality === selectedNationality;

      const matchesExperience = teacher.experience >= experienceRange[0] && 
        teacher.experience <= experienceRange[1];

      return matchesSearch && matchesSpecialty && matchesNationality && matchesExperience;
    });
  }, [teachers, searchQuery, selectedSpecialty, selectedNationality, experienceRange]);

  // Filter groups based on search
  const filteredGroups = useMemo(() => {
    return groups.filter(group => 
      searchQuery === '' || 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  // Paginated teachers
  const paginatedTeachers = useMemo(() => {
    const startIndex = (teacherPage - 1) * itemsPerPage;
    return filteredTeachers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTeachers, teacherPage, itemsPerPage]);

  // Paginated groups
  const paginatedGroups = useMemo(() => {
    const startIndex = (groupPage - 1) * itemsPerPage;
    return filteredGroups.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredGroups, groupPage, itemsPerPage]);

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
        {/* Welcome Section */}
        <div className="text-center py-8">
          <Title level={1} className="mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t.welcomeMessage}
          </Title>
          <Text className="text-xl text-gray-600 block mb-2">{t.welcomeSubtitle}</Text>
          <Title level={2} className="mt-4">
            {language === 'ja' 
              ? `${user.name}さん、こんにちは！` 
              : `Xin chào ${user.name}!`}
          </Title>
        </div>

        {/* Search and Filter Section */}
        <Card className="shadow-md border-2 border-blue-100">
          {/* Search Bar */}
          <AntInput
            size="large"
            placeholder={language === 'ja' ? '教師名、専門分野、グループ名で検索...' : 'Tìm kiếm tên giáo viên, chuyên môn, tên nhóm...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="mb-4"
          />

          {/* Filter Toggle */}
          <Space className="w-full justify-between">
            <AntButton
              onClick={() => setShowFilters(!showFilters)}
              icon={showFilters ? <CloseOutlined /> : <FilterOutlined />}
            >
              {t.filterBySpecialty}
            </AntButton>
            <AntButton type="text" onClick={clearFilters}>
              {t.clearFilters}
            </AntButton>
          </Space>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-blue-100">
              <Row gutter={[16, 16]}>
                {/* Specialty Filter */}
                <Col xs={24} md={8}>
                  <Text strong className="block mb-2">{t.filterBySpecialty}</Text>
                  <Select 
                    value={selectedSpecialty} 
                    onChange={setSelectedSpecialty}
                    className="w-full"
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
          )}
        </Card>

        {/* Upcoming Appointments Section */}
        {appointments && appointments.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Title level={2} className="mb-0">
                {language === 'ja' ? '今後の予定' : 'Lịch hẹn sắp tới'}
              </Title>
            </div>
            
            <Row gutter={[16, 16]}>
              {appointments.slice(0, 3).map((appointment) => {
                const teacher1 = teachers.find(t => t.id === appointment.teacher1Id);
                const teacher2 = teachers.find(t => t.id === appointment.teacher2Id);
                const appointmentDate = new Date(appointment.date);
                
                return (
                  <Col xs={24} md={12} lg={8} key={appointment.id}>
                  <Card
                      className="border-2 border-green-200 hover:shadow-lg transition-all hover:border-green-400 cursor-pointer"
                      hoverable
                    >
                      <Space direction="vertical" size="middle" className="w-full">
                        <Space>
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <ClockCircleOutlined className="text-white text-lg" />
                      </div>
                          <div>
                            <AntBadge status="success" text={language === 'ja' ? '予定' : 'Đã đặt'} />
                            <div className="text-sm text-gray-600">
                              <CalendarOutlined className="mr-1" />
                              {appointmentDate.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'vi-VN', {
                                month: 'short',
                                day: 'numeric'
                              })} {appointment.time}
                      </div>
                    </div>
                        </Space>

                        <Title level={5} className="mb-0" ellipsis={{ rows: 2 }}>
                          {appointment.title}
                        </Title>

                        <Paragraph ellipsis={{ rows: 2 }} className="text-sm text-gray-600 mb-0">
                          {appointment.description}
                        </Paragraph>

                        <Space>
                          <AntAvatar.Group>
                        {teacher1 && (
                              <AntAvatar src={teacher1.avatar} style={{ backgroundColor: getAvatarColor(teacher1.id) }}>
                                {teacher1.name.charAt(0).toUpperCase()}
                              </AntAvatar>
                        )}
                        {teacher2 && (
                              <AntAvatar src={teacher2.avatar} style={{ backgroundColor: getAvatarColor(teacher2.id) }}>
                                {teacher2.name.charAt(0).toUpperCase()}
                              </AntAvatar>
                            )}
                          </AntAvatar.Group>
                          <Text className="text-xs text-gray-600">
                        {teacher1?.name} {t.with} {teacher2?.name}
                          </Text>
                        </Space>
                      </Space>
                  </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}

        {/* Discover Teachers Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Title level={2} className="mb-0">{t.discoverTeachers}</Title>
            <AntButton type="link" onClick={onViewAllTeachers} icon={<RightOutlined />} iconPosition="end">
              {language === 'ja' ? 'すべて表示' : 'Xem tất cả'}
            </AntButton>
          </div>
          
          {filteredTeachers.length === 0 ? (
            <Empty
              description={
                <Space direction="vertical">
                  <Text>{t.noTeachersFound}</Text>
                  <Text type="secondary">
                    {language === 'ja' ? '検索条件を変更して再試行してください' : 'Hãy thử thay đổi bộ lọc tìm kiếm'}
                  </Text>
                  <AntButton onClick={clearFilters}>{t.clearFilters}</AntButton>
                </Space>
              }
            />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {paginatedTeachers.map((teacher) => (
                  <Col xs={24} md={12} lg={8} key={teacher.id}>
                    <Card className="border-2 hover:shadow-lg transition-shadow" hoverable>
                      <Space direction="vertical" size="middle" className="w-full">
                        <Space size="middle" align="start">
                          <AntAvatar 
                            size={64} 
                            src={teacher.avatar}
                            style={{ backgroundColor: getAvatarColor(teacher.id) }}
                          >
                            {teacher.name.charAt(0).toUpperCase()}
                          </AntAvatar>
                    <div className="flex-1 min-w-0">
                            <Title level={5} ellipsis className="mb-1">{teacher.name}</Title>
                            <Tag color="blue">{teacher.nationality}</Tag>
                            <Text className="text-sm text-gray-600 block">
                        {teacher.experience} {t.yearsExperience}
                            </Text>
                    </div>
                        </Space>

                        <div>
                          <Text type="secondary" className="text-sm block mb-2">{t.specialties}:</Text>
                          <Space wrap>
                      {teacher.specialties.slice(0, 3).map((specialty, idx) => (
                              <Tag key={idx}>{specialty}</Tag>
                      ))}
                          </Space>
                  </div>

                        <Paragraph ellipsis={{ rows: 2 }} className="text-sm mb-0">
                    {teacher.bio}
                        </Paragraph>

                        <Space.Compact block>
                          <AntButton 
                            icon={<EyeOutlined />}
                      onClick={() => onViewTeacherProfile(teacher)}
                            style={{ width: '50%' }}
                    >
                      {t.viewProfile}
                          </AntButton>
                          <AntButton 
                            type="primary"
                            icon={<UserAddOutlined />}
                      onClick={() => onSendFriendRequest(teacher)}
                            style={{ width: '50%' }}
                    >
                      {t.sendFriendRequest}
                          </AntButton>
                        </Space.Compact>
                      </Space>
                </Card>
                  </Col>
                ))}
              </Row>
              
              {/* Pagination for Teachers */}
              {filteredTeachers.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={teacherPage}
                    total={filteredTeachers.length}
                    pageSize={itemsPerPage}
                    onChange={setTeacherPage}
                    showSizeChanger={false}
                  />
            </div>
              )}
            </>
          )}
        </div>

        {/* Discover Groups Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Title level={2} className="mb-0">{t.discoverGroups}</Title>
            <AntButton type="link" onClick={onViewAllGroups} icon={<RightOutlined />} iconPosition="end">
              {language === 'ja' ? 'すべて表示' : 'Xem tất cả'}
            </AntButton>
          </div>
          
          {filteredGroups.length === 0 ? (
            <Empty
              description={
                <Space direction="vertical">
                  <Text>{language === 'ja' ? 'グループが見つかりません' : 'Không tìm thấy nhóm nào'}</Text>
                  <Text type="secondary">
                    {language === 'ja' ? '検索条件を変更して再試行してください' : 'Hãy thử thay đổi bộ lọc tìm kiếm'}
                  </Text>
                  <AntButton onClick={clearFilters}>{t.clearFilters}</AntButton>
                </Space>
              }
            />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {paginatedGroups.map((group) => (
                  <Col xs={24} md={12} lg={8} key={group.id}>
                    <Card className="border-2 hover:shadow-lg transition-shadow" hoverable>
                      <Space direction="vertical" size="middle" className="w-full">
                        <Space size="middle">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <TeamOutlined className="text-white text-2xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                            <Title level={5} ellipsis className="mb-2">{group.name}</Title>
                            <Text className="text-sm text-gray-600">
                        {group.memberCount} {language === 'ja' ? 'メンバー' : 'thành viên'}
                            </Text>
                    </div>
                        </Space>

                        <Paragraph ellipsis={{ rows: 3 }} className="text-sm mb-0">
                    {group.description}
                        </Paragraph>

                        <AntButton 
                          type="primary"
                          block
                          icon={<TeamOutlined />}
                    onClick={() => onJoinGroup(group.id)}
                  >
                    {t.joinGroup}
                        </AntButton>
                      </Space>
                </Card>
                  </Col>
                ))}
              </Row>
              
              {/* Pagination for Groups */}
              {filteredGroups.length > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={groupPage}
                    total={filteredGroups.length}
                    pageSize={itemsPerPage}
                    onChange={setGroupPage}
                    showSizeChanger={false}
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
