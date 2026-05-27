import type { ApiError } from '@/types/auth'
import { useForbiddenHandler } from '@/composables/useForbiddenHandler'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api/v1'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface RequestOptions {
  body?: unknown
  requiresAuth?: boolean
  params?: Record<string, string | number | boolean | undefined>
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, requiresAuth = true, params } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (requiresAuth) {
    const token = localStorage.getItem('ovc_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  let url = `${BASE_URL}${path}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    if (response.status === 403) {
      const { showForbidden } = useForbiddenHandler()
      const pathParts = path.split('/').filter(Boolean)
      const resourceName = pathParts[pathParts.length - 1]
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
      showForbidden(resourceName)
    }

    const errorData: ApiError = await response.json().catch(() => ({
      error: { code: 'UNKNOWN_ERROR', message: `HTTP ${response.status}` },
    }))
    throw errorData
  }

  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json()
  return (json && typeof json === 'object' && 'data' in json ? json.data : json) as T
}

export const apiClient = {
  get: <T>(path: string, options?: { requiresAuth?: boolean; params?: Record<string, string | number | boolean | undefined> }) =>
    request<T>('GET', path, { requiresAuth: options?.requiresAuth, params: options?.params }),

  post: <T>(path: string, body?: unknown, requiresAuth = true) =>
    request<T>('POST', path, { body, requiresAuth }),

  put: <T>(path: string, body?: unknown, requiresAuth = true) =>
    request<T>('PUT', path, { body, requiresAuth }),

  patch: <T>(path: string, body?: unknown, requiresAuth = true) =>
    request<T>('PATCH', path, { body, requiresAuth }),

  delete: <T>(path: string, requiresAuth = true) =>
    request<T>('DELETE', path, { requiresAuth }),
}
