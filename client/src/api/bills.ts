import apiClient from './client'
import type { ApiResponse, Bill, CreateBillData, UpdateBillPaymentData } from '@/types'

export const billApi = {
  getAll: (restaurantId: string) =>
    apiClient
      .get<ApiResponse<Bill[]>>(`/restaurants/${restaurantId}/bills`)
      .then((r) => r.data),

  getById: (restaurantId: string, billId: string) =>
    apiClient
      .get<ApiResponse<Bill>>(`/restaurants/${restaurantId}/bills/${billId}`)
      .then((r) => r.data),

  getOpen: (restaurantId: string, params: { customerId?: string; tableNumber?: string }) =>
    apiClient
      .get<ApiResponse<Bill>>(`/restaurants/${restaurantId}/bills/open`, { params })
      .then((r) => r.data),

  create: (restaurantId: string, data: CreateBillData) =>
    apiClient
      .post<ApiResponse<Bill>>(`/restaurants/${restaurantId}/bills`, data)
      .then((r) => r.data),

  updatePayment: (restaurantId: string, billId: string, data: UpdateBillPaymentData) =>
    apiClient
      .patch<ApiResponse<Bill>>(`/restaurants/${restaurantId}/bills/${billId}/payment`, data)
      .then((r) => r.data),

  delete: (restaurantId: string, billId: string) =>
    apiClient
      .delete<ApiResponse<{ message: string }>>(`/restaurants/${restaurantId}/bills/${billId}`)
      .then((r) => r.data),
}
