import apiClient from './client'
import type { ApiResponse, StaffMember, CreateStaffData, UpdateStaffData } from '@/types'

export const staffApi = {
  getByRestaurant: (restaurantId: string) =>
    apiClient
      .get<ApiResponse<StaffMember[]>>(`/restaurants/${restaurantId}/staff`)
      .then((r) => r.data),

  getById: (restaurantId: string, staffId: string) =>
    apiClient
      .get<ApiResponse<StaffMember>>(`/restaurants/${restaurantId}/staff/${staffId}`)
      .then((r) => r.data),

  add: (restaurantId: string, data: CreateStaffData) =>
    apiClient
      .post<ApiResponse<StaffMember>>(`/restaurants/${restaurantId}/staff`, data)
      .then((r) => r.data),

  update: (restaurantId: string, staffId: string, data: UpdateStaffData) =>
    apiClient
      .patch<ApiResponse<StaffMember>>(`/restaurants/${restaurantId}/staff/${staffId}`, data)
      .then((r) => r.data),

  remove: (restaurantId: string, staffId: string) =>
    apiClient
      .delete<ApiResponse<{ message: string }>>(`/restaurants/${restaurantId}/staff/${staffId}`)
      .then((r) => r.data),
}
