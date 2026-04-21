<script setup lang="ts">
import { ref, watch } from 'vue'
import { nextTick } from 'vue'
import { PDFViewer, PDFDownloadLink } from '@ceereals/vue-pdf'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-vue-next'
import ReportDocument from './ReportDocument.vue'
import type { Report } from '@/types/report'

const props = defineProps<{
  open: boolean
  report: Report | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const pdfReady = ref(false)

watch(() => props.open, async (open) => {
  if (open) {
    pdfReady.value = false
    await nextTick()
    setTimeout(() => { pdfReady.value = true }, 300)
  }
})

function fileName() {
  if (!props.report) return 'report.pdf'
  const term = props.report.term.replace('_', '-').toLowerCase()
  return `OVC-Report-${term}-${props.report.year}.pdf`
}
</script>

<template>
  <Sheet :open="open" @update:open="(v) => emit('update:open', v)">
    <SheetContent side="right" class="w-full sm:max-w-2xl flex flex-col gap-0 p-0 overflow-hidden">

      <SheetHeader class="px-6 pt-5 pb-4 border-b flex-row items-center justify-between pr-14">
        <div>
          <SheetTitle>Report PDF</SheetTitle>
          <SheetDescription v-if="report">
            {{ report.title }}
          </SheetDescription>
        </div>

        <PDFDownloadLink v-if="report && pdfReady" :file-name="fileName()">
          <template #default>
            <ReportDocument :report="report" />
          </template>
          <template #label>
            <Button size="sm">
              <Download class="size-4 mr-2" />
              Download PDF
            </Button>
          </template>
        </PDFDownloadLink>
      </SheetHeader>

      <div class="flex-1 min-h-0 overflow-hidden bg-muted/30 flex items-center justify-center">
        <div v-if="!pdfReady || !report" class="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 class="size-8 animate-spin" />
          <p class="text-sm">Generating preview…</p>
        </div>

        <PDFViewer
          v-else
          :key="report.id"
          :show-toolbar="false"
          class="w-full h-full"
        >
          <ReportDocument :report="report" />
        </PDFViewer>
      </div>

    </SheetContent>
  </Sheet>
</template>
