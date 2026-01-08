import React, { useState, useMemo, useEffect } from 'react';
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
import { friendSuggest, FriendSuggestParams } from '../apis/friend.api';
import { FriendSuggestion } from '../types/friend.type';
import { searchTeacher } from '../apis/user.api';
import { mapUserToTeacher } from '../utils/mappers';
import { TeacherProfile } from './TeacherProfile';
import { getThreadChat } from '../apis/chat.api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const { Title, Text, Paragraph } = Typography;

interface HomepageProps {
  user: Teacher;
  language: Language;
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
  friendSuggestions?: FriendSuggestion;
  isLoadingSuggestions?: boolean;
  onClearFilters?: () => void;
  onFilterChange?: {
    setTeacherName: (value: string) => void;
    setNationality: (value: string) => void;
    setExperience: (value: string) => void;
    setSubjects: (value: string) => void;
  };
  filters?: {
    teacherName: string;
    nationality: string;
    experience: string;
    subjects: string;
  };
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
  const navigate = useNavigate();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedNationality, setSelectedNationality] = useState<string>('all');
  const [experienceRange, setExperienceRange] = useState<[number, number]>([0, 20]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Teacher profile modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileTeacher, setSelectedProfileTeacher] = useState<Teacher | null>(null);
  

  const [teacherPage, setTeacherPage] = useState(1);
  const [groupPage, setGroupPage] = useState(1);
  const itemsPerPage = 6;

  // API data states
  const [suggestedTeachers, setSuggestedTeachers] = useState<Teacher[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [totalTeachers, setTotalTeachers] = useState(0);

  // Fetch friend suggestions from API
  useEffect(() => {
    const fetchFriendSuggestions = async () => {
      setIsLoadingTeachers(true);
      try {
        const response = await friendSuggest({ page: teacherPage, limit: itemsPerPage });
        
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
  }, [teacherPage, itemsPerPage]);

  // Polling friend suggestions periodically when not searching
  useEffect(() => {
    if (searchQuery.trim()) return; // do not poll while searching

    let active = true;
    const poll = async () => {
      try {
        const response = await friendSuggest({ page: teacherPage, limit: itemsPerPage });
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
  }, [searchQuery, teacherPage, itemsPerPage]);

  // Search teachers from API with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchQuery.trim()) {
        // When search is cleared, fetch friend suggestions again
        setIsLoadingTeachers(true);
        try {
          const response = await friendSuggest({ page: 1, limit: itemsPerPage });
          if (response.success) {
            const mappedTeachers = response.data.map(user => mapUserToTeacher(user));
            setSuggestedTeachers(mappedTeachers);
            setTotalTeachers(response.meta.total);
            setTeacherPage(1);
          }
        } catch (error) {
          console.error('Failed to fetch friend suggestions:', error);
        } finally {
          setIsLoadingTeachers(false);
        }
        return;
      }

      setIsLoadingTeachers(true);
      try {
        const response = await searchTeacher(searchQuery);
        if (response.success) {
          const mappedTeachers = response.data.map(user => mapUserToTeacher(user));
          setSuggestedTeachers(mappedTeachers);
          setTotalTeachers(mappedTeachers.length);
          setTeacherPage(1); // Reset to first page on new search
        }
      } catch (error) {
        console.error('Failed to search teachers:', error);
      } finally {
        setIsLoadingTeachers(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, itemsPerPage]);

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
        );

      const matchesSpecialty = selectedSpecialty === 'all' || 
        teacher.specialties.includes(selectedSpecialty);

      const matchesNationality = selectedNationality === 'all' || 
        teacher.nationality === selectedNationality;

      const matchesExperience = teacher.experience >= experienceRange[0] && 
        teacher.experience <= experienceRange[1];

      return matchesSearch && matchesSpecialty && matchesNationality && matchesExperience;
    });
  }, [suggestedTeachers, searchQuery, selectedSpecialty, selectedNationality, experienceRange]);

  const filteredGroups = useMemo(() => {
    return groups;
  }, [groups]);

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
              <Row gutter={[16, 16]} align="stretch">
                {filteredTeachers.map((teacher) => (
                  <Col xs={24} md={12} lg={8} key={teacher.id}>
                    <Card
                      className="border-2 hover:shadow-lg transition-shadow h-full"
                      hoverable
                      bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '420px' }}
                    >
                      <div className="flex flex-col h-full">
                        <Space size="middle" align="start" className="mb-4">
                          <AntAvatar 
                            size={64} 
                            src={teacher.avatar}
                            style={{ backgroundColor: getAvatarColor(teacher.id) }}
                          >
                            {teacher.name.charAt(0).toUpperCase()}
                          </AntAvatar>
                          <div className="flex-1 min-w-0">
                            <Title level={5} ellipsis className="mb-1">{teacher.name}</Title>
                            <Tag color="blue" className="mb-1">{teacher.nationality}</Tag>
                            <Text className="text-sm text-gray-600 block">
                              {teacher.experience} {t.yearsExperience}
                            </Text>
                          </div>
                        </Space>

                        <div className="mb-3">
                          <Text type="secondary" className="text-sm block mb-2">{t.specialties}:</Text>
                          <div style={{ minHeight: '60px' }}>
                            <Space wrap>
                              {teacher.specialties.slice(0, 3).map((specialty, idx) => (
                                <Tag key={idx}>{specialty}</Tag>
                              ))}
                              {teacher.specialties.length > 3 && (
                                <Tag>+{teacher.specialties.length - 3}</Tag>
                              )}
                            </Space>
                          </div>
                        </div>

                        <div className="flex-1 mb-4" style={{ minHeight: '60px' }}>
                          <Paragraph ellipsis={{ rows: 3 }} className="text-sm mb-0">
                            {teacher.bio || (language === 'ja' ? '自己紹介なし' : 'Chưa có giới thiệu')}
                          </Paragraph>
                        </div>

                        <Space direction="vertical" size="small" className="w-full mt-auto">
                          <AntButton 
                            block
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedProfileTeacher(teacher);
                              setProfileModalOpen(true);
                            }}
                          >
                            {t.viewProfile}
                          </AntButton>
                          {teacher.sendFriend ? (
                            <AntButton 
                              block
                              disabled
                              icon={<UserAddOutlined />}
                            >
                              {language === 'ja' ? '友達リクエスト送信済み' : 'Đã gửi lời mời kết bạn'}
                            </AntButton>
                          ) : (
                            <AntButton 
                              block
                              type="primary"
                              icon={<UserAddOutlined />}
                              onClick={() => onSendFriendRequest(teacher)}
                              loading={false}
                            >
                              {t.sendFriendRequest}
                            </AntButton>
                          )}
                        </Space>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              {/* Pagination for Teachers */}
              {totalTeachers > itemsPerPage && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={teacherPage}
                    total={totalTeachers}
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
      
      {/* Teacher Profile Modal */}
      <TeacherProfile
        teacher={selectedProfileTeacher}
        open={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedProfileTeacher(null);
        }}
        onStartChat={async (teacher) => {
          setProfileModalOpen(false);
          setSelectedProfileTeacher(null);
          
          try {
            // Call getThreadChat API to get or create thread
            const response = await getThreadChat({ recipientId: teacher.id });
            
            if (response.success && response.data) {
              const threadId = response.data._id;
              navigate(`/chat/${threadId}`);
            } else {
              toast.error(
                language === 'ja'
                  ? 'スレッドの作成に失敗しました'
                  : 'Không thể tạo cuộc trò chuyện'
              );
            }
          } catch (error: any) {
            console.error('Failed to get or create thread:', error);
            toast.error(
              language === 'ja'
                ? `エラー: ${error.message}`
                : `Lỗi: ${error.message}`
            );
          }
        }}
        language={language}
      />
    </div>
  );
}
