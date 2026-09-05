import apiClient from './client'
import type { ApiResponse, Category, CreateCategoryData, UpdateCategoryData } from '@/types'

export const categoryApi = {
  getByRestaurant: (restaurantId: string) =>
    apiClient
      .get<ApiResponse<Category[]>>(`/restaurants/${restaurantId}/categories`)
      .then((r) => r.data),

  create: (restaurantId: string, data: CreateCategoryData) =>
    apiClient
      .post<ApiResponse<Category>>(`/restaurants/${restaurantId}/categories`, data)
      .then((r) => r.data),

  update: (restaurantId: string, categoryId: string, data: UpdateCategoryData) =>
    apiClient
      .put<ApiResponse<Category>>(`/restaurants/${restaurantId}/categories/${categoryId}`, data)
      .then((r) => r.data),

  delete: (restaurantId: string, categoryId: string) =>
    apiClient
      .delete<ApiResponse<{ message: string }>>(`/restaurants/${restaurantId}/categories/${categoryId}`)
      .then((r) => r.data),
}
