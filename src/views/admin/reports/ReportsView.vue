<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Pencil, Trash2, FileText, ChevronLeft, ChevronRight, Filter, X, FileDown } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useReportsStore } from '@/stores/reports'
import { useAuthStore } from '@/stores/auth'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { usePagination } from '@/composables/usePagination'
import type { Report, ReportTerm } from '@/types/report'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import ReportPdfSheet from '@/components/reports/ReportPdfSheet.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const router = useRouter()
const store = useReportsStore()
const authStore = useAuthStore()
const confirmDialog = useConfirmDialog()

const filterOpen = ref(false)
const pdfSheetOpen = ref(false)
const selectedReport = ref<Report | null>(null)

const filterTerm = ref<ReportTerm | ''>('')
const filterYear = ref<number | ''>('')
const appliedTerm = ref<ReportTerm | ''>('')
const appliedYear = ref<number | ''>('')

const canEdit = computed(() => authStore.userRole === 'admin' || authStore.userRole === 'user')

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

const TERM_LABELS: Record<ReportTerm, string> = {
  TERM_1: 'Term 1',
  TERM_2: 'Term 2',
  TERM_3: 'Term 3',
}

onMounted(() => store.fetchReports())

const filtered = computed(() => {
  let list = store.reports
  if (appliedTerm.value) list = list.filter(r => r.term === appliedTerm.value)
  if (appliedYear.value) list = list.filter(r => r.year === appliedYear.value)
  return list
})

const { page, totalPages, paginated, prev, next, goTo, pageNumbers } = usePagination(filtered)

const hasActiveFilter = computed(() => !!appliedTerm.value || !!appliedYear.value)

function applyFilter() {
  appliedTerm.value = filterTerm.value
  appliedYear.value = filterYear.value
  filterOpen.value = false
  page.value = 1
}

function clearFilter() {
  filterTerm.value = ''
  filterYear.value = ''
  appliedTerm.value = ''
  appliedYear.value = ''
}

function openPdf(report: Report) {
  selectedReport.value = report
  pdfSheetOpen.value = true
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function confirmDelete(report: Report) {
  const confirmed = await confirmDialog.confirm({
    title: 'Delete Report',
    description: `Are you sure you want to delete "${report.title}"? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'destructive',
  })
  if (!confirmed) return
  try {
    await store.deleteReport(report.id)
    toast.success('Report deleted.')
  } catch {
    toast.error('Failed to delete report.')
  }
}
</script>

<template>
  <DashboardHeader title="Reports" />

  <div class="flex flex-col gap-6 p-6">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="filterOpen = true">
          <Filter class="size-4 mr-2" />
          Filter
          <Badge v-if="hasActiveFilter" class="ml-2 size-5 p-0 flex items-center justify-center text-xs">
            {{ (appliedTerm ? 1 : 0) + (appliedYear ? 1 : 0) }}
          </Badge>
        </Button>
        <Button v-if="hasActiveFilter" variant="ghost" size="sm" @click="clearFilter">
          <X class="size-3 mr-1" /> Clear
        </Button>
        <span v-if="hasActiveFilter" class="text-sm text-muted-foreground">
          {{ appliedTerm ? TERM_LABELS[appliedTerm] : '' }}
          {{ appliedTerm && appliedYear ? ' · ' : '' }}
          {{ appliedYear || '' }}
        </span>
      </div>
      <Button v-if="canEdit" @click="router.push({ name: 'reports-new' })">
        <Plus class="size-4 mr-2" />
        New Report
      </Button>
    </div>

    <!-- Table -->
    <div class="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-8"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Term</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Date</TableHead>
            <TableHead class="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading -->
          <template v-if="store.loading">
            <TableRow v-for="i in 3" :key="i">
              <TableCell colspan="7">
                <div class="h-4 rounded bg-muted animate-pulse" />
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty -->
          <template v-else-if="filtered.length === 0">
            <TableRow>
              <TableCell colspan="7" class="py-16 text-center text-muted-foreground">
                {{ store.reports.length === 0 ? 'No reports yet.' : 'No reports match the current filter.' }}
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows -->
          <template v-else>
            <TableRow v-for="report in paginated" :key="report.id">
              <TableCell>
                <FileText class="size-4 text-muted-foreground" />
              </TableCell>
              <TableCell>
                <div class="font-medium max-w-xs truncate">{{ report.title }}</div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{{ TERM_LABELS[report.term] }}</Badge>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ report.year }}</TableCell>
              <TableCell class="text-muted-foreground text-sm">{{ report.created_by_name }}</TableCell>
              <TableCell class="text-muted-foreground text-sm">{{ formatDate(report.created_at) }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" class="size-8" @click="openPdf(report)">
                    <FileDown class="size-4" />
                  </Button>
                  <Button
                    v-if="canEdit"
                    variant="ghost" size="icon" class="size-8"
                    @click="router.push({ name: 'reports-edit', params: { id: report.id } })"
                  >
                    <Pencil class="size-4" />
                  </Button>
                  <Button
                    v-if="canEdit"
                    variant="ghost" size="icon" class="size-8 text-destructive hover:text-destructive"
                    @click="confirmDelete(report)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t text-sm">
        <p class="text-muted-foreground">Page {{ page }} of {{ totalPages }}</p>
        <div class="flex items-center gap-1">
          <button
            class="size-8 flex items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="page === 1" @click="prev"
          ><ChevronLeft class="size-4" /></button>
          <template v-for="p in pageNumbers" :key="p">
            <span v-if="p === '...'" class="px-1 text-muted-foreground">…</span>
            <button
              v-else
              :class="['size-8 flex items-center justify-center rounded-md border text-sm', p === page ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted']"
              @click="goTo(p as number)"
            >{{ p }}</button>
          </template>
          <button
            class="size-8 flex items-center justify-center rounded-md border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="page === totalPages" @click="next"
          ><ChevronRight class="size-4" /></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Filter Dialog -->
  <Dialog v-model:open="filterOpen">
    <DialogContent class="max-w-sm">
      <DialogHeader>
        <DialogTitle>Filter Reports</DialogTitle>
      </DialogHeader>
      <div class="flex flex-col gap-4 py-2">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Term</label>
          <Select :model-value="filterTerm || undefined" @update:model-value="filterTerm = ($event as ReportTerm) || ''">
            <SelectTrigger><SelectValue placeholder="All terms" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="TERM_1">Term 1</SelectItem>
              <SelectItem value="TERM_2">Term 2</SelectItem>
              <SelectItem value="TERM_3">Term 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium">Year</label>
          <Select :model-value="filterYear ? String(filterYear) : undefined" @update:model-value="filterYear = $event ? Number($event) : ''">
            <SelectTrigger><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem v-for="y in YEARS" :key="y" :value="String(y)">{{ y }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter class="gap-2">
        <Button variant="outline" @click="filterOpen = false">Cancel</Button>
        <Button @click="applyFilter">Apply Filter</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- PDF Sheet -->
  <ReportPdfSheet
    v-model:open="pdfSheetOpen"
    :report="selectedReport"
  />
</template>
