export interface Message {
    _id: string;
    threadId: string;
    senderId: {
        _id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
    content: string;
    contentType: string;
    attachments?: string[];
    scheduleId?: string;
    pollId?: string;
    reactions?: string[];
    readBy: {
        _id: string;
        name: string;
        avatarUrl?: string;
    }[];
    isReadByMe: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MessagesResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        threadId: {
            _id: string;
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
        senderId: {
            _id: string;
            name: string;
            email: string;
            avatarUrl?: string;
        }
    }
}