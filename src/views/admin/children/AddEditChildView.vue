<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { ChevronLeft, ChevronRight, Check, Loader2, Upload, X, UserCircle2 } from 'lucide-vue-next'
import { useChildrenStore } from '@/stores/children'
import { lookupsApi } from '@/services/api/lookups'
import { uploadChildImage, deleteChildImage } from '@/services/storage'
import type { ChildCategory, ChildRequisite, ChildSponsor, ChildPayload } from '@/types/child'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useChildrenStore()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => isEdit.value ? 'Edit Child Record' : 'Add New Child')

const step = ref(1)
const saving = ref(false)
const loadingChild = ref(false)

// Lookup data
const allCategories = ref<ChildCategory[]>([])
const allRequisites = ref<Omit<ChildRequisite, 'checked' | 'quantity' | 'price_per_item'>[]>([])
const allSponsors = ref<ChildSponsor[]>([])

// Photo upload
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const existingPhotoUrl = ref<string | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)

function onPhotoSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/heic', 'image/webp'].includes(file.type)) {
    toast.error('Only JPEG, PNG, WebP, or HEIC images are accepted.')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image must be under 5 MB.')
    return
  }
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function removePhoto() {
  photoFile.value = null
  photoPreview.value = null
  existingPhotoUrl.value = null
  if (photoInput.value) photoInput.value.value = ''
}

// Step 1 — Child & Guardian Info
const info = ref({
  pupil_id: '',
  first_name: '',
  last_name: '',
  address: '',
  class_name: '',
  guardian_first_name: '',
  guardian_last_name: '',
  guardian_address: '',
  guardian_phone: '',
})

// Step 2 — Requisites
const requisites = ref<ChildRequisite[]>([])

// Step 3 — Categories
const selectedCategoryIds = ref<string[]>([])

// Step 4 — Sponsors
const selectedSponsorIds = ref<string[]>([])

const STEPS = [
  { label: 'Child Info', description: 'Personal & guardian details' },
  { label: 'Requisites', description: 'School supplies' },
  { label: 'Categories', description: 'OVC vulnerability categories' },
  { label: 'Sponsors', description: 'Funding sources' },
]

onMounted(async () => {
  const [cats, reqs, sponsors] = await Promise.all([
    lookupsApi.categories(),
    lookupsApi.requisites(),
    lookupsApi.sponsors(),
  ])
  allCategories.value = cats
  allSponsors.value = sponsors

  // Initialise requisites with defaults
  requisites.value = reqs.map(r => ({ ...r, checked: false, quantity: 1, price_per_item: 0 }))

  if (isEdit.value) {
    loadingChild.value = true
    await store.fetchChild(route.params.id as string)
    const child = store.selected
    if (child) {
      info.value = {
        pupil_id: child.pupil_id,
        first_name: child.first_name,
        last_name: child.last_name,
        address: child.address,
        class_name: child.class_name,
        guardian_first_name: child.guardian_first_name,
        guardian_last_name: child.guardian_last_name,
        guardian_address: child.guardian_address,
        guardian_phone: child.guardian_phone,
      }
      if (child.image_url) {
        existingPhotoUrl.value = child.image_url
        photoPreview.value = child.image_url
      }
      selectedCategoryIds.value = (child.categories ?? []).map(c => c.id)
      selectedSponsorIds.value = (child.sponsors ?? []).map(s => s.id)
      requisites.value = reqs.map(r => {
        const existing = (child.requisites ?? []).find(cr => cr.id === r.id)
        return existing
          ? { ...r, checked: existing.checked, quantity: existing.quantity, price_per_item: existing.price_per_item }
          : { ...r, checked: false, quantity: 1, price_per_item: 0 }
      })
    }
    loadingChild.value = false
  }
})

// Step 1 validation
const step1Valid = computed(() =>
  info.value.pupil_id.trim() &&
  info.value.first_name.trim() &&
  info.value.last_name.trim() &&
  info.value.address.trim() &&
  info.value.class_name.trim() &&
  info.value.guardian_first_name.trim() &&
  info.value.guardian_last_name.trim() &&
  info.value.guardian_address.trim() &&
  info.value.guardian_phone.trim(),
)

function toggleCategory(id: string) {
  const idx = selectedCategoryIds.value.indexOf(id)
  if (idx === -1) selectedCategoryIds.value.push(id)
  else selectedCategoryIds.value.splice(idx, 1)
}

function toggleSponsor(id: string) {
  const idx = selectedSponsorIds.value.indexOf(id)
  if (idx === -1) selectedSponsorIds.value.push(id)
  else selectedSponsorIds.value.splice(idx, 1)
}

function incrementQty(req: ChildRequisite) {
  req.quantity = Math.min(req.quantity + 1, 99)
}

function decrementQty(req: ChildRequisite) {
  req.quantity = Math.max(req.quantity - 1, 1)
}

async function submit() {
  saving.value = true
  try {
    // Determine the child ID: existing ID for edits, or generate a temp one for creates
    // (the real ID is assigned by the backend, but we need it for the storage path)
    const childId = isEdit.value
      ? (route.params.id as string)
      : crypto.randomUUID()

    // Upload new photo if selected
    let imageUrl: string | undefined = existingPhotoUrl.value ?? undefined
    if (photoFile.value) {
      // Delete old photo from Firebase if replacing
      if (existingPhotoUrl.value) {
        await deleteChildImage(existingPhotoUrl.value)
      }
      imageUrl = await uploadChildImage(childId, photoFile.value)
    } else if (!photoPreview.value && existingPhotoUrl.value) {
      // Photo was removed without replacement
      await deleteChildImage(existingPhotoUrl.value)
      imageUrl = undefined
    }

    const payload: ChildPayload = {
      ...info.value,
      image_url: imageUrl,
      category_ids: selectedCategoryIds.value,
      sponsor_ids: selectedSponsorIds.value,
      requisites: requisites.value.map(r => ({
        id: r.id,
        checked: r.checked,
        quantity: r.quantity,
        price_per_item: r.price_per_item,
      })),
    }

    if (isEdit.value) {
      await store.updateChild(route.params.id as string, payload)
      toast.success('Child record updated.')
    } else {
      await store.createChild(payload)
      toast.success('Child record created.')
    }
    router.push({ name: 'children' })
  } catch {
    toast.error('Failed to save child record.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <DashboardHeader :title="pageTitle" />

  <div class="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">

    <!-- Loading state for edit -->
    <div v-if="loadingChild" class="flex items-center justify-center py-20">
      <Loader2 class="size-6 animate-spin text-muted-foreground" />
    </div>

    <template v-else>
      <!-- Step indicator -->
      <div class="flex items-center gap-0">
        <template v-for="(s, i) in STEPS" :key="i">
          <div class="flex flex-col items-center gap-1.5">
            <div
              :class="[
                'size-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
                step > i + 1
                  ? 'bg-primary border-primary text-primary-foreground'
                  : step === i + 1
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground/30 text-muted-foreground',
              ]"
            >
              <Check v-if="step > i + 1" class="size-4" />
              <span v-else>{{ i + 1 }}</span>
            </div>
            <span :class="['text-xs font-medium hidden sm:block', step === i + 1 ? 'text-foreground' : 'text-muted-foreground']">
              {{ s.label }}
            </span>
          </div>
          <div
            v-if="i < STEPS.length - 1"
            :class="['flex-1 h-0.5 mb-5 mx-2 transition-colors', step > i + 1 ? 'bg-primary' : 'bg-muted']"
          />
        </template>
      </div>

      <!-- Step 1 — Child & Guardian Info -->
      <Card v-if="step === 1">
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
          <CardDescription>Enter the child's personal and guardian details.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-5">
          <!-- Photo upload -->
          <div class="flex flex-col gap-2">
            <Label>Photo <span class="text-muted-foreground text-xs font-normal">(optional)</span></Label>
            <div class="flex items-center gap-4">
              <div class="size-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
                <img v-if="photoPreview" :src="photoPreview" alt="Child photo" class="w-full h-full object-cover" />
                <UserCircle2 v-else class="size-10 text-muted-foreground" />
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" @click="photoInput?.click()">
                    <Upload class="size-3.5 mr-1.5" />
                    {{ photoPreview ? 'Change Photo' : 'Upload Photo' }}
                  </Button>
                  <Button v-if="photoPreview" type="button" variant="ghost" size="sm" class="text-destructive hover:text-destructive" @click="removePhoto">
                    <X class="size-3.5 mr-1" />
                    Remove
                  </Button>
                </div>
                <p class="text-xs text-muted-foreground">JPEG, PNG, WebP or HEIC — max 5 MB</p>
              </div>
              <input
                ref="photoInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                class="hidden"
                @change="onPhotoSelected"
              />
            </div>
          </div>

          <div class="border-t pt-4">
            <p class="text-sm font-medium mb-4">Child Information</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label>First Name <span class="text-destructive">*</span></Label>
              <Input v-model="info.first_name" placeholder="e.g. Chanda" />
            </div>
            <div class="flex flex-col gap-2">
              <Label>Last Name <span class="text-destructive">*</span></Label>
              <Input v-model="info.last_name" placeholder="e.g. Mwansa" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <Label>Pupil ID <span class="text-destructive">*</span></Label>
              <Input v-model="info.pupil_id" placeholder="e.g. HK-2024-001" />
            </div>
            <div class="flex flex-col gap-2">
              <Label>Class <span class="text-destructive">*</span></Label>
              <Input v-model="info.class_name" placeholder="e.g. 12B" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Label>Address <span class="text-destructive">*</span></Label>
            <Input v-model="info.address" placeholder="e.g. Plot 12, Ndola" />
          </div>

          <div class="border-t pt-4">
            <p class="text-sm font-medium mb-4">Guardian Information</p>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <Label>Guardian First Name <span class="text-destructive">*</span></Label>
                <Input v-model="info.guardian_first_name" placeholder="e.g. Mary" />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Guardian Last Name <span class="text-destructive">*</span></Label>
                <Input v-model="info.guardian_last_name" placeholder="e.g. Mwansa" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="flex flex-col gap-2">
                <Label>Guardian Address <span class="text-destructive">*</span></Label>
                <Input v-model="info.guardian_address" placeholder="e.g. Plot 12, Ndola" />
              </div>
              <div class="flex flex-col gap-2">
                <Label>Guardian Phone <span class="text-destructive">*</span></Label>
                <Input v-model="info.guardian_phone" placeholder="e.g. +260977123456" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Step 2 — Requisites -->
      <Card v-if="step === 2">
        <CardHeader>
          <CardTitle>School Requisites</CardTitle>
          <CardDescription>Select items received and set quantities and price per item.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col divide-y">
            <div
              v-for="req in requisites"
              :key="req.id"
              class="flex items-center gap-4 py-3 cursor-pointer"
              @click="req.checked = !req.checked"
            >
              <Checkbox
                :checked="req.checked"
                @update:checked="req.checked = !req.checked"
              />
              <span class="flex-1 text-sm font-medium select-none">{{ req.name }}</span>

              <template v-if="req.checked">
                <!-- Quantity -->
                <div class="flex items-center gap-2" @click.stop>
                  <span class="text-xs text-muted-foreground w-4">Qty</span>
                  <div class="flex items-center border rounded-md">
                    <button
                      type="button"
                      class="px-2 py-1 hover:bg-muted disabled:opacity-40"
                      :disabled="req.quantity <= 1"
                      @click.stop="decrementQty(req)"
                    >
                      <Minus class="size-3" />
                    </button>
                    <span class="w-8 text-center text-sm font-medium">{{ req.quantity }}</span>
                    <button
                      type="button"
                      class="px-2 py-1 hover:bg-muted"
                      @click.stop="incrementQty(req)"
                    >
                      <Plus class="size-3" />
                    </button>
                  </div>
                </div>

                <!-- Price per item -->
                <div class="flex items-center gap-2" @click.stop>
                  <span class="text-xs text-muted-foreground">ZMW</span>
                  <Input
                    v-model.number="req.price_per_item"
                    type="number"
                    min="0"
                    class="w-24 h-8 text-sm"
                    placeholder="0.00"
                    @click.stop
                  />
                </div>
              </template>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Step 3 — OVC Categories -->
      <Card v-if="step === 3">
        <CardHeader>
          <CardTitle>OVC Categories</CardTitle>
          <CardDescription>Select all vulnerability categories that apply to this child.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-3">
            <div
              v-for="cat in allCategories"
              :key="cat.id"
              class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5': selectedCategoryIds.includes(cat.id) }"
              @click="toggleCategory(cat.id)"
            >
              <Checkbox
                :id="`cat-${cat.id}`"
                :checked="selectedCategoryIds.includes(cat.id)"
                @update:checked="toggleCategory(cat.id)"
                @click.stop
              />
              <Label :for="`cat-${cat.id}`" class="cursor-pointer text-sm leading-snug">
                {{ cat.name }}
              </Label>
            </div>
          </div>
          <p v-if="selectedCategoryIds.length === 0" class="mt-3 text-xs text-muted-foreground">
            At least one category should be selected.
          </p>
        </CardContent>
      </Card>

      <!-- Step 4 — Sponsors -->
      <Card v-if="step === 4">
        <CardHeader>
          <CardTitle>Sponsors</CardTitle>
          <CardDescription>Select the funding sources for this child's support.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-3">
            <div
              v-for="sponsor in allSponsors"
              :key="sponsor.id"
              class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              :class="{ 'border-primary bg-primary/5': selectedSponsorIds.includes(sponsor.id) }"
              @click="toggleSponsor(sponsor.id)"
            >
              <Checkbox
                :id="`sp-${sponsor.id}`"
                :checked="selectedSponsorIds.includes(sponsor.id)"
                @update:checked="toggleSponsor(sponsor.id)"
                @click.stop
              />
              <Label :for="`sp-${sponsor.id}`" class="cursor-pointer text-sm font-medium">
                {{ sponsor.name }}
              </Label>
            </div>
          </div>
          <p v-if="selectedSponsorIds.length === 0" class="mt-3 text-xs text-muted-foreground">
            At least one sponsor should be selected.
          </p>
        </CardContent>
      </Card>

      <!-- Navigation buttons -->
      <div class="flex justify-between">
        <Button
          variant="outline"
          @click="step > 1 ? step-- : router.push({ name: 'children' })"
        >
          <ChevronLeft class="size-4 mr-1" />
          {{ step === 1 ? 'Cancel' : 'Back' }}
        </Button>

        <Button
          v-if="step < 4"
          :disabled="step === 1 && !step1Valid"
          @click="step++"
        >
          Next
          <ChevronRight class="size-4 ml-1" />
        </Button>

        <Button
          v-else
          :disabled="saving"
          @click="submit"
        >
          <Loader2 v-if="saving" class="size-4 mr-2 animate-spin" />
          {{ isEdit ? 'Save Changes' : 'Create Record' }}
        </Button>
      </div>
    </template>
  </div>
</template>
