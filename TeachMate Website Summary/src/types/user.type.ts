export interface GetMeResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        nationality: 'Japanese' | 'Vietnamese';
        avatarUrl: string;
        experience: number;
        introduction: string;
        specialties: [],
        role: string,
        lastActiveAt: string,
        friends: [],
        bio: string,
        languages: [],
        yearsExperience: number,
        rating: number,
        status: string,
        specialties_major: [],
        specialties_subject: [],
        specialties_interest: [],
    }
}

export interface UpdateUserProfileRequest {
  fullName?: string;
  nationality?: string;
  experience?: number;
  bio?: string;
  specialties_major?: string[] | string;
  specialties_subject?: string[] | string;
  favorite?: string;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  nationality: string;
  avatarUrl: string;
  experience: number;
  introduction: string;
  specialties: string[];
  role: 'user' | 'admin';
  lastActiveAt?: string | null;
  bio: string;
  languages: string[];
  yearsExperience: number;
  rating: number;
  status: 'active' | 'inactive' | 'blocked';
  specialties_major: string[];
  specialties_subject: string[];
  specialties_interest: string[];
  googleId?: string | null;
  facebookId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  favorite?: string;
}
export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export interface GetTeacherProfileResponse {
  success: boolean;
  message: string;
  data: UserData;
}
export interface SearchUsersResponse {
  success: boolean;
  message: string;
  data: UserData[];
}

export interface ReportUserRequest {
  targetUserId: string;
  reason: string;
  targetType: 'user' | 'group';
}

export interface ReportUserResponse {
  success: boolean;
  message: string;
}