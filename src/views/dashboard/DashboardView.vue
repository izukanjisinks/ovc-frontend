<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, FileText, BookOpen, ArrowRight, Loader2 } from 'lucide-vue-next'
import { VisSingleContainer, VisDonut } from '@unovis/vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const router = useRouter()
const store = useDashboardStore()
const authStore = useAuthStore()

const GREEN_PALETTE = [
  '#166534', '#15803d', '#16a34a', '#22c55e',
  '#4ade80', '#86efac', '#bbf7d0', '#dcfce7',
]

onMounted(() => store.fetchStats())

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const firstName = computed(() => {
  const name = authStore.user?.full_name ?? authStore.user?.email ?? ''
  return name.split(' ')[0] ?? name
})

type ChartDatum = { name: string; count: number }

const categoryValue = (d: ChartDatum) => d.count
const sponsorValue  = (d: ChartDatum) => d.count
const categoryColor = (_d: ChartDatum, i: number) => GREEN_PALETTE[i % GREEN_PALETTE.length]!
const sponsorColor  = (_d: ChartDatum, i: number) => GREEN_PALETTE[i % GREEN_PALETTE.length]!
</script>

<template>
  <DashboardHeader title="Home" />

  <div class="flex flex-col gap-8 p-6 max-w-5xl mx-auto w-full">

    <!-- Welcome banner -->
    <div class="rounded-xl bg-primary px-8 py-6 text-primary-foreground flex flex-col gap-1">
      <p class="text-sm opacity-80">{{ greeting }},</p>
      <h1 class="text-2xl font-bold">{{ firstName }}</h1>
      <p class="text-sm opacity-70 mt-1">Helen Kaunda Secondary School — OVC Management System</p>
    </div>

    <!-- Stats cards -->
    <div v-if="store.loading" class="flex items-center justify-center py-16">
      <Loader2 class="size-6 animate-spin text-muted-foreground" />
    </div>

    <template v-else-if="store.stats">
      <!-- Summary row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Total children -->
        <Card class="border-l-4 border-l-primary">
          <CardContent class="pt-6 flex items-center gap-4">
            <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users class="size-6 text-primary" />
            </div>
            <div>
              <p class="text-3xl font-bold">{{ store.stats.total_children }}</p>
              <p class="text-sm text-muted-foreground">Registered Children</p>
            </div>
          </CardContent>
        </Card>

        <!-- Category breakdown count -->
        <Card class="border-l-4 border-l-emerald-500">
          <CardContent class="pt-6 flex items-center gap-4">
            <div class="size-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <BookOpen class="size-6 text-emerald-600" />
            </div>
            <div>
              <p class="text-3xl font-bold">{{ store.stats.by_category.length }}</p>
              <p class="text-sm text-muted-foreground">OVC Categories</p>
            </div>
          </CardContent>
        </Card>

        <!-- Sponsor count -->
        <Card class="border-l-4 border-l-green-400">
          <CardContent class="pt-6 flex items-center gap-4">
            <div class="size-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <FileText class="size-6 text-green-600" />
            </div>
            <div>
              <p class="text-3xl font-bold">{{ store.stats.by_sponsor.length }}</p>
              <p class="text-sm text-muted-foreground">Active Sponsors</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- By Category -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Children by Category</CardTitle>
            <CardDescription>Distribution across OVC vulnerability categories</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col items-center gap-4">
            <VisSingleContainer :data="store.stats.by_category" :height="200">
              <VisDonut
                :value="categoryValue"
                :color="categoryColor"
                :arc-width="28"
                :central-label="String(store.stats.total_children)"
                central-sub-label="Children"
              />
            </VisSingleContainer>
            <!-- Legend -->
            <div class="flex flex-col gap-1.5 w-full">
              <div
                v-for="(item, i) in store.stats.by_category"
                :key="item.name"
                class="flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="size-3 rounded-sm shrink-0"
                    :style="{ backgroundColor: GREEN_PALETTE[i % GREEN_PALETTE.length] }"
                  />
                  <span class="text-muted-foreground truncate max-w-45">{{ item.name }}</span>
                </div>
                <Badge variant="secondary" class="shrink-0">{{ item.count }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- By Sponsor -->
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-base">Children by Sponsor</CardTitle>
            <CardDescription>Funding source breakdown for registered children</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col items-center gap-4">
            <VisSingleContainer :data="store.stats.by_sponsor" :height="200">
              <VisDonut
                :value="sponsorValue"
                :color="sponsorColor"
                :arc-width="28"
                :central-label="String(store.stats.total_children)"
                central-sub-label="Children"
              />
            </VisSingleContainer>
            <!-- Legend -->
            <div class="flex flex-col gap-1.5 w-full">
              <div
                v-for="(item, i) in store.stats.by_sponsor"
                :key="item.name"
                class="flex items-center justify-between text-sm"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="size-3 rounded-sm shrink-0"
                    :style="{ backgroundColor: GREEN_PALETTE[i % GREEN_PALETTE.length] }"
                  />
                  <span class="text-muted-foreground truncate max-w-45">{{ item.name }}</span>
                </div>
                <Badge variant="secondary" class="shrink-0">{{ item.count }}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <!-- Quick links -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card class="cursor-pointer hover:bg-muted/40 transition-colors" @click="router.push({ name: 'children' })">
          <CardContent class="pt-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Users class="size-5 text-primary" />
              <div>
                <p class="font-medium text-sm">Manage Children</p>
                <p class="text-xs text-muted-foreground">View and update registered OVC beneficiaries</p>
              </div>
            </div>
            <ArrowRight class="size-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card class="cursor-pointer hover:bg-muted/40 transition-colors" @click="router.push({ name: 'reports' })">
          <CardContent class="pt-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <FileText class="size-5 text-primary" />
              <div>
                <p class="font-medium text-sm">Term Reports</p>
                <p class="text-xs text-muted-foreground">Create and download OVC grant reports</p>
              </div>
            </div>
            <ArrowRight class="size-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

    </template>

    <!-- Error state -->
    <div v-else-if="store.error" class="text-center py-16 text-muted-foreground text-sm">
      {{ store.error }}
    </div>

  </div>
</template>
