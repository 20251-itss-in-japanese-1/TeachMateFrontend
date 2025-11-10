import { FriendList, FriendSuggestion, GetFriendRequest } from '../types/friend.type';
import { BaseResponse } from '../types/noti.type';
import Http from './http';

export async function friendSuggest(page: number, limit: number) {
    const res = Http.get<FriendSuggestion>(`/friend/suggestions?page=${page}&limit=${limit}`);
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