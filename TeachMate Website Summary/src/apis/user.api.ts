import { GetMeResponse } from '../types/user.type';
import Http from './http';

export async function getUserProfile(){
    const res = Http.get<GetMeResponse>('/user/me');
    return res.then(response => response.data);
}