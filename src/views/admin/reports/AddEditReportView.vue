<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { Loader2, ChevronLeft } from 'lucide-vue-next'
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import type { ReportTerm } from '@/types/report'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const router = useRouter()
const route = useRoute()
const store = useReportsStore()
const authStore = useAuthStore()

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

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

const isValid = computed(() =>
  form.value.title.trim() &&
  form.value.body.trim() &&
  form.value.term &&
  form.value.year,
)

onMounted(async () => {
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
      await store.createReport(
        payload,
        authStore.user?.full_name ?? authStore.user?.email ?? 'Unknown',
        authStore.user?.user_id ?? '0',
      )
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
              class="min-h-64 resize-y"
            />
          </div>

        </CardContent>
      </Card>

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
