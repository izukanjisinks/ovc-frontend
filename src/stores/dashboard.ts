import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockDashboardApi as dashboardApi } from '@/services/mock/dashboard'
import type { DashboardStats, Highlight } from '@/types/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const highlights = ref<Highlight[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      stats.value = await dashboardApi.stats()
    } catch {
      error.value = 'Failed to load dashboard stats.'
    } finally {
      loading.value = false
    }
  }

  async function fetchHighlights() {
    try {
      highlights.value = await dashboardApi.highlights()
    } catch {
      // non-critical
    }
  }

  return { stats, highlights, loading, error, fetchStats, fetchHighlights }
})
