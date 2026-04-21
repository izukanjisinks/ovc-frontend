import type { ChildCategory } from '@/types/child'

export const MOCK_CATEGORIES: ChildCategory[] = [
  { id: 1, name: 'SINGLE ORPHAN' },
  { id: 2, name: 'DOUBLE ORPHAN' },
  { id: 3, name: 'EXTENDED FAMILY UNABLE TO MEET SCHOOL COST' },
  { id: 4, name: 'CHILD HEADED HOUSEHOLD' },
  { id: 5, name: 'ELDERLY PERSON HEADED HOUSEHOLDS AGED 65' },
  { id: 6, name: 'PARENT WITH NO RELIABLE SOURCE OF INCOME' },
  { id: 7, name: 'ON SCHOOL RE-ENTRY PROGRAM WITHOUT FAMILY SUPPORT' },
  { id: 8, name: 'POOR AS DEFINED BY CWAC' },
]

export const mockCategoriesApi = {
  async list(): Promise<ChildCategory[]> {
    return MOCK_CATEGORIES
  },
}
