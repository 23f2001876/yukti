import apiClient from './client'
import type { ApiResponse, User, LoginCredentials, RegisterData, UpdateUserData } from '@/types'

export const userApi = {
  register: (data: RegisterData) =>
    apiClient.post<ApiResponse<User>>('/users/register', data).then((r) => r.data),

  login: (data: LoginCredentials) =>
    apiClient.post<ApiResponse<User>>('/users/login', data).then((r) => r.data),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/users/logout').then((r) => r.data),

  getMe: () =>
    apiClient.get<ApiResponse<User>>('/users/me').then((r) => r.data),

  updateMe: (data: UpdateUserData) =>
    apiClient.put<ApiResponse<User>>('/users/me', data).then((r) => r.data),

  getAll: () =>
    apiClient.get<ApiResponse<User[]>>('/users').then((r) => r.data),
}
