import { apiClient } from './client'
import type { ChildCategory, ChildSponsor } from '@/types/child'

export interface LookupRequisite {
  id: string
  name: string
}

export const lookupsApi = {
  categories: () => apiClient.get<ChildCategory[]>('/categories'),
  requisites: () => apiClient.get<LookupRequisite[]>('/requisites'),
  sponsors:   () => apiClient.get<ChildSponsor[]>('/sponsors'),
}
