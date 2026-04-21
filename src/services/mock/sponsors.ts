import type { ChildSponsor } from '@/types/child'

export const MOCK_SPONSORS: ChildSponsor[] = [
  { id: 1, name: 'GOVERNMENT REPUBLIC OF ZAMBIA (GRZ)' },
  { id: 2, name: 'NON GOVERNMENTAL ORGANIZATION (NGO)' },
  { id: 3, name: 'OTHER SPONSORS' },
]

export const mockSponsorsApi = {
  async list(): Promise<ChildSponsor[]> {
    return MOCK_SPONSORS
  },
}
