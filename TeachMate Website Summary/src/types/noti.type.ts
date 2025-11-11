export interface NotiResponse {
    success: boolean;
    message: string;
    data: Notification[];
}
export interface Notification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    refId?: string;
    read: boolean;
    createdAt: string;
}
export interface BaseResponse {
    success: boolean;
    message: string;
}