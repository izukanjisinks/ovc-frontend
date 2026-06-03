import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/auth'

const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  home:             ['admin', 'user', 'inspector'],
  children:         ['admin', 'user', 'inspector'],
  'children-new':   ['admin', 'user'],
  'children-edit':  ['admin', 'user'],
  'children-detail':['admin', 'user', 'inspector'],
  reports:          ['admin', 'user', 'inspector'],
  'reports-new':    ['admin', 'user'],
  'reports-edit':   ['admin', 'user'],
  users:            ['admin'],
  setup:            ['admin'],
  about:            ['admin', 'user', 'inspector'],
}

export function usePermissions() {
  const authStore = useAuthStore()

  const role = computed(() => authStore.userRole as UserRole | null)

  function canAccess(routeName: string): boolean {
    if (!role.value) return false
    const allowed = ROUTE_PERMISSIONS[routeName]
    if (!allowed) return true
    return allowed.includes(role.value)
  }

  return { canAccess }
}
