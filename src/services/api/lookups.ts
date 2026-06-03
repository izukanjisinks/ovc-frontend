import { apiClient } from './client'
import type { ChildCategory, ChildSponsor } from '@/types/child'

export interface LookupRequisite {
  id: string
  name: string
  default_price: number
}

export const lookupsApi = {
  categories: () => apiClient.get<ChildCategory[]>('/categories'),
  createCategory: (name: string) => apiClient.post<ChildCategory>('/categories', { name }),
  updateCategory: (id: string, name: string) => apiClient.put<ChildCategory>(`/categories/${id}`, { name }),
  deleteCategory: (id: string) => apiClient.delete<void>(`/categories/${id}`),

  requisites: () => apiClient.get<LookupRequisite[]>('/requisites'),
  createRequisite: (name: string, default_price: number) => apiClient.post<LookupRequisite>('/requisites', { name, default_price }),
  updateRequisite: (id: string, name: string, default_price: number) => apiClient.put<LookupRequisite>(`/requisites/${id}`, { name, default_price }),
  deleteRequisite: (id: string) => apiClient.delete<void>(`/requisites/${id}`),

  sponsors: () => apiClient.get<ChildSponsor[]>('/sponsors'),
  createSponsor: (name: string) => apiClient.post<ChildSponsor>('/sponsors', { name }),
  updateSponsor: (id: string, name: string) => apiClient.put<ChildSponsor>(`/sponsors/${id}`, { name }),
  deleteSponsor: (id: string) => apiClient.delete<void>(`/sponsors/${id}`),
}
