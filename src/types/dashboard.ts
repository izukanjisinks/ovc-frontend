export interface DashboardStats {
  total_children: number
  by_category: { category: string; count: number }[]
  by_sponsor: { sponsor: string; count: number }[]
}

export interface Highlight {
  id: string
  image_url: string
  caption?: string
  term?: string
  year?: number
}
