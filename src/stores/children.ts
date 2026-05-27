import { defineStore } from 'pinia'
import { ref } from 'vue'
import { childrenApi } from '@/services/api/children'
import type { ChildWithRelations, ChildPayload } from '@/types/child'

export const useChildrenStore = defineStore('children', () => {
  const children = ref<ChildWithRelations[]>([])
  const selected = ref<ChildWithRelations | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchChildren(search?: string) {
    loading.value = true
    error.value = null
    try {
      const res = await childrenApi.list(search ? { search } : undefined)
      children.value = Array.isArray(res) ? res : []
    } catch (err: any) {
      error.value = err?.error?.message ?? 'Failed to load children.'
    } finally {
      loading.value = false
    }
  }

  async function fetchChild(id: string) {
    loading.value = true
    error.value = null
    try {
      selected.value = await childrenApi.get(id)
    } catch (err: any) {
      error.value = err?.error?.message ?? 'Failed to load child record.'
    } finally {
      loading.value = false
    }
  }

  async function createChild(payload: ChildPayload): Promise<ChildWithRelations> {
    const child = await childrenApi.create(payload)
    children.value.unshift(child)
    return child
  }

  async function updateChild(id: string, payload: ChildPayload): Promise<ChildWithRelations> {
    const updated = await childrenApi.update(id, payload)
    const idx = children.value.findIndex(c => c.id === id)
    if (idx !== -1) children.value[idx] = updated
    if (selected.value?.id === id) selected.value = updated
    return updated
  }

  async function deleteChild(id: string): Promise<void> {
    await childrenApi.delete(id)
    children.value = children.value.filter(c => c.id !== id)
    if (selected.value?.id === id) selected.value = null
  }

  return {
    children,
    selected,
    loading,
    error,
    fetchChildren,
    fetchChild,
    createChild,
    updateChild,
    deleteChild,
  }
})
