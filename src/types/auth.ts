export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string
  role_id: string
  created_at: string
  updated_at: string
}

export type UserRole = 'admin' | 'user' | 'inspector'

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: string[]
  }
}
