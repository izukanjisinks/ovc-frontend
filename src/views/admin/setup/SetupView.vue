<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-vue-next'
import { lookupsApi } from '@/services/api/lookups'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import type { ChildCategory, ChildSponsor } from '@/types/child'
import type { LookupRequisite } from '@/services/api/lookups'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'

type Tab = 'categories' | 'requisites' | 'sponsors'

const tab = ref<Tab>('categories')
const loading = ref(false)
const confirmDialog = useConfirmDialog()

// Data
const categories = ref<ChildCategory[]>([])
const requisites = ref<LookupRequisite[]>([])
const sponsors = ref<ChildSponsor[]>([])

// Dialog state
const dialogOpen = ref(false)
const dialogSaving = ref(false)
const editingId = ref<string | null>(null)
const formName = ref('')
const formPrice = ref(0)

const dialogTitle = computed(() => {
  const action = editingId.value ? 'Edit' : 'Add'
  if (tab.value === 'categories') return `${action} Category`
  if (tab.value === 'requisites') return `${action} Requisite`
  return `${action} Sponsor`
})

const tabs: { key: Tab; label: string }[] = [
  { key: 'categories', label: 'OVC Categories' },
  { key: 'requisites', label: 'Requisites' },
  { key: 'sponsors', label: 'Sponsors' },
]

async function load() {
  loading.value = true
  try {
    const [cats, reqs, spons] = await Promise.all([
      lookupsApi.categories(),
      lookupsApi.requisites(),
      lookupsApi.sponsors(),
    ])
    categories.value = cats ?? []
    requisites.value = reqs ?? []
    sponsors.value = spons ?? []
  } catch {
    toast.error('Failed to load setup data.')
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openAdd() {
  editingId.value = null
  formName.value = ''
  formPrice.value = 0
  dialogOpen.value = true
}

function openEdit(item: ChildCategory | LookupRequisite | ChildSponsor) {
  editingId.value = item.id
  formName.value = item.name
  formPrice.value = (item as LookupRequisite).default_price ?? 0
  dialogOpen.value = true
}

async function save() {
  if (!formName.value.trim()) return
  dialogSaving.value = true
  try {
    if (tab.value === 'categories') {
      if (editingId.value) {
        const updated = await lookupsApi.updateCategory(editingId.value, formName.value.trim())
        const idx = categories.value.findIndex(c => c.id === editingId.value)
        if (idx !== -1) categories.value[idx] = updated
      } else {
        const created = await lookupsApi.createCategory(formName.value.trim())
        categories.value.push(created)
      }
    } else if (tab.value === 'requisites') {
      if (editingId.value) {
        const updated = await lookupsApi.updateRequisite(editingId.value, formName.value.trim(), formPrice.value)
        const idx = requisites.value.findIndex(r => r.id === editingId.value)
        if (idx !== -1) requisites.value[idx] = updated
      } else {
        const created = await lookupsApi.createRequisite(formName.value.trim(), formPrice.value)
        requisites.value.push(created)
      }
    } else {
      if (editingId.value) {
        const updated = await lookupsApi.updateSponsor(editingId.value, formName.value.trim())
        const idx = sponsors.value.findIndex(s => s.id === editingId.value)
        if (idx !== -1) sponsors.value[idx] = updated
      } else {
        const created = await lookupsApi.createSponsor(formName.value.trim())
        sponsors.value.push(created)
      }
    }
    toast.success(editingId.value ? 'Updated.' : 'Created.')
    dialogOpen.value = false
  } catch {
    toast.error('Failed to save.')
  } finally {
    dialogSaving.value = false
  }
}

async function remove(item: ChildCategory | LookupRequisite | ChildSponsor) {
  const confirmed = await confirmDialog.confirm({
    title: 'Delete',
    description: `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'destructive',
  })
  if (!confirmed) return
  try {
    if (tab.value === 'categories') {
      await lookupsApi.deleteCategory(item.id)
      categories.value = categories.value.filter(c => c.id !== item.id)
    } else if (tab.value === 'requisites') {
      await lookupsApi.deleteRequisite(item.id)
      requisites.value = requisites.value.filter(r => r.id !== item.id)
    } else {
      await lookupsApi.deleteSponsor(item.id)
      sponsors.value = sponsors.value.filter(s => s.id !== item.id)
    }
    toast.success('Deleted.')
  } catch {
    toast.error('Failed to delete.')
  }
}

const currentItems = computed(() => {
  if (tab.value === 'categories') return categories.value
  if (tab.value === 'requisites') return requisites.value
  return sponsors.value
})
</script>

<template>
  <DashboardHeader title="System Setup" />

  <div class="flex flex-col gap-6 p-6">

    <!-- Tabs -->
    <Tabs :model-value="tab" @update:model-value="tab = $event as Tab">
      <TabsList>
        <TabsTrigger v-for="t in tabs" :key="t.key" :value="t.key">
          {{ t.label }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <!-- Content card -->
    <div class="rounded-xl border bg-card overflow-hidden">

      <!-- Card toolbar -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 class="text-base font-semibold">{{ tabs.find(t => t.key === tab)?.label }}</h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            <template v-if="tab === 'categories'">OVC vulnerability categories assigned to children.</template>
            <template v-else-if="tab === 'requisites'">School supply items with default prices.</template>
            <template v-else>Funding sources assigned to children.</template>
          </p>
        </div>
        <Button size="sm" @click="openAdd">
          <Plus class="size-4 mr-1.5" />
          Add {{ tab === 'categories' ? 'Category' : tab === 'requisites' ? 'Requisite' : 'Sponsor' }}
        </Button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <Loader2 class="size-5 animate-spin text-muted-foreground" />
      </div>

      <!-- Empty -->
      <div v-else-if="currentItems.length === 0" class="py-16 text-center text-sm text-muted-foreground">
        No {{ tabs.find(t => t.key === tab)?.label.toLowerCase() }} yet.
      </div>

      <!-- Table -->
      <table v-else class="w-full text-sm">
        <thead class="bg-muted/40 text-xs text-muted-foreground uppercase tracking-wide">
          <tr>
            <th class="px-6 py-3 text-left font-medium">Name</th>
            <th v-if="tab === 'requisites'" class="px-6 py-3 text-left font-medium">Default Price (ZMW)</th>
            <th class="px-6 py-3 text-right font-medium w-32">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr v-for="item in currentItems" :key="item.id" class="hover:bg-muted/30 transition-colors">
            <td class="px-6 py-3 font-medium">{{ item.name }}</td>
            <td v-if="tab === 'requisites'" class="px-6 py-3 text-muted-foreground">
              {{ (item as LookupRequisite).default_price?.toFixed(2) }}
            </td>
            <td class="px-6 py-3 text-right">
              <div class="flex justify-end gap-1">
                <Button variant="ghost" size="icon" class="size-8" @click="openEdit(item)">
                  <Pencil class="size-4" />
                </Button>
                <Button variant="ghost" size="icon" class="size-8 text-destructive hover:text-destructive" @click="remove(item)">
                  <Trash2 class="size-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>

  <!-- Add/Edit Dialog -->
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
      </DialogHeader>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-2">
          <Label>Name <span class="text-destructive">*</span></Label>
          <Input v-model="formName" placeholder="Enter name..." @keydown.enter="save" />
        </div>
        <div v-if="tab === 'requisites'" class="flex flex-col gap-2">
          <Label>Default Price (ZMW)</Label>
          <Input v-model.number="formPrice" type="number" min="0" placeholder="0.00" />
        </div>
      </div>
      <DialogFooter class="gap-2">
        <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
        <Button :disabled="!formName.trim() || dialogSaving" @click="save">
          <Loader2 v-if="dialogSaving" class="size-4 mr-2 animate-spin" />
          {{ editingId ? 'Save Changes' : 'Create' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
