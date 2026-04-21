<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, FileText, BookOpen, ArrowRight, Loader2 } from 'lucide-vue-next'
import { VisSingleContainer, VisDonut, VisXYContainer, VisGroupedBar, VisAxis } from '@unovis/vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

// Bar chart (category)
const barCount  = (d: ChartDatum) => d.count
const barColor  = (_d: ChartDatum, i: number) => GREEN_PALETTE[i % GREEN_PALETTE.length]!

// Donut chart (sponsor)
const sponsorValue  = (d: ChartDatum) => d.count
const sponsorColor  = (_d: ChartDatum, i: number) => GREEN_PALETTE[i % GREEN_PALETTE.length]!
</script>

<template>
  <DashboardHeader title="Home" />

  <div class="flex flex-col gap-8 p-6">

    <!-- Page heading -->
    <div>
      <h2 class="text-2xl font-bold tracking-tight">System Overview</h2>
      <p class="text-muted-foreground text-sm mt-1">
        {{ greeting }}, {{ firstName }}. Real-time tracking for OVC support initiatives.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex items-center justify-center py-24">
      <Loader2 class="size-6 animate-spin text-muted-foreground" />
    </div>

    <template v-else-if="store.stats">

      <!-- Stats row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Registered Children</p>
                <p class="text-4xl font-bold mt-1">{{ store.stats.total_children }}</p>
                <p class="text-xs text-muted-foreground mt-2">Active beneficiaries</p>
              </div>
              <div class="size-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users class="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-muted-foreground">OVC Categories</p>
                <p class="text-4xl font-bold mt-1">{{ store.stats.by_category.length }}</p>
                <p class="text-xs text-muted-foreground mt-2">Diversity in support needs</p>
              </div>
              <div class="size-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <BookOpen class="size-5 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Active Sponsors</p>
                <p class="text-4xl font-bold mt-1">{{ store.stats.by_sponsor.length }}</p>
                <p class="text-xs text-muted-foreground mt-2">Funding sources</p>
              </div>
              <div class="size-11 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <FileText class="size-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

        <!-- By Category — vertical bar chart -->
        <Card>
          <CardHeader class="pb-0">
            <CardTitle class="text-base font-semibold">Children by Category</CardTitle>
          </CardHeader>
          <CardContent class="pt-2 pb-4">
            <VisXYContainer
              :data="store.stats.by_category"
              :height="260"
              :margin="{ left: 28, right: 8, top: 8, bottom: 24 }"
            >
              <VisGroupedBar
                :x="(_d: ChartDatum, i: number) => i"
                :y="[barCount]"
                :color="barColor"
                :rounded-corners="3"
                :bar-padding="0.1"
                :group-padding="0.2"
              />
              <VisAxis
                type="x"
                :tick-format="(_v: number, i: number) => String(i + 1)"
                :grid-line="false"
                :tick-line="false"
                :num-ticks="store.stats.by_category.length"
              />
              <VisAxis
                type="y"
                :grid-line="true"
                :tick-line="false"
                :num-ticks="4"
              />
            </VisXYContainer>
            <!-- Numbered legend -->
            <div class="flex flex-col gap-1 mt-3">
              <div
                v-for="(item, i) in store.stats.by_category"
                :key="item.name"
                class="flex items-center gap-2 text-xs"
              >
                <span
                  class="size-4 rounded flex items-center justify-center text-white font-bold shrink-0 text-[10px]"
                  :style="{ backgroundColor: GREEN_PALETTE[i % GREEN_PALETTE.length] }"
                >{{ i + 1 }}</span>
                <span class="text-muted-foreground">{{ item.name }}</span>
                <span class="font-medium ml-auto">{{ item.count }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- By Sponsor -->
        <Card>
          <CardHeader class="pb-0">
            <CardTitle class="text-base font-semibold">Children by Sponsor</CardTitle>
          </CardHeader>
          <CardContent class="pt-4 flex flex-col items-center gap-4">
            <!-- Donut centered -->
            <VisSingleContainer :data="store.stats.by_sponsor" :height="260">
              <VisDonut
                :value="sponsorValue"
                :color="sponsorColor"
                :arc-width="36"
                :central-label="String(store.stats.total_children)"
                central-sub-label="TOTAL"
              />
            </VisSingleContainer>
            <!-- Legend below -->
            <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 w-full">
              <div
                v-for="(item, i) in store.stats.by_sponsor"
                :key="item.name"
                class="flex items-center gap-1.5 text-sm"
              >
                <span
                  class="size-2.5 rounded-full shrink-0"
                  :style="{ backgroundColor: GREEN_PALETTE[i % GREEN_PALETTE.length] }"
                />
                <span class="text-muted-foreground">{{ item.name }}</span>
                <span class="font-medium">{{ item.count }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <!-- Quick actions -->
      <div>
        <h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">System Actions</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Card
            class="cursor-pointer hover:bg-muted/40 transition-colors"
            @click="router.push({ name: 'children' })"
          >
            <CardContent class="pt-6 flex items-center gap-4">
              <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Users class="size-5 text-primary" />
              </div>
              <div>
                <p class="font-semibold text-sm">Manage Children</p>
                <p class="text-xs text-muted-foreground mt-0.5">View, register, and update OVC beneficiary profiles.</p>
              </div>
            </CardContent>
          </Card>

          <Card
            class="cursor-pointer hover:bg-muted/40 transition-colors"
            @click="router.push({ name: 'reports' })"
          >
            <CardContent class="pt-6 flex items-center gap-4">
              <div class="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText class="size-5 text-primary" />
              </div>
              <div>
                <p class="font-semibold text-sm">Term Reports</p>
                <p class="text-xs text-muted-foreground mt-0.5">Generate automated summary reports for donor compliance.</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

    </template>

    <!-- Error state -->
    <div v-else-if="store.error" class="text-center py-16 text-muted-foreground text-sm">
      {{ store.error }}
    </div>

  </div>
</template>
