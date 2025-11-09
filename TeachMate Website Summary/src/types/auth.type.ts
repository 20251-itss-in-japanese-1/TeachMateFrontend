export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    nationality: 'Japanese' | 'Vietnamese';
}
export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
    }
}
export interface RegisterResponse {
    success: boolean;
    message: string;
}