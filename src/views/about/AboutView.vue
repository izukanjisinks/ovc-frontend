<script setup lang="ts">
import { School, Mail, Phone, Code2, Shield } from 'lucide-vue-next'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const VERSION = '1.0.0'
const YEAR = new Date().getFullYear()
</script>

<template>
  <DashboardHeader title="About" />

  <div class="flex flex-col gap-6 p-6 max-w-3xl mx-auto w-full">

    <!-- System identity -->
    <div class="flex items-center gap-4">
      <div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
        <School class="size-7 text-primary" />
      </div>
      <div>
        <h2 class="text-xl font-bold tracking-tight">OVC Management Information System</h2>
        <p class="text-sm text-muted-foreground mt-0.5">Helen Kaunda Secondary School — Orphan &amp; Vulnerable Children Program</p>
      </div>
    </div>

    <!-- System info -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">System Information</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col divide-y text-sm">
        <div class="flex justify-between py-2.5">
          <span class="text-muted-foreground">Version</span>
          <Badge variant="secondary">v{{ VERSION }}</Badge>
        </div>
        <div class="flex justify-between py-2.5">
          <span class="text-muted-foreground">Purpose</span>
          <span class="font-medium text-right max-w-xs">Digital management of OVC grant support records</span>
        </div>
        <div class="flex justify-between py-2.5">
          <span class="text-muted-foreground">Program Cycle</span>
          <span class="font-medium">Three terms per academic year</span>
        </div>
        <div class="flex justify-between py-2.5">
          <span class="text-muted-foreground">Funding Bodies</span>
          <span class="font-medium">GRZ · NGO · Private Sponsors</span>
        </div>
        <div class="flex justify-between py-2.5">
          <span class="text-muted-foreground">Copyright</span>
          <span class="font-medium">© {{ YEAR }} Helen Kaunda Secondary School</span>
        </div>
      </CardContent>
    </Card>

    <!-- Developer -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">Developer</CardTitle>
      </CardHeader>
      <CardContent class="flex flex-col divide-y text-sm">
        <div class="flex items-center gap-3 py-2.5">
          <Code2 class="size-4 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground w-24 shrink-0">Author</span>
          <span class="font-medium">Teddy Sichivula — Copperbelt University, Zambia</span>
        </div>
        <div class="flex items-center gap-3 py-2.5">
          <Mail class="size-4 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground w-24 shrink-0">Email</span>
          <span class="font-medium">sichivulateddy@gmail.com</span>
        </div>
        <div class="flex items-center gap-3 py-2.5">
          <Phone class="size-4 text-muted-foreground shrink-0" />
          <span class="text-muted-foreground w-24 shrink-0">Phone</span>
          <span class="font-medium">+260 97X XXX XXX</span>
        </div>
      </CardContent>
    </Card>

  </div>
</template>
