import type { DashboardStats, Highlight } from '@/types/dashboard'
import { mockChildrenApi } from './children'

function delay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const MOCK_HIGHLIGHTS: Highlight[] = []

export const mockDashboardApi = {
  async stats(): Promise<DashboardStats> {
    await delay()
    const children = await mockChildrenApi.list()

    const categoryCount: Record<string, number> = {}
    const sponsorCount: Record<string, number> = {}

    for (const child of children) {
      const full = await mockChildrenApi.get(child.id)
      for (const cat of full.categories) {
        categoryCount[cat.name] = (categoryCount[cat.name] ?? 0) + 1
      }
      for (const sp of full.sponsors) {
        sponsorCount[sp.name] = (sponsorCount[sp.name] ?? 0) + 1
      }
    }

    return {
      total_children: children.length,
      by_category: Object.entries(categoryCount).map(([name, count]) => ({ name, count })),
      by_sponsor: Object.entries(sponsorCount).map(([name, count]) => ({ name, count })),
    }
  },

  async highlights(): Promise<Highlight[]> {
    await delay()
    return MOCK_HIGHLIGHTS
  },
}
