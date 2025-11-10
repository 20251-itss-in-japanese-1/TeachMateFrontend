import { BaseResponse, NotiResponse } from '../types/noti.type';
import Http from './http';

export async function getNoti() {
    const res = Http.get<NotiResponse>('/noti/get-all');
    return res.then(response => response.data);
}

export async function markNotiAsRead(notiId: string) {
    const res = Http.post<BaseResponse>(`/noti/read`, { notiId });
    return res.then(response => response.data);
}
export async function markAllNotiAsRead() {
    const res = Http.post<BaseResponse>('/noti/read-all');
    return res.then(response => response.data);
}