import apiClient from './client'
import type { ApiResponse, MenuItem, CreateMenuItemData, UpdateMenuItemData } from '@/types'

export const menuItemApi = {
  getByRestaurant: (restaurantId: string) =>
    apiClient
      .get<ApiResponse<MenuItem[]>>(`/restaurants/${restaurantId}/menu-items`)
      .then((r) => r.data),

  create: (restaurantId: string, data: CreateMenuItemData) =>
    apiClient
      .post<ApiResponse<MenuItem>>(`/restaurants/${restaurantId}/menu-items`, data)
      .then((r) => r.data),

  update: (restaurantId: string, menuItemId: string, data: UpdateMenuItemData) =>
    apiClient
      .patch<ApiResponse<MenuItem>>(`/restaurants/${restaurantId}/menu-items/${menuItemId}`, data)
      .then((r) => r.data),

  delete: (restaurantId: string, menuItemId: string) =>
    apiClient
      .delete<ApiResponse<{ message: string }>>(`/restaurants/${restaurantId}/menu-items/${menuItemId}`)
      .then((r) => r.data),
}
