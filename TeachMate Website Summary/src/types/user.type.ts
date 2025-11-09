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