import { Teacher, ExchangeSession, Report, Appointment, Notification } from '../types';

// ==================== TEACHER DATA ====================

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Yuki Tanaka',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Mathematics', 'STEM Education', 'Lesson Design'],
    experience: 8,
    interests: ['Technology in Education', 'Collaborative Learning'],
    bio: 'Passionate about integrating technology into mathematics education. Looking to exchange teaching methods with Vietnamese colleagues.',
    subjects: ['Math', 'Science']
  },
  {
    id: '2',
    name: 'Linh Nguyen',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwdGVhY2hlcnxlbnwxfHx8fDE3NjA0NTE3MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['English Language', 'Literature'],
    experience: 6,
    interests: ['Cross-cultural Communication', 'Language Teaching Methods'],
    bio: 'English teacher interested in comparing language teaching approaches between Japan and Vietnam.',
    subjects: ['English', 'Literature']
  },
  {
    id: '3',
    name: 'Hiroshi Yamamoto',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MDM5NDQ5OXww&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['History', 'Social Studies'],
    experience: 12,
    interests: ['Cultural Exchange', 'Comparative Education'],
    bio: 'Experienced history teacher eager to learn about Vietnamese historical perspectives and teaching methods.',
    subjects: ['History', 'Geography']
  },
  {
    id: '4',
    name: 'Mai Pham',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1758781784881-d9fdcdf80d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGN1bHR1cmUlMjBlZHVjYXRpb258ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Art', 'Creative Education'],
    experience: 5,
    interests: ['Visual Arts', 'Student Engagement'],
    bio: 'Art educator looking to share creative teaching techniques and learn from Japanese art education.',
    subjects: ['Art', 'Design']
  },
  {
    id: '5',
    name: 'Kenji Sato',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Physics', 'Science'],
    experience: 10,
    interests: ['Experimental Learning', 'Lab Techniques'],
    bio: 'Physics teacher interested in sharing experimental approaches and discussing curriculum design.',
    subjects: ['Physics', 'Chemistry']
  },
  {
    id: '6',
    name: 'Trang Le',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwdGVhY2hlcnxlbnwxfHx8fDE3NjA0NTE3MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Music', 'Performing Arts'],
    experience: 7,
    interests: ['Music Theory', 'Cultural Music'],
    bio: 'Music teacher passionate about cultural exchange through music education.',
    subjects: ['Music', 'Arts']
  },
  {
    id: '7',
    name: 'Sakura Ishikawa',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Biology', 'Environmental Science'],
    experience: 9,
    interests: ['Ecology', 'Outdoor Education'],
    bio: 'Biology teacher focused on environmental awareness and sustainability in education.',
    subjects: ['Biology', 'Environmental Science']
  },
  {
    id: '8',
    name: 'Hung Tran',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MDM5NDQ5OXww&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Computer Science', 'Programming'],
    experience: 4,
    interests: ['Coding Education', 'AI in Education'],
    bio: 'Computer science teacher interested in innovative programming education methods.',
    subjects: ['Computer Science', 'Technology']
  },
  {
    id: '9',
    name: 'Akiko Nakamura',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1758781784881-d9fdcdf80d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGN1bHR1cmUlMjBlZHVjYXRpb258ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Chemistry', 'Laboratory Sciences'],
    experience: 11,
    interests: ['Practical Chemistry', 'Safety in Lab'],
    bio: 'Chemistry teacher with extensive lab experience, eager to share safety protocols and experiments.',
    subjects: ['Chemistry', 'Science']
  },
  {
    id: '10',
    name: 'Minh Vo',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwdGVhY2hlcnxlbnwxfHx8fDE3NjA0NTE3MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Physical Education', 'Sports'],
    experience: 6,
    interests: ['Student Fitness', 'Team Sports'],
    bio: 'PE teacher passionate about promoting healthy lifestyles and team building through sports.',
    subjects: ['Physical Education', 'Health']
  },
  {
    id: '11',
    name: 'Takeshi Ito',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Economics', 'Business Studies'],
    experience: 13,
    interests: ['Financial Literacy', 'Entrepreneurship'],
    bio: 'Economics teacher focused on practical financial education and business concepts for students.',
    subjects: ['Economics', 'Business']
  },
  {
    id: '12',
    name: 'Thao Nguyen',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwdGVhY2hlcnxlbnwxfHx8fDE3NjA0NTE3MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Psychology', 'Counseling'],
    experience: 8,
    interests: ['Student Mental Health', 'Behavioral Science'],
    bio: 'School counselor and psychology teacher dedicated to student well-being and mental health awareness.',
    subjects: ['Psychology', 'Social Studies']
  },
  {
    id: '13',
    name: 'Ryu Kobayashi',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MDM5NDQ5OXww&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Philosophy', 'Ethics'],
    experience: 15,
    interests: ['Critical Thinking', 'Moral Education'],
    bio: 'Philosophy teacher encouraging students to develop critical thinking and ethical reasoning skills.',
    subjects: ['Philosophy', 'Ethics']
  },
  {
    id: '14',
    name: 'Lan Pham',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1758781784881-d9fdcdf80d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGN1bHR1cmUlMjBlZHVjYXRpb258ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Geography', 'Earth Science'],
    experience: 7,
    interests: ['Climate Education', 'Cartography'],
    bio: 'Geography teacher passionate about global awareness and environmental geography.',
    subjects: ['Geography', 'Environmental Studies']
  },
  {
    id: '15',
    name: 'Yuki Matsuda',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Drama', 'Theater Arts'],
    experience: 5,
    interests: ['Performance Art', 'Creative Expression'],
    bio: 'Drama teacher helping students build confidence and communication skills through theater.',
    subjects: ['Drama', 'Performing Arts']
  },
  {
    id: '16',
    name: 'Duc Le',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MDM5NDQ5OXww&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Mathematics', 'Statistics', 'Lesson Design'],
    experience: 10,
    interests: ['Data Science', 'Applied Mathematics'],
    bio: 'Math teacher specializing in statistics and real-world applications of mathematics.',
    subjects: ['Mathematics', 'Statistics']
  },
  {
    id: '17',
    name: 'Aoi Suzuki',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Lesson Design', 'Curriculum Development'],
    experience: 14,
    interests: ['Innovative Teaching', 'Educational Technology'],
    bio: 'Expert in lesson planning and curriculum design with focus on student-centered learning.',
    subjects: ['Education', 'Pedagogy']
  },
  {
    id: '18',
    name: 'Hoa Tran',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwdGVhY2hlcnxlbnwxfHx8fDE3NjA0NTE3MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Lesson Design', 'Assessment Methods'],
    experience: 9,
    interests: ['Formative Assessment', 'Learning Objectives'],
    bio: 'Passionate about creating effective lesson plans and assessment strategies.',
    subjects: ['Education', 'Teaching Methods']
  },
  {
    id: '19',
    name: 'Daichi Watanabe',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MDM5NDQ5OXww&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Science', 'Lesson Design'],
    experience: 7,
    interests: ['Inquiry-Based Learning', 'Hands-on Activities'],
    bio: 'Science educator focused on designing engaging inquiry-based lessons.',
    subjects: ['Science', 'Biology']
  },
  {
    id: '20',
    name: 'Quynh Nguyen',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1758781784881-d9fdcdf80d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGN1bHR1cmUlMjBlZHVjYXRpb258ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Literature', 'Lesson Design'],
    experience: 11,
    interests: ['Reading Comprehension', 'Creative Writing'],
    bio: 'Literature teacher with expertise in designing engaging reading and writing lessons.',
    subjects: ['Literature', 'Language Arts']
  },
  {
    id: '21',
    name: 'Kenta Fujimoto',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Social Studies', 'Lesson Design'],
    experience: 12,
    interests: ['Project-Based Learning', 'Global Citizenship'],
    bio: 'Social studies teacher specializing in project-based lesson design.',
    subjects: ['Social Studies', 'History']
  },
  {
    id: '22',
    name: 'Phuong Le',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1740153204511-731e4c619b80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtZXNlJTIwdGVhY2hlcnxlbnwxfHx8fDE3NjA0NTE3MTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['STEM Education', 'Lesson Design'],
    experience: 6,
    interests: ['Integrated STEM', 'Problem Solving'],
    bio: 'STEM educator creating integrated lesson plans across multiple subjects.',
    subjects: ['STEM', 'Mathematics']
  },
  {
    id: '23',
    name: 'Rina Kimura',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1758781784881-d9fdcdf80d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMGN1bHR1cmUlMjBlZHVjYXRpb258ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['English Language', 'Lesson Design'],
    experience: 8,
    interests: ['Communicative Approach', 'Task-Based Learning'],
    bio: 'English teacher focused on communicative lesson design and task-based activities.',
    subjects: ['English', 'ESL']
  },
  {
    id: '24',
    name: 'Binh Pham',
    nationality: 'Vietnamese',
    avatar: 'https://images.unsplash.com/photo-1664382951771-40432ecc81bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFjaGVyJTIwY2xhc3Nyb29tJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc2MDM5NDQ5OXww&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Arts', 'Lesson Design'],
    experience: 5,
    interests: ['Creative Thinking', 'Visual Learning'],
    bio: 'Art teacher designing creative and visually engaging lesson plans.',
    subjects: ['Arts', 'Visual Arts']
  },
  {
    id: '25',
    name: 'Haruto Nakano',
    nationality: 'Japanese',
    avatar: 'https://images.unsplash.com/photo-1594256347468-5cd43df8fbaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlYWNoZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYwNDUxNzEzfDA&ixlib=rb-4.1.0&q=80&w=400',
    specialties: ['Technology', 'Lesson Design'],
    experience: 10,
    interests: ['Digital Literacy', 'EdTech Integration'],
    bio: 'Technology teacher integrating digital tools into effective lesson design.',
    subjects: ['Technology', 'Computer Science']
  }
];

export const mockSessions: ExchangeSession[] = [
  {
    id: '1',
    teacher1Id: '1',
    teacher2Id: '2',
    date: new Date('2025-10-20T14:00:00'),
    topic: 'Mathematics vs Language Teaching: Comparative Methods',
    status: 'confirmed'
  },
  {
    id: '2',
    teacher1Id: '3',
    teacher2Id: '4',
    date: new Date('2025-10-22T10:00:00'),
    topic: 'Integrating Arts and History Education',
    status: 'confirmed'
  },
  {
    id: '3',
    teacher1Id: '5',
    teacher2Id: '6',
    date: new Date('2025-10-25T16:00:00'),
    topic: 'Creative Approaches to STEM Education',
    status: 'confirmed'
  }
];

export const mockReports: Report[] = [
  {
    id: '1',
    reporterId: '2',
    reportedUserId: '7',
    reason: 'Inappropriate messages',
    status: 'pending',
    createdAt: new Date('2025-10-10T09:00:00')
  }
];

export const mockGroups = [
  {
    id: '1',
    name: 'Mathematics Education Exchange',
    memberCount: 124,
    avatar: '',
    description: 'A community for math teachers to share innovative teaching methods, problem-solving techniques, and curriculum ideas.'
  },
  {
    id: '2',
    name: 'English Language Teachers Network',
    memberCount: 256,
    avatar: '',
    description: 'Connect with English teachers from Japan and Vietnam to exchange language teaching strategies and resources.'
  },
  {
    id: '3',
    name: 'STEM Education Innovation',
    memberCount: 189,
    avatar: '',
    description: 'Explore cutting-edge STEM teaching approaches, technology integration, and hands-on learning experiences.'
  },
  {
    id: '4',
    name: 'Cultural Exchange in Education',
    memberCount: 312,
    avatar: '',
    description: 'Discuss cross-cultural teaching methods, student exchange programs, and building global awareness in classrooms.'
  },
  {
    id: '5',
    name: 'Arts & Creative Education',
    memberCount: 98,
    avatar: '',
    description: 'Share creative teaching ideas, art projects, music education strategies, and ways to foster creativity in students.'
  },
  {
    id: '6',
    name: 'History & Social Studies Forum',
    memberCount: 167,
    avatar: '',
    description: 'Exchange perspectives on teaching history, geography, and social studies from Japanese and Vietnamese contexts.'
  }
];

export const mockFriendRequests = [
  {
    id: 'req1',
    teacher: mockTeachers[1]
  },
  {
    id: 'req2',
    teacher: mockTeachers[3]
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'apt1',
    teacher1Id: '1',
    teacher2Id: '2',
    title: 'Thảo luận phương pháp giảng dạy Toán',
    date: new Date('2025-10-22T14:00:00'),
    time: '14:00',
    description: 'Trao đổi về các phương pháp giảng dạy toán học hiệu quả và sử dụng công nghệ trong lớp học.',
    status: 'upcoming',
    createdAt: new Date('2025-10-15T10:00:00')
  },
  {
    id: 'apt2',
    teacher1Id: '3',
    teacher2Id: '4',
    title: 'Giao lưu văn hóa và nghệ thuật',
    date: new Date('2025-10-23T10:30:00'),
    time: '10:30',
    description: 'Chia sẻ về cách kết hợp lịch sử và nghệ thuật trong giảng dạy.',
    status: 'upcoming',
    createdAt: new Date('2025-10-16T09:00:00')
  },
  {
    id: 'apt3',
    teacher1Id: '5',
    teacher2Id: '6',
    title: 'Hội thảo STEM và Âm nhạc',
    date: new Date('2025-10-24T15:00:00'),
    time: '15:00',
    description: 'Khám phá cách tích hợp STEM vào giáo dục âm nhạc và ngược lại.',
    status: 'upcoming',
    createdAt: new Date('2025-10-17T11:00:00')
  },
  {
    id: 'apt4',
    teacher1Id: '7',
    teacher2Id: '8',
    title: 'Sinh học và Khoa học Máy tính',
    date: new Date('2025-10-25T13:00:00'),
    time: '13:00',
    description: 'Thảo luận về ứng dụng của khoa học máy tính trong nghiên cứu sinh học.',
    status: 'upcoming',
    createdAt: new Date('2025-10-18T14:00:00')
  },
  {
    id: 'apt5',
    teacher1Id: '9',
    teacher2Id: '10',
    title: 'Hóa học và Thể dục',
    date: new Date('2025-10-26T11:00:00'),
    time: '11:00',
    description: 'Trao đổi về sức khỏe và dinh dưỡng qua góc độ hóa học và thể dục.',
    status: 'upcoming',
    createdAt: new Date('2025-10-19T08:00:00')
  },
  {
    id: 'apt6',
    teacher1Id: '11',
    teacher2Id: '12',
    title: 'Kinh tế và Tâm lý học',
    date: new Date('2025-10-27T16:00:00'),
    time: '16:00',
    description: 'Thảo luận về hành vi kinh tế và tâm lý người tiêu dùng.',
    status: 'upcoming',
    createdAt: new Date('2025-10-19T15:00:00')
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'friend_request',
    title: '新しい友達リクエスト',
    message: 'Linh Nguyenさんがあなたに友達リクエストを送信しました',
    fromUserId: '2',
    isRead: false,
    createdAt: new Date('2025-10-20T09:30:00')
  },
  {
    id: 'notif2',
    type: 'appointment',
    title: '予定が近づいています',
    message: 'Linh Nguyenさんとの予定が10/22 14:00にあります',
    fromUserId: '2',
    relatedId: 'apt1',
    isRead: false,
    createdAt: new Date('2025-10-20T08:00:00')
  },
  {
    id: 'notif3',
    type: 'group_join',
    title: 'グループ参加成功',
    message: 'グループ「Mathematics Education Exchange」に参加しました',
    relatedId: '1',
    isRead: false,
    createdAt: new Date('2025-10-19T16:45:00')
  },
  {
    id: 'notif4',
    type: 'message',
    title: '新しいメッセージ',
    message: 'Mai Phamさんからメッセージが届きました：「こんにちは！美術の教授法について意見交換したいです」',
    fromUserId: '4',
    isRead: false,
    createdAt: new Date('2025-10-19T14:20:00')
  },
  {
    id: 'notif5',
    type: 'friend_request',
    title: '友達リクエスト承認',
    message: 'Hiroshi Yamamotoさんがあなたの友達リクエストを承認しました',
    fromUserId: '3',
    isRead: false,
    createdAt: new Date('2025-10-18T11:15:00')
  },
  {
    id: 'notif6',
    type: 'appointment',
    title: '予定が確認されました',
    message: 'Trang Leさんが予定「STEMと音楽のワークショップ」を確認しました',
    fromUserId: '6',
    relatedId: 'apt3',
    isRead: true,
    createdAt: new Date('2025-10-17T13:00:00')
  },
  {
    id: 'notif7',
    type: 'system',
    title: 'システムアップデート',
    message: 'システムが新しいバージョンに更新され、多くの新機能が追加されました',
    isRead: false,
    createdAt: new Date('2025-10-17T10:00:00')
  },
  {
    id: 'notif8',
    type: 'group_join',
    title: '新しいメンバー',
    message: 'Kenji Satoさんがグループ「STEM Education Innovation」に参加しました',
    fromUserId: '5',
    relatedId: '3',
    isRead: true,
    createdAt: new Date('2025-10-16T15:30:00')
  },
  {
    id: 'notif9',
    type: 'friend_request',
    title: '友達リクエスト',
    message: 'Sakura Ishikawaさんがあなたと友達になりたいと思っています',
    fromUserId: '7',
    isRead: false,
    createdAt: new Date('2025-10-20T07:15:00')
  },
  {
    id: 'notif10',
    type: 'message',
    title: '新しいメッセージ',
    message: 'Hung Tranさん：「こんにちは！教育におけるAIプロジェクトに参加しませんか？」',
    fromUserId: '8',
    isRead: false,
    createdAt: new Date('2025-10-19T18:30:00')
  },
  {
    id: 'notif11',
    type: 'appointment',
    title: '予定のリマインダー',
    message: '予定「生物学とコンピュータサイエンス」が2時間後に始まります',
    relatedId: 'apt4',
    isRead: false,
    createdAt: new Date('2025-10-20T06:00:00')
  },
  {
    id: 'notif12',
    type: 'group_join',
    title: 'グループ招待',
    message: 'Akiko Nakamuraさんがあなたをグループ「Science Lab Techniques」に招待しました',
    fromUserId: '9',
    relatedId: '3',
    isRead: false,
    createdAt: new Date('2025-10-19T12:00:00')
  },
  {
    id: 'notif13',
    type: 'message',
    title: '3件の新しいメッセージ',
    message: 'グループ「English Language Teachers Network」に3件の未読メッセージがあります',
    relatedId: '2',
    isRead: true,
    createdAt: new Date('2025-10-18T16:45:00')
  },
  {
    id: 'notif14',
    type: 'friend_request',
    title: '友達リクエスト承認',
    message: 'Minh Voさんがあなたの友達リクエストを承認しました',
    fromUserId: '10',
    isRead: true,
    createdAt: new Date('2025-10-18T09:20:00')
  },
  {
    id: 'notif15',
    type: 'appointment',
    title: '予定がキャンセルされました',
    message: 'Takeshi Itoさんが10/20の予定をキャンセルしました',
    fromUserId: '11',
    isRead: true,
    createdAt: new Date('2025-10-17T14:30:00')
  },
  {
    id: 'notif16',
    type: 'system',
    title: 'システムメンテナンス',
    message: 'システムは10/21の午前2時にメンテナンスされます。予定時間：30分',
    isRead: false,
    createdAt: new Date('2025-10-20T05:00:00')
  },
  {
    id: 'notif17',
    type: 'group_join',
    title: '新しいメンバー',
    message: 'Thao Nguyenさんがグループ「Cultural Exchange in Education」に参加しました',
    fromUserId: '12',
    relatedId: '4',
    isRead: true,
    createdAt: new Date('2025-10-16T11:00:00')
  },
  {
    id: 'notif18',
    type: 'message',
    title: 'Ryu Kobayashiさんからのメッセージ',
    message: 'Ryu Kobayashiさん：「あなたの哲学の教授法にとても興味があります」',
    fromUserId: '13',
    isRead: true,
    createdAt: new Date('2025-10-15T14:15:00')
  },
  {
    id: 'notif19',
    type: 'appointment',
    title: '新しい予定の提案',
    message: 'Lan Phamさんが10/25 10:00に予定を入れたいと考えています',
    fromUserId: '14',
    isRead: true,
    createdAt: new Date('2025-10-15T10:30:00')
  },
  {
    id: 'notif20',
    type: 'friend_request',
    title: '友達リクエスト',
    message: 'Yuki Matsudaさんがあなたと友達になりたいと思っています',
    fromUserId: '15',
    isRead: true,
    createdAt: new Date('2025-10-14T16:00:00')
  }
];
