import apiClient from './client'
import type { ApiResponse, Restaurant } from '@/types'

export const restaurantApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Restaurant[]>>('/restaurants').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Restaurant>>(`/restaurants/${id}`).then((r) => r.data),

  create: (data: Partial<Restaurant>) =>
    apiClient.post<ApiResponse<Restaurant>>('/restaurants', data).then((r) => r.data),

  update: (id: string, data: Partial<Restaurant>) =>
    apiClient.put<ApiResponse<Restaurant>>(`/restaurants/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/restaurants/${id}`).then((r) => r.data),
}
