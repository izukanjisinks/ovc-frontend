<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Pencil, Trash2, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { useChildrenStore } from '@/stores/children'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { usePagination } from '@/composables/usePagination'
import type { ChildWithRelations } from '@/types/child'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const router = useRouter()
const store = useChildrenStore()
const confirmDialog = useConfirmDialog()

const search = ref('')

onMounted(() => store.fetchChildren())

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return store.children
  return store.children.filter(c =>
    c.pupil_id.toLowerCase().includes(q) ||
    c.first_name.toLowerCase().includes(q) ||
    c.last_name.toLowerCase().includes(q),
  )
})

const { page, totalPages, paginated, prev, next, goTo, pageNumbers } = usePagination(filtered)

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

async function confirmDelete(child: ChildWithRelations) {
  const confirmed = await confirmDialog.confirm({
    title: 'Delete Child Record',
    description: `Are you sure you want to delete the record for ${child.first_name} ${child.last_name} (${child.pupil_id})? This action cannot be undone.`,
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'destructive',
  })
  if (!confirmed) return
  try {
    await store.deleteChild(child.id)
    toast.success(`Record for ${child.first_name} ${child.last_name} deleted.`)
  } catch {
    toast.error('Failed to delete record.')
  }
}
</script>

<template>
  <DashboardHeader title="Children" />

  <div class="flex flex-col gap-6 p-6">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4">
      <div class="relative max-w-xs w-full">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input v-model="search" placeholder="Search by name or pupil ID..." class="pl-9" />
      </div>
      <Button @click="router.push({ name: 'children-new' })">
        <Plus class="size-4 mr-2" />
        Add Child
      </Button>
    </div>

    <!-- Table -->
    <div class="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-12"></TableHead>
            <TableHead>Pupil ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead>Sponsors</TableHead>
            <TableHead>Address</TableHead>
            <TableHead class="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading -->
          <template v-if="store.loading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell colspan="8">
                <div class="h-4 rounded bg-muted animate-pulse" />
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty -->
          <template v-else-if="filtered.length === 0">
            <TableRow>
              <TableCell colspan="8" class="py-16 text-center text-muted-foreground">
                {{ store.children.length === 0 ? 'No children registered yet.' : 'No children match your search.' }}
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows -->
          <template v-else>
            <TableRow
              v-for="child in paginated"
              :key="child.id"
              class="cursor-pointer hover:bg-muted/40"
              @click="router.push({ name: 'children-detail', params: { id: child.id } })"
            >
              <!-- Avatar -->
              <TableCell>
                <div v-if="child.image_url" class="size-9 rounded-full overflow-hidden">
                  <img :src="child.image_url" :alt="`${child.first_name} ${child.last_name}`" class="w-full h-full object-cover" />
                </div>
                <div v-else class="size-9 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {{ getInitials(child.first_name, child.last_name) }}
                </div>
              </TableCell>

              <TableCell class="font-mono text-sm">{{ child.pupil_id }}</TableCell>

              <TableCell>
                <div class="font-medium">{{ child.first_name }} {{ child.last_name }}</div>
              </TableCell>

              <TableCell class="text-muted-foreground">{{ child.class_name }}</TableCell>

              <!-- Categories -->
              <TableCell>
                <div v-if="child.categories.length" class="flex flex-wrap gap-1">
                  <Badge
                    v-for="cat in child.categories.slice(0, 2)"
                    :key="cat.id"
                    variant="secondary"
                    class="text-xs"
                  >{{ cat.name.split(' ').slice(0, 2).join(' ') }}</Badge>
                  <Badge v-if="child.categories.length > 2" variant="outline" class="text-xs">
                    +{{ child.categories.length - 2 }}
                  </Badge>
                </div>
                <span v-else class="text-xs text-muted-foreground">—</span>
              </TableCell>

              <!-- Sponsors -->
              <TableCell>
                <div v-if="child.sponsors.length" class="flex flex-wrap gap-1">
                  <Badge
                    v-for="sp in child.sponsors"
                    :key="sp.id"
                    variant="outline"
                    class="text-xs"
                  >{{ sp.name.split(' ').slice(0, 2).join(' ') }}</Badge>
                </div>
                <span v-else class="text-xs text-muted-foreground">—</span>
              </TableCell>

              <TableCell class="text-muted-foreground text-sm max-w-40 truncate">{{ child.address }}</TableCell>

              <TableCell class="text-right" @click.stop>
                <div class="flex justify-end gap-1">
                  <Button
                    variant="ghost" size="icon" class="size-8"
                    @click="router.push({ name: 'children-detail', params: { id: child.id } })"
                  >
                    <Eye class="size-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" class="size-8"
                    @click="router.push({ name: 'children-edit', params: { id: child.id } })"
                  >
                    <Pencil class="size-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" class="size-8 text-destructive hover:text-destructive"
                    @click="confirmDelete(child)"
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
          >
            <ChevronLeft class="size-4" />
          </button>
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
          >
            <ChevronRight class="size-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
