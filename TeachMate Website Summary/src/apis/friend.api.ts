import { FriendList, FriendSuggestion, GetFriendRequest } from '../types/friend.type';
import { BaseResponse } from '../types/noti.type';
import Http from './http';

export interface FriendSuggestParams {
    page?: number;
    limit?: number;
    teacher_name?: string;
    nationality?: string;
    years_of_experience?: string;
    subjects?: string;
}

export async function friendSuggest(params: FriendSuggestParams = {}) {
    const { page = 1, limit = 10, teacher_name = '', nationality = '', years_of_experience = '', subjects = '' } = params;
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(teacher_name && { teacher_name }),
        ...(nationality && { nationality }),
        ...(years_of_experience && { years_of_experience }),
        ...(subjects && { subjects }),
    });
    const res = Http.get<FriendSuggestion>(`/friend/suggestions?${queryParams.toString()}`);
    return res.then(response => response.data);
}

export async function sendFriendRequest(targetId: string) {
    const res = Http.post<BaseResponse>('/friend/send-request', {targetId});
    return res.then(response => response.data);
}

export async function acceptFriendRequest(requestId: string) {
    const res = Http.post<BaseResponse>('/friend/accept-request', {requestId});
    return res.then(response => response.data);
}

export async function rejectFriendRequest(requestId: string) {
    const res = Http.post<BaseResponse>('/friend/reject-request', {requestId});
    return res.then(response => response.data);
}

export async function getFriendRequest() {
    const res = Http.get<GetFriendRequest>('/friend/requests');
    return res.then(response => response.data);
}

export async function getFriendList() {
    const res = Http.get<FriendList>('/friend/get-all');
    return res.then(response => response.data);
}