import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/auth.type";
import Http from './http';
export async function login(data: LoginRequest) {
    const res = Http.post<LoginResponse>('/auth/login', data);
    return res.then(response => response.data);
}

export async function register(data: RegisterRequest) {
    const res = Http.post<RegisterResponse>('/auth/register', data);
    return res.then(response => response.data);
}
    