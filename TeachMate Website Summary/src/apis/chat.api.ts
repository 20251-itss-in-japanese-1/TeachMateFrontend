import { MessagesResponse } from '../types/message.type';
import Http from './http';
export interface SendMessageRequest {
    threadId?: string;
    content: string;
    recipientId?: string;
}
export interface SendMessageWithFileRequest {
    threadId?: string;
    content: string;
    recipientId?: string;
    files: File[]; 
}
export async function sendMessage(request: SendMessageRequest) {
    const res = Http.post<MessagesResponse>('/chat/message', request);
    return res.then(response => response.data);
}
export async function sendMessageWithFile(request: SendMessageWithFileRequest) {
    const formData = new FormData();
    
    if (request.threadId) {
        formData.append('threadId', request.threadId);
    }
    if (request.recipientId) {
        formData.append('recipientId', request.recipientId);
    }
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

// --- Added / updated: Schedule API ---
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
