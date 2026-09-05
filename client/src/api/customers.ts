import apiClient from './client'
import type { ApiResponse, Customer, Order } from '@/types'

export const customerApi = {
  createGuestSession: () =>
    apiClient.post<ApiResponse<Customer>>('/customers/guest').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Customer>>(`/customers/${id}`).then((r) => r.data),

  getOrders: (customerId: string) =>
    apiClient.get<ApiResponse<Order[]>>(`/customers/${customerId}/orders`).then((r) => r.data),
}
