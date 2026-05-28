<script setup lang="ts">
import { computed, ref } from 'vue'
import ovcLogo from '@/assets/logo/ovc_logo.png'
import {
  LayoutDashboard,
  Users,
  FileText,
  Info,
  LogOut,
  ChevronUp,
  User2,
} from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/composables/usePermissions'
import AccessDeniedDialog from '@/components/layout/AccessDeniedDialog.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { canAccess } = usePermissions()

const accessDeniedOpen = ref(false)

function navigate(routeName: string) {
  if (!canAccess(routeName)) {
    accessDeniedOpen.value = true
    return
  }
  router.push({ name: routeName })
}

const navGroups = computed(() => [
  {
    label: 'Main',
    items: [
      { title: 'Home', icon: LayoutDashboard, routeName: 'home' },
      { title: 'Children', icon: Users, routeName: 'children' },
      { title: 'Reports', icon: FileText, routeName: 'reports' },
    ],
  },
  {
    label: 'System',
    items: [
      ...(authStore.userRole === 'admin'
        ? [{ title: 'System Users', icon: User2, routeName: 'users' }]
        : []),
      { title: 'About', icon: Info, routeName: 'about' },
    ],
  },
])

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <RouterLink :to="{ name: 'home' }">
              <img :src="ovcLogo" alt="OVC Logo" class="size-8 rounded-lg object-contain" />
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">OVC-MIS</span>
                <span class="text-xs text-muted-foreground">{{ authStore.roleLabel }}</span>
              </div>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup v-for="group in navGroups" :key="group.label">
        <SidebarGroupLabel>{{ group.label }}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in group.items" :key="item.title">
              <SidebarMenuButton
                :tooltip="item.title"
                :is-active="route.name === item.routeName"
                @click="navigate(item.routeName)"
              >
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton size="lg">
                <User2 class="size-4" />
                <div class="flex flex-col gap-0.5 leading-none text-left overflow-hidden">
                  <span class="truncate font-medium text-sm">{{ authStore.user?.full_name || authStore.user?.email }}</span>
                  <span class="truncate text-xs text-muted-foreground">{{ authStore.roleLabel }}</span>
                </div>
                <ChevronUp class="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-(--reka-dropdown-menu-trigger-width)">
              <DropdownMenuItem
                @click="handleLogout"
                class="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut class="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>

    <SidebarRail />
  </Sidebar>

  <AccessDeniedDialog v-model:open="accessDeniedOpen" />
</template>
