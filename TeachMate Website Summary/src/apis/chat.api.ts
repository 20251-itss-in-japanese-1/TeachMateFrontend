import { MessagesResponse } from '../types/message.type';
import Http from './http';
export interface SendMessageRequest {
    threadId: string;
    content: string;
}
export interface SendMessageWithFileRequest {
    threadId: string;
    content?: string;
    files: File[]; 
}
export interface GetThreadChatRequest {
    senderId?: string;
    recipientId: string;
}
export interface ThreadResponse {
    success: boolean;
    message: string;
    data?: any;
}
export async function deleteMessage(messageId: string) {
    const res = Http.delete<MessagesResponse>(`/chat/message/${messageId}`);
    return res.then(response => response.data);
}
export async function getThreadChat(request: GetThreadChatRequest) {
    const res = Http.post<ThreadResponse>('/chat/thread', {
        recipientId: request.recipientId
    });
    return res.then(response => response.data);
}
export async function sendMessage(request: SendMessageRequest) {
    if (!request.threadId || request.threadId === 'null') {
        throw new Error('Thread ID is required');
    }
    if (!request.content || request.content.trim().length === 0) {
        throw new Error('Message content cannot be empty');
    }
    if (request.content.length > 2000) {
        throw new Error('Message content exceeds maximum length of 2000 characters');
    }
    
    const res = Http.post<MessagesResponse>('/chat/message', {
        threadId: request.threadId,
        content: request.content.trim()
    });
    return res.then(response => response.data);
}
export async function sendMessageWithFile(request: SendMessageWithFileRequest) {
    if (!request.threadId || request.threadId === 'null') {
        throw new Error('Thread ID is required');
    }
    if (!request.files || request.files.length === 0) {
        throw new Error('At least one file is required');
    }
    
    const formData = new FormData();
    
    formData.append('threadId', request.threadId);
    // Set content to empty string if not provided
    formData.append('content', request.content || '');
    
    // Append all files
    request.files.forEach((file) => {
        formData.append('files', file);
    });
    
    const res = Http.post<MessagesResponse>('/chat/message/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.then(response => response.data);
}

export interface CreateScheduleRequest {
    title: string;
    description?: string;
    // either startAt (ISO) or date + time (UI uses DD/MM/YYYY + HH:MM) can be provided
    startAt?: string; // ISO string (optional)
    date?: string;    // e.g. '22/11/2025' (optional)
    time?: string;    // e.g. '12:00' (optional)
    // backend expects threadId and userId
    threadId: string;
    userId: string;
}

export interface ScheduleResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Create a schedule / event and post it to group chat
 */
export async function createSchedule(request: CreateScheduleRequest) {
    const res = Http.post<ScheduleResponse>('/schedule', request);
    return res.then(r => r.data);
}

/**
 * Join a schedule (POST /schedule/:scheduleId/join)
 */
export async function joinSchedule(scheduleId: string) {
    const res = Http.post<ScheduleResponse>(`/schedule/${scheduleId}/join`);
    return res.then(r => r.data);
}

/**
 * Leave a schedule (POST /schedule/:scheduleId/leave)
 */
export async function leaveSchedule(scheduleId: string) {
    const res = Http.post<ScheduleResponse>(`/schedule/${scheduleId}/leave`);
    return res.then(r => r.data);
}

/**
 * Get schedules for a thread.
 * Backend route: GET /schedule?threadId=...
 * Returns ScheduleResponse where data is expected to be an array of schedules.
 */
export async function getThreadSchedules(threadId: string) {
    const res = Http.get<ScheduleResponse>(`/schedule?threadId=${encodeURIComponent(threadId)}`);
    return res.then(r => r.data);
}

// --- Poll API ---
export interface CreatePollRequest {
  threadId: string;
  question: string;
  options: string[];
  allowMultiple?: boolean;
}

export interface PollResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function createPoll(request: CreatePollRequest) {
  const res = Http.post<PollResponse>('/poll', request);
  return res.then(r => r.data);
}

export async function getPollById(pollId: string) {
  const res = Http.get<PollResponse>(`/poll/${pollId}`);
  return res.then(r => r.data);
}

export async function votePoll(pollId: string, optionId: string, userId?: string) {
  // send optionId and userId (backend expects these)
  const res = Http.post<PollResponse>(`/poll/${pollId}/vote`, { optionId, userId });
  return res.then(r => r.data);
}

export async function removeVotePoll(pollId: string) {
  const res = Http.delete<PollResponse>(`/poll/${pollId}/vote`);
  return res.then(r => r.data);
}

export async function getThreadPolls(threadId: string) {
  const res = Http.get<PollResponse>(`/poll/thread/${threadId}`);
  return res.then(r => r.data);
}
