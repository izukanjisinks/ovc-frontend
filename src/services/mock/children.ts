import type { Child, ChildWithRelations, ChildPayload } from '@/types/child'
import { MOCK_CATEGORIES } from './categories'
import { MOCK_REQUISITES } from './requisites'
import { MOCK_SPONSORS } from './sponsors'

function delay(ms = 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function now(): string {
  return new Date().toISOString()
}

function uuid(): string {
  return crypto.randomUUID()
}

const MOCK_CHILDREN: ChildWithRelations[] = [
  {
    id: '1',
    pupil_id: 'HK-2024-001',
    first_name: 'Chanda',
    last_name: 'Mwansa',
    address: 'Plot 12, Ndola',
    class_name: '10A',
    image_url: undefined,
    guardian_first_name: 'Mary',
    guardian_last_name: 'Mwansa',
    guardian_address: 'Plot 12, Ndola',
    guardian_phone: '+260977123456',
    created_by: '1',
    created_at: '2024-02-10T08:00:00Z',
    updated_at: '2024-02-10T08:00:00Z',
    categories: [MOCK_CATEGORIES[0]!, MOCK_CATEGORIES[1]!],
    requisites: [
      { ...MOCK_REQUISITES[0]!, checked: true, quantity: 1, price_per_item: 250 },
      { ...MOCK_REQUISITES[3]!, checked: true, quantity: 3, price_per_item: 15 },
    ],
    sponsors: [MOCK_SPONSORS[0]!],
  },
  {
    id: '2',
    pupil_id: 'HK-2024-002',
    first_name: 'Mutale',
    last_name: 'Banda',
    address: 'House 5, Kitwe',
    class_name: '11B',
    image_url: undefined,
    guardian_first_name: 'Peter',
    guardian_last_name: 'Banda',
    guardian_address: 'House 5, Kitwe',
    guardian_phone: '+260966234567',
    created_by: '2',
    created_at: '2024-02-11T09:00:00Z',
    updated_at: '2024-02-11T09:00:00Z',
    categories: [MOCK_CATEGORIES[2]!],
    requisites: [
      { ...MOCK_REQUISITES[1]!, checked: true, quantity: 1, price_per_item: 120 },
      { ...MOCK_REQUISITES[4]!, checked: true, quantity: 2, price_per_item: 20 },
    ],
    sponsors: [MOCK_SPONSORS[1]!],
  },
  {
    id: '3',
    pupil_id: 'HK-2024-003',
    first_name: 'Natasha',
    last_name: 'Phiri',
    address: 'Area 22, Lusaka',
    class_name: '12C',
    image_url: undefined,
    guardian_first_name: 'Agnes',
    guardian_last_name: 'Phiri',
    guardian_address: 'Area 22, Lusaka',
    guardian_phone: '+260955345678',
    created_by: '1',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
    categories: [MOCK_CATEGORIES[5]!, MOCK_CATEGORIES[7]!],
    requisites: [
      { ...MOCK_REQUISITES[0]!, checked: true, quantity: 1, price_per_item: 250 },
      { ...MOCK_REQUISITES[2]!, checked: true, quantity: 2, price_per_item: 30 },
      { ...MOCK_REQUISITES[6]!, checked: true, quantity: 1, price_per_item: 180 },
    ],
    sponsors: [MOCK_SPONSORS[0]!, MOCK_SPONSORS[2]!],
  },
  {
    id: '4',
    pupil_id: 'HK-2024-004',
    first_name: 'Bwalya',
    last_name: 'Tembo',
    address: 'Chipata Compound, Lusaka',
    class_name: '10B',
    image_url: undefined,
    guardian_first_name: 'John',
    guardian_last_name: 'Tembo',
    guardian_address: 'Chipata Compound, Lusaka',
    guardian_phone: '+260977456789',
    created_by: '2',
    created_at: '2024-03-05T11:00:00Z',
    updated_at: '2024-03-05T11:00:00Z',
    categories: [MOCK_CATEGORIES[3]!],
    requisites: [
      { ...MOCK_REQUISITES[3]!, checked: true, quantity: 4, price_per_item: 15 },
      { ...MOCK_REQUISITES[5]!, checked: true, quantity: 1, price_per_item: 95 },
    ],
    sponsors: [MOCK_SPONSORS[1]!],
  },
  {
    id: '5',
    pupil_id: 'HK-2024-005',
    first_name: 'Chileshe',
    last_name: 'Lungu',
    address: 'Matero, Lusaka',
    class_name: '11A',
    image_url: undefined,
    guardian_first_name: 'Elizabeth',
    guardian_last_name: 'Lungu',
    guardian_address: 'Matero, Lusaka',
    guardian_phone: '+260966567890',
    created_by: '1',
    created_at: '2024-03-10T09:30:00Z',
    updated_at: '2024-03-10T09:30:00Z',
    categories: [MOCK_CATEGORIES[1]!, MOCK_CATEGORIES[6]!],
    requisites: [
      { ...MOCK_REQUISITES[0]!, checked: true, quantity: 1, price_per_item: 250 },
      { ...MOCK_REQUISITES[7]!, checked: true, quantity: 3, price_per_item: 60 },
    ],
    sponsors: [MOCK_SPONSORS[0]!],
  },
]

export const mockChildrenApi = {
  async list(search?: string): Promise<Child[]> {
    await delay()
    const list: Child[] = MOCK_CHILDREN.map(({ categories: _, requisites: __, sponsors: ___, ...c }) => c)
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(c =>
      c.pupil_id.toLowerCase().includes(q) ||
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q),
    )
  },

  async get(id: string): Promise<ChildWithRelations> {
    await delay()
    const found = MOCK_CHILDREN.find(c => c.id === id)
    if (!found) throw { error: { code: 'NOT_FOUND', message: 'Child not found.' } }
    return { ...found }
  },

  async create(payload: ChildPayload): Promise<ChildWithRelations> {
    await delay()
    const child: ChildWithRelations = {
      id: uuid(),
      pupil_id: payload.pupil_id,
      first_name: payload.first_name,
      last_name: payload.last_name,
      address: payload.address,
      class_name: payload.class_name,
      image_url: payload.image_url,
      guardian_first_name: payload.guardian_first_name,
      guardian_last_name: payload.guardian_last_name,
      guardian_address: payload.guardian_address,
      guardian_phone: payload.guardian_phone,
      created_by: '1',
      created_at: now(),
      updated_at: now(),
      categories: MOCK_CATEGORIES.filter(c => payload.category_ids.includes(c.id)),
      requisites: payload.requisites.map(r => ({
        ...MOCK_REQUISITES.find(mr => mr.id === r.id)!,
        checked: r.checked,
        quantity: r.quantity,
        price_per_item: r.price_per_item,
      })),
      sponsors: MOCK_SPONSORS.filter(s => payload.sponsor_ids.includes(s.id)),
    }
    MOCK_CHILDREN.push(child)
    return child
  },

  async update(id: string, payload: Partial<ChildPayload>): Promise<ChildWithRelations> {
    await delay()
    const idx = MOCK_CHILDREN.findIndex(c => c.id === id)
    if (idx === -1) throw { error: { code: 'NOT_FOUND', message: 'Child not found.' } }
    const existing = MOCK_CHILDREN[idx]!
    const updated: ChildWithRelations = {
      ...existing,
      ...payload,
      updated_at: now(),
      categories: payload.category_ids
        ? MOCK_CATEGORIES.filter(c => payload.category_ids!.includes(c.id))
        : existing.categories,
      requisites: payload.requisites
        ? payload.requisites.map(r => ({
            ...MOCK_REQUISITES.find(mr => mr.id === r.id)!,
            checked: r.checked,
            quantity: r.quantity,
            price_per_item: r.price_per_item,
          }))
        : existing.requisites,
      sponsors: payload.sponsor_ids
        ? MOCK_SPONSORS.filter(s => payload.sponsor_ids!.includes(s.id))
        : existing.sponsors,
    }
    MOCK_CHILDREN[idx] = updated
    return updated
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = MOCK_CHILDREN.findIndex(c => c.id === id)
    if (idx !== -1) MOCK_CHILDREN.splice(idx, 1)
  },
}
