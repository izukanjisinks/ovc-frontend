import type { SystemUser, SystemUserPayload, PaginatedUsers } from '@/types/user'

function delay(ms = 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function now(): string {
  return new Date().toISOString()
}

function uuid(): string {
  return crypto.randomUUID()
}

const MOCK_USERS: SystemUser[] = [
  {
    id: '1',
    full_name: 'Admin User',
    email: 'admin@ovc.edu',
    role: 'admin',
    status: 'active',
    last_login: '2025-04-20T08:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    full_name: 'Grace Mwale',
    email: 'staff@ovc.edu',
    role: 'user',
    status: 'active',
    last_login: '2025-04-19T14:00:00Z',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: '3',
    full_name: 'Patrick Banda',
    email: 'inspector@ovc.edu',
    role: 'inspector',
    status: 'active',
    last_login: undefined,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
]

export const mockUsersApi = {
  async list(params?: { page?: number; page_size?: number; search?: string }): Promise<PaginatedUsers> {
    await delay()
    const page = params?.page ?? 1
    const pageSize = params?.page_size ?? 50
    let results = [...MOCK_USERS]
    if (params?.search) {
      const q = params.search.toLowerCase()
      results = results.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
      )
    }
    const start = (page - 1) * pageSize
    return {
      data: results.slice(start, start + pageSize),
      page,
      page_size: pageSize,
      total: results.length,
    }
  },

  async get(id: string): Promise<SystemUser> {
    await delay()
    const found = MOCK_USERS.find(u => u.id === id)
    if (!found) throw { error: { code: 'NOT_FOUND', message: 'User not found.' } }
    return { ...found }
  },

  async create(payload: SystemUserPayload): Promise<SystemUser> {
    await delay()
    const existing = MOCK_USERS.find(u => u.email === payload.email)
    if (existing) throw { error: { code: 'CONFLICT', message: 'A user with that email already exists.' } }
    const user: SystemUser = {
      id: uuid(),
      full_name: payload.full_name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      created_at: now(),
      updated_at: now(),
    }
    MOCK_USERS.push(user)
    return user
  },

  async update(id: string, payload: Partial<SystemUserPayload>): Promise<SystemUser> {
    await delay()
    const idx = MOCK_USERS.findIndex(u => u.id === id)
    if (idx === -1) throw { error: { code: 'NOT_FOUND', message: 'User not found.' } }
    MOCK_USERS[idx] = { ...MOCK_USERS[idx]!, ...payload, updated_at: now() }
    return { ...MOCK_USERS[idx]! }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = MOCK_USERS.findIndex(u => u.id === id)
    if (idx !== -1) MOCK_USERS.splice(idx, 1)
  },

  async lock(id: string): Promise<void> {
    await delay()
    const idx = MOCK_USERS.findIndex(u => u.id === id)
    if (idx !== -1) MOCK_USERS[idx]!.is_locked = true
  },

  async unlock(id: string): Promise<void> {
    await delay()
    const idx = MOCK_USERS.findIndex(u => u.id === id)
    if (idx !== -1) MOCK_USERS[idx]!.is_locked = false
  },
}
