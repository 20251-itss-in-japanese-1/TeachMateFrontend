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
    }
);
    return res.then(response => response.data);
}
    