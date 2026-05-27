<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { Loader2, ChevronLeft, Search } from 'lucide-vue-next'
import { useReportsStore } from '@/stores/reports'
import { useChildrenStore } from '@/stores/children'
import type { ReportTerm } from '@/types/report'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const router = useRouter()
const route = useRoute()
const store = useReportsStore()
const childrenStore = useChildrenStore()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => isEdit.value ? 'Edit Report' : 'New Report')

const saving = ref(false)
const loading = ref(false)

const form = ref({
  title: '',
  body: '',
  term: '' as ReportTerm | '',
  year: new Date().getFullYear(),
})

// Beneficiaries
const selectedChildIds = ref<string[]>([])
const classFilter = ref<string | undefined>(undefined)
const beneficiarySearch = ref('')

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

const isValid = computed(() =>
  form.value.title.trim() &&
  form.value.body.trim() &&
  form.value.term &&
  form.value.year,
)

// All distinct classes from children list
const availableClasses = computed(() => {
  const classes = new Set(childrenStore.children.map(c => c.class_name))
  return Array.from(classes).sort()
})

// Children filtered by class and search
const filteredChildren = computed(() => {
  let list = childrenStore.children
  if (classFilter.value && classFilter.value !== '__all__') list = list.filter(c => c.class_name === classFilter.value)
  const q = beneficiarySearch.value.toLowerCase().trim()
  if (q) list = list.filter(c =>
    c.pupil_id.toLowerCase().includes(q) ||
    c.first_name.toLowerCase().includes(q) ||
    c.last_name.toLowerCase().includes(q),
  )
  return list
})

function toggleChild(id: string) {
  const idx = selectedChildIds.value.indexOf(id)
  if (idx === -1) selectedChildIds.value.push(id)
  else selectedChildIds.value.splice(idx, 1)
}

onMounted(async () => {
  await childrenStore.fetchChildren()

  if (isEdit.value) {
    loading.value = true
    await store.fetchReport(route.params.id as string)
    const report = store.selected
    if (report) {
      form.value = {
        title: report.title,
        body: report.body,
        term: report.term,
        year: report.year,
      }
      selectedChildIds.value = []
    }
    loading.value = false
  }
})

async function submit() {
  if (!isValid.value || !form.value.term) return
  saving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      body: form.value.body.trim(),
      term: form.value.term,
      year: form.value.year,
    }
    if (isEdit.value) {
      await store.updateReport(route.params.id as string, payload)
      toast.success('Report updated.')
    } else {
      await store.createReport(payload)
      toast.success('Report created.')
    }
    router.push({ name: 'reports' })
  } catch {
    toast.error('Failed to save report.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <DashboardHeader :title="pageTitle" />

  <div class="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">

    <div v-if="loading" class="flex items-center justify-center py-20">
      <Loader2 class="size-6 animate-spin text-muted-foreground" />
    </div>

    <template v-else>
      <!-- Report details card -->
      <Card>
        <CardHeader>
          <CardTitle>{{ pageTitle }}</CardTitle>
          <CardDescription>
            {{ isEdit ? 'Update the report details below.' : 'Fill in the details to create a new term report.' }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-5">

          <div class="flex flex-col gap-2">
            <Label>Title <span class="text-destructive">*</span></Label>
            <Input v-model="form.title" placeholder="e.g. Term 1 OVC Support Report — 2025" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label>Term <span class="text-destructive">*</span></Label>
              <Select
                :model-value="form.term || undefined"
                @update:model-value="form.term = ($event as ReportTerm)"
              >
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TERM_1">Term 1</SelectItem>
                  <SelectItem value="TERM_2">Term 2</SelectItem>
                  <SelectItem value="TERM_3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex flex-col gap-2">
              <Label>Year <span class="text-destructive">*</span></Label>
              <Select
                :model-value="String(form.year)"
                @update:model-value="form.year = Number($event)"
              >
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="y in YEARS" :key="y" :value="String(y)">{{ y }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Label>Report Body <span class="text-destructive">*</span></Label>
            <Textarea
              v-model="form.body"
              placeholder="Write the report content here..."
              class="min-h-48 resize-y"
            />
          </div>

        </CardContent>
      </Card>

      <!-- Beneficiaries card -->
      <Card>
        <CardHeader>
          <CardTitle>Beneficiaries</CardTitle>
          <CardDescription>
            Filter by class and select the children who received support this term.
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">

          <!-- Filters row -->
          <div class="flex gap-3">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                v-model="beneficiarySearch"
                placeholder="Search by name or pupil ID..."
                class="pl-9"
              />
            </div>
            <Select
              :model-value="classFilter ?? '__all__'"
              @update:model-value="classFilter = $event === '__all__' ? undefined : String($event)"
            >
              <SelectTrigger class="w-36">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All classes</SelectItem>
                <SelectItem v-for="cls in availableClasses" :key="cls" :value="cls">
                  Class {{ cls }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Children list -->
          <div class="flex flex-col divide-y border rounded-lg overflow-hidden">
            <div v-if="filteredChildren.length === 0" class="py-8 text-center text-sm text-muted-foreground">
              {{ childrenStore.children.length === 0 ? 'No children registered yet.' : 'No children match your filter.' }}
            </div>
            <div
              v-for="child in filteredChildren"
              :key="child.id"
              class="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'bg-primary/5': selectedChildIds.includes(child.id) }"
              @click="toggleChild(child.id)"
            >
              <Checkbox
                :id="`child-${child.id}`"
                :checked="selectedChildIds.includes(child.id)"
                @update:checked="toggleChild(child.id)"
                @click.stop
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm">{{ child.first_name }} {{ child.last_name }}</span>
                  <span class="font-mono text-xs text-muted-foreground">{{ child.pupil_id }}</span>
                </div>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge variant="outline" class="text-xs">Class {{ child.class_name }}</Badge>
                  <span
                    v-for="cat in child.categories.slice(0, 2)"
                    :key="cat.id"
                    class="text-xs text-muted-foreground"
                  >{{ cat.name.split(' ').slice(0, 3).join(' ') }}</span>
                  <span v-if="child.categories.length > 2" class="text-xs text-muted-foreground">
                    +{{ child.categories.length - 2 }} more
                  </span>
                </div>
              </div>
              <div class="text-xs text-muted-foreground shrink-0">
                {{ child.sponsors.map(s => s.name.split(' ').slice(0, 2).join(' ')).join(', ') }}
              </div>
            </div>
          </div>

          <!-- Selection count -->
          <p class="text-sm text-muted-foreground">
            <span class="font-medium text-foreground">{{ selectedChildIds.length }}</span>
            {{ selectedChildIds.length === 1 ? 'child' : 'children' }} selected
          </p>

        </CardContent>
      </Card>

      <!-- Actions -->
      <div class="flex justify-between">
        <Button variant="outline" @click="router.push({ name: 'reports' })">
          <ChevronLeft class="size-4 mr-1" />
          Cancel
        </Button>
        <Button :disabled="!isValid || saving" @click="submit">
          <Loader2 v-if="saving" class="size-4 mr-2 animate-spin" />
          {{ isEdit ? 'Save Changes' : 'Create Report' }}
        </Button>
      </div>
    </template>
  </div>
</template>
