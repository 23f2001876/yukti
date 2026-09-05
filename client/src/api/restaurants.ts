import apiClient from './client'
import type { ApiResponse, Restaurant, RestaurantAnalytics } from '@/types'

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

  toggleBan: (id: string, isBanned?: boolean) =>
    apiClient.patch<ApiResponse<Restaurant>>(`/restaurants/${id}/ban`, { isBanned }).then((r) => r.data),

  getAnalytics: (id: string, range: string = '7d') =>
    apiClient.get<ApiResponse<RestaurantAnalytics>>(`/restaurants/${id}/analytics?range=${range}`).then((r) => r.data),
}
