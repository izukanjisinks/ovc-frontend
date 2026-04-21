<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Pencil, ArrowLeft, Loader2, User, Phone, MapPin, BookOpen, Tag, ShoppingBag, Users } from 'lucide-vue-next'
import { useChildrenStore } from '@/stores/children'
import { useAuthStore } from '@/stores/auth'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const route = useRoute()
const router = useRouter()
const store = useChildrenStore()
const authStore = useAuthStore()

const canEdit = computed(() => authStore.userRole === 'admin' || authStore.userRole === 'user')

onMounted(() => store.fetchChild(route.params.id as string))

const child = computed(() => store.selected)

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

const checkedRequisites = computed(() => child.value?.requisites.filter(r => r.checked) ?? [])
const totalCost = computed(() =>
  checkedRequisites.value.reduce((sum, r) => sum + r.price_per_item * r.quantity, 0),
)
</script>

<template>
  <DashboardHeader title="Child Record" />

  <div class="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">

    <!-- Loading -->
    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <Loader2 class="size-6 animate-spin text-muted-foreground" />
    </div>

    <!-- Not found -->
    <div v-else-if="!child" class="py-16 text-center text-muted-foreground">
      Child record not found.
    </div>

    <template v-else>
      <!-- Header row -->
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="icon" @click="router.push({ name: 'children' })">
            <ArrowLeft class="size-4" />
          </Button>
          <div class="flex items-center gap-4">
            <div v-if="child.image_url" class="size-16 rounded-full overflow-hidden">
              <img :src="child.image_url" :alt="`${child.first_name} ${child.last_name}`" class="w-full h-full object-cover" />
            </div>
            <div v-else class="size-16 rounded-full bg-primary/10 text-primary text-xl font-bold flex items-center justify-center">
              {{ getInitials(child.first_name, child.last_name) }}
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ child.first_name }} {{ child.last_name }}</h2>
              <p class="text-muted-foreground font-mono text-sm">{{ child.pupil_id }}</p>
              <p class="text-muted-foreground text-sm">Class {{ child.class_name }}</p>
            </div>
          </div>
        </div>

        <Button v-if="canEdit" @click="router.push({ name: 'children-edit', params: { id: child.id } })">
          <Pencil class="size-4 mr-2" />
          Edit Record
        </Button>
      </div>

      <div class="grid gap-6 md:grid-cols-2">

        <!-- Child Info -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <User class="size-4" /> Child Details
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Full Name</span>
              <span class="font-medium">{{ child.first_name }} {{ child.last_name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Pupil ID</span>
              <span class="font-mono">{{ child.pupil_id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Class</span>
              <span>{{ child.class_name }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-muted-foreground shrink-0">Address</span>
              <span class="text-right">{{ child.address }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- Guardian Info -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <Users class="size-4" /> Guardian Details
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-3 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Full Name</span>
              <span class="font-medium">{{ child.guardian_first_name }} {{ child.guardian_last_name }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-muted-foreground shrink-0">Address</span>
              <span class="text-right">{{ child.guardian_address }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Phone</span>
              <span>{{ child.guardian_phone }}</span>
            </div>
          </CardContent>
        </Card>

        <!-- OVC Categories -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <Tag class="size-4" /> OVC Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="child.categories.length === 0" class="text-sm text-muted-foreground">
              No categories assigned.
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <Badge v-for="cat in child.categories" :key="cat.id" variant="secondary" class="text-xs">
                {{ cat.name }}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <!-- Sponsors -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <BookOpen class="size-4" /> Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="child.sponsors.length === 0" class="text-sm text-muted-foreground">
              No sponsors assigned.
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <Badge v-for="sp in child.sponsors" :key="sp.id" variant="outline" class="text-xs">
                {{ sp.name }}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Requisites -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-base">
            <ShoppingBag class="size-4" /> School Requisites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="checkedRequisites.length === 0" class="text-sm text-muted-foreground">
            No requisites assigned.
          </div>
          <div v-else>
            <div class="grid grid-cols-4 text-xs text-muted-foreground font-medium px-2 pb-2 border-b mb-1">
              <span class="col-span-2">Item</span>
              <span class="text-center">Qty</span>
              <span class="text-right">Cost (ZMW)</span>
            </div>
            <div
              v-for="req in checkedRequisites"
              :key="req.id"
              class="grid grid-cols-4 text-sm px-2 py-2 rounded hover:bg-muted/40"
            >
              <span class="col-span-2 font-medium">{{ req.name }}</span>
              <span class="text-center text-muted-foreground">{{ req.quantity }}</span>
              <span class="text-right">{{ (req.price_per_item * req.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="grid grid-cols-4 text-sm px-2 py-2 border-t mt-1 font-semibold">
              <span class="col-span-2">Total</span>
              <span></span>
              <span class="text-right">{{ totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </template>
  </div>
</template>
