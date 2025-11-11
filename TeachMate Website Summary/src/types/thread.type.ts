import { Message } from "./message.type";

export interface ThreadsResponse{
    success: boolean;
    message: string;
    data: {
        _id: string;
        type: "direct_friend" | 'direct_stranger' | 'group';
        name?: string;
        avatar?: string;
        members: {
            userId: {
                _id: string;
                name: string;
                email: string;
                avatarUrl?: string;
            },
            role: string;
            lastReadAt: string;
            _id: string;
        }[];
        memberHash: string;
        lastMessage?: {
            _id: string;
            senderId: {
                _id: string;
                name: string;
            }
            content: string;
            contentType: string;
        };
        createdBy: {
            _id: string;
            name: string;
            email: string;
            avatarUrl?: string;
        };
        unreadCount: number;
        isLastMessageRead: boolean;
    }[];
}

export interface ThreadDetailResponse {
    success: boolean;
    message: string;
    data: {
        thread: {
            _id: string;
            name?: string;
            avatar?: string;
            type: "direct_friend" | 'direct_stranger' | 'group';
            members: {
                userId: {
                    _id: string;
                    name: string;
                    email: string;
                    avatarUrl?: string;
                },
                role: string;
                lastReadAt: string;
                _id: string;
            }[];
        };
        messages: Message[];
    }
}