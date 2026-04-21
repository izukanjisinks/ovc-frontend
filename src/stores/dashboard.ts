import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DashboardStats, Highlight } from '@/types/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const highlights = ref<Highlight[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    // wired to mock in Phase 2
  }

  async function fetchHighlights() {
    // wired to mock in Phase 2
  }

  return { stats, highlights, loading, error, fetchStats, fetchHighlights }
})
