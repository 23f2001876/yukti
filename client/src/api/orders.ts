import apiClient from './client'
import type { ApiResponse, Order, OrderStatus, CreateOrderPayload } from '@/types'

export const orderApi = {
  getByRestaurant: (restaurantId: string) =>
    apiClient
      .get<ApiResponse<Order[]>>(`/restaurants/${restaurantId}/orders`)
      .then((r) => r.data),

  getById: (restaurantId: string, orderId: string) =>
    apiClient
      .get<ApiResponse<Order>>(`/restaurants/${restaurantId}/orders/${orderId}`)
      .then((r) => r.data),

  create: (restaurantId: string, data: CreateOrderPayload) =>
    apiClient
      .post<ApiResponse<Order>>(`/restaurants/${restaurantId}/orders`, data)
      .then((r) => r.data),

  updateStatus: (restaurantId: string, orderId: string, status: OrderStatus) =>
    apiClient
      .patch<ApiResponse<Order>>(`/restaurants/${restaurantId}/orders/${orderId}/status`, { status })
      .then((r) => r.data),
}
