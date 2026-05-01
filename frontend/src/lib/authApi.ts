import type { ApiResponse, AuthSession, User } from '../types';
import { api } from './api';

export const authApi = {
  register(payload: { name: string; email: string; password: string }) {
    return api.post<ApiResponse<AuthSession>>('/auth/register', payload).then((response) => response.data);
  },
  login(payload: { email: string; password: string }) {
    return api.post<ApiResponse<AuthSession>>('/auth/login', payload).then((response) => response.data);
  },
  refresh() {
    return api.post<ApiResponse<AuthSession>>('/auth/refresh').then((response) => response.data);
  },
  me() {
    return api.get<ApiResponse<User>>('/auth/me').then((response) => response.data);
  },
  logout() {
    return api.post<{ success: boolean; message: string }>('/auth/logout').then((response) => response.data);
  },
};
