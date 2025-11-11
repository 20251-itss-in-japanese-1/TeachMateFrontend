import { MessagesResponse } from '../types/message.type';
import Http from './http';
export interface SendMessageRequest {
    threadId?: string;
    content: string;
    recipientId?: string;
}
export async function sendMessage(request: SendMessageRequest) {
    const res = Http.post<MessagesResponse>('/chat/message', request);
    return res.then(response => response.data);
}