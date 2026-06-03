import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    roles?: UserRole[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresAuth: false, guestOnly: true },
    },

    // Authenticated — all share the sidebar layout
    {
      path: '/',
      component: () => import('@/layouts/AuthenticatedLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/home',
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'children',
          name: 'children',
          component: () => import('@/views/admin/children/ChildrenView.vue'),
          meta: { roles: ['admin', 'user'] },
        },
        {
          path: 'children/new',
          name: 'children-new',
          component: () => import('@/views/admin/children/AddEditChildView.vue'),
          meta: { roles: ['admin', 'user'] },
        },
        {
          path: 'children/:id/edit',
          name: 'children-edit',
          component: () => import('@/views/admin/children/AddEditChildView.vue'),
          meta: { roles: ['admin', 'user'] },
        },
        {
          path: 'children/:id',
          name: 'children-detail',
          component: () => import('@/views/admin/children/ChildDetailView.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/admin/reports/ReportsView.vue'),
          meta: { roles: ['admin', 'user'] },
        },
        {
          path: 'reports/new',
          name: 'reports-new',
          component: () => import('@/views/admin/reports/AddEditReportView.vue'),
          meta: { roles: ['admin', 'user'] },
        },
        {
          path: 'reports/:id/edit',
          name: 'reports-edit',
          component: () => import('@/views/admin/reports/AddEditReportView.vue'),
          meta: { roles: ['admin', 'user'] },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/admin/users/UsersView.vue'),
          meta: { roles: ['admin'] },
        },
        {
          path: 'setup',
          name: 'setup',
          component: () => import('@/views/admin/setup/SetupView.vue'),
          meta: { roles: ['admin'] },
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/about/AboutView.vue'),
        },
      ],
    },

    // Catch-all
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home',
    },
  ],
})

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser()
  }

  const requiresAuth = to.meta.requiresAuth !== false
  const guestOnly = to.meta.guestOnly === true
  const roles = to.meta.roles

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (guestOnly && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  if (roles && authStore.userRole && !roles.includes(authStore.userRole)) {
    return { name: 'home' }
  }
})

export default router
