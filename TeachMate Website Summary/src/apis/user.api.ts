import { GetMeResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, GetTeacherProfileResponse, SearchUsersResponse, ReportUserRequest, ReportUserResponse } from '../types/user.type';
import Http from './http';

export async function getUserProfile(){
    const res = Http.get<GetMeResponse>('/user/me');
    return res.then(response => response.data);
}

export async function updateUserProfile(data: UpdateUserProfileRequest){
    const res = Http.post<UpdateUserProfileResponse>('/user/me/edit', data);
    return res.then(response => response.data);
}

export async function getTeacherProfile(teacherId: string){
    const res = Http.get<GetTeacherProfileResponse>(`/user/teacher/${teacherId}`);
    return res.then(response => response.data);
}

export async function searchTeacher(query: string) {
    const res = Http.get<SearchUsersResponse>(`/user/search?q=${encodeURIComponent(query)}`);
    return res.then(response => response.data);
}

export async function reportUser(data: ReportUserRequest) {
    const res = Http.post<ReportUserResponse>('/user/report', data);
    return res.then(response => response.data);
}
    
