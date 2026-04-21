import type { LoginCredentials, LoginResponse, AuthUser } from '@/types/auth'

const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    user_id: '1',
    email: 'admin@ovc.edu',
    password: 'password',
    full_name: 'Admin User',
    role: { role_id: '1', name: 'admin' },
    created_at: '2025-01-01T00:00:00Z',
    change_password: false,
    is_active: true,
  },
  {
    user_id: '2',
    email: 'staff@ovc.edu',
    password: 'password',
    full_name: 'Grace Mwale',
    role: { role_id: '2', name: 'user' },
    created_at: '2025-01-01T00:00:00Z',
    change_password: false,
    is_active: true,
  },
]

function delay(ms = 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockAuthApi = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await delay()
    const found = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password,
    )
    if (!found) {
      throw { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }
    }
    const { password: _, ...user } = found
    return {
      token: `mock-jwt-${user.user_id}`,
      expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
      user,
    }
  },

  async me(): Promise<AuthUser> {
    await delay(200)
    const token = localStorage.getItem('ovc_token')
    const userId = token?.replace('mock-jwt-', '')
    const found = MOCK_USERS.find(u => u.user_id === userId)
    if (!found) throw { error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } }
    const { password: _, ...user } = found
    return user
  },

  async logout(): Promise<void> {
    await delay(200)
  },
}
