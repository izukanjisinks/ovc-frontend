import type { ChildRequisite } from '@/types/child'

export const MOCK_REQUISITES: Omit<ChildRequisite, 'checked' | 'quantity' | 'price_per_item'>[] = [
  { id: 1, name: 'SCHOOL UNIFORM' },
  { id: 2, name: 'SCHOOL BAGS' },
  { id: 3, name: 'SANITARY TOWELS' },
  { id: 4, name: 'NOTE BOOKS' },
  { id: 5, name: 'PENS AND PENCILS' },
  { id: 6, name: 'MATHEMATICAL SETS' },
  { id: 7, name: 'CALCULATORS' },
  { id: 8, name: 'TEXT BOOKS' },
]

export const mockRequisitesApi = {
  async list(): Promise<typeof MOCK_REQUISITES> {
    return MOCK_REQUISITES
  },
}
