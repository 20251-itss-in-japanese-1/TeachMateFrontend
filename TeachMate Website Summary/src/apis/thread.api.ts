import { ThreadDetailResponse, ThreadsResponse } from '../types/thread.type';
import Http from './http';

export async function getThreads() {
    const res = Http.get<ThreadsResponse>('/thread');
    return res.then(response => response.data);
}

export async function getThreadDetail(threadId: string) {
    const res = Http.get<ThreadDetailResponse>(`/thread/${threadId}`);
    return res.then(response => response.data);
}

export async function createThreadGroup(name: string, memberIds: string[]) {
    const res = Http.post<ThreadDetailResponse>('/thread/group', {name, memberIds: memberIds});
    return res.then(response => response.data);
}