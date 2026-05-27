import { apiClient } from './client'
import type { Report, ReportPayload, ReportFilters } from '@/types/report'

export interface ReportListParams extends Record<string, string | number | boolean | undefined> {
  term?: string
  year?: number
}

export const reportsApi = {
  list: (filters?: ReportFilters) =>
    apiClient.get<Report[]>('/reports', {
      params: {
        term: filters?.term,
        year: filters?.year,
      },
    }),

  get: (id: string) =>
    apiClient.get<Report>(`/reports/${id}`),

  create: (payload: ReportPayload) =>
    apiClient.post<Report>('/reports', payload),

  update: (id: string, payload: ReportPayload) =>
    apiClient.put<Report>(`/reports/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<void>(`/reports/${id}`),
}
