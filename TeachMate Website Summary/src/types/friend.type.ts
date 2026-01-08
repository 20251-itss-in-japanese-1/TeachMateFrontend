export interface FriendSuggestion {
    success: boolean;
    message: string;
    meta: {
        page: number;
        limit: number;
        total: number;
    }
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
        sendFriend: boolean;
    } [];
}

export interface GetFriendRequest {
    success: boolean;
    message: string;
    data: {
        _id: string;
        fromUserId: {
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
        };
        toUserId: string;
        status: string;
        decidedAt: string;
        createdAt: string;
    }[];
}

export interface FriendList {
    success: boolean;
    message: string;
    data: {
        friends: {
            _id: string;
            name: string;
            email: string;
            nationality: 'Japanese' | 'Vietnamese';
            avatarUrl: string;
            experience: number;
            introduction: string;
            specialties: [],
            role: string,
            lastActiveAt: string;
            friends: [],
            bio: string,
            languages: [],
            yearsExperience: number,
            rating: number,
            status: string,
            specialties_major: [],
            specialties_subject: [],
            specialties_interest: [],
        }[]
    }
}