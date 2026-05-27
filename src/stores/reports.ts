import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reportsApi } from '@/services/api/reports'
import type { Report, ReportPayload, ReportFilters } from '@/types/report'

export const useReportsStore = defineStore('reports', () => {
  const reports = ref<Report[]>([])
  const selected = ref<Report | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchReports(filters?: ReportFilters) {
    loading.value = true
    error.value = null
    try {
      const res = await reportsApi.list(filters)
      reports.value = Array.isArray(res) ? res : []
    } catch (err: any) {
      error.value = err?.error?.message ?? 'Failed to load reports.'
    } finally {
      loading.value = false
    }
  }

  async function fetchReport(id: string) {
    loading.value = true
    error.value = null
    try {
      selected.value = await reportsApi.get(id)
    } catch (err: any) {
      error.value = err?.error?.message ?? 'Failed to load report.'
    } finally {
      loading.value = false
    }
  }

  async function createReport(payload: ReportPayload): Promise<Report> {
    const report = await reportsApi.create(payload)
    reports.value.unshift(report)
    return report
  }

  async function updateReport(id: string, payload: ReportPayload): Promise<Report> {
    const updated = await reportsApi.update(id, payload)
    const idx = reports.value.findIndex(r => r.id === id)
    if (idx !== -1) reports.value[idx] = updated
    if (selected.value?.id === id) selected.value = updated
    return updated
  }

  async function deleteReport(id: string): Promise<void> {
    await reportsApi.delete(id)
    reports.value = reports.value.filter(r => r.id !== id)
    if (selected.value?.id === id) selected.value = null
  }

  return {
    reports,
    selected,
    loading,
    error,
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    deleteReport,
  }
})
