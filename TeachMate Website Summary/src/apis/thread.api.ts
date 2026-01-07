import { ThreadDetailResponse, ThreadsResponse } from '../types/thread.type';
import Http from './http';

export async function getThreads() {
    const res = Http.get<ThreadsResponse>('/thread');
    return res.then(response => response.data);
}
export async function getThreadsStrangers() {
    const res = Http.get<ThreadsResponse>('/thread/strangers');
    return res.then(response => response.data);
}
export async function getThreadGroups() {
    const res = Http.get<ThreadsResponse>('/thread/group');
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

export interface JoinThreadGroupResponse {
    success: boolean;
    message: string;
    data: string;
}

export async function joinThreadGroup(threadId: string) {
    const res = Http.post<JoinThreadGroupResponse>('/thread/join-group', { threadId });
    return res.then(response => response.data);
}

export interface ThreadAttachmentsResponse {
    success: boolean;
    message: string;
    data: {
        link: Array<{
            kind: string;
            mime: string;
            url: string;
        }>;
        image: Array<{
            kind: string;
            mime: string;
            url: string;
        }>;
        file: Array<{
            kind: string;
            mime: string;
            url: string;
        }>;
    };
}

export async function getThreadAttachments(threadId: string) {
    const res = Http.get<ThreadAttachmentsResponse>(`/thread/attachments/${threadId}`);
    return res.then(response => response.data);
}

export async function leaveThreadGroup(threadId: string) {
    const res = Http.post(`/thread/${threadId}/out`);
    return res.then(response => response.data);
}
