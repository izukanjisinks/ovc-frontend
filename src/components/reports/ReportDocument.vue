<script setup lang="ts">
import { Document, Page, View, Text } from '@ceereals/vue-pdf'
import type { Style } from '@ceereals/vue-pdf'
import type { Report } from '@/types/report'

const props = defineProps<{ report: Report }>()

const TERM_LABELS: Record<string, string> = {
  TERM_1: 'Term 1',
  TERM_2: 'Term 2',
  TERM_3: 'Term 3',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function shortName(name: string, words = 2) {
  return name.split(' ').slice(0, words).join(' ')
}

const s = {
  page:         { padding: 48, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' } as Style,

  // Header
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: '#15803d' } as Style,
  schoolName:   { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#14532d' } as Style,
  schoolSub:    { fontSize: 9, color: '#6b7280', marginTop: 3 } as Style,
  reportLabel:  { fontSize: 10, color: '#6b7280', textAlign: 'right' } as Style,
  termBadge:    { marginTop: 4, alignSelf: 'flex-end', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 } as Style,
  termText:     { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#15803d' } as Style,

  // Title
  titleSection: { marginBottom: 20 } as Style,
  title:        { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginBottom: 6 } as Style,
  meta:         { fontSize: 9, color: '#6b7280' } as Style,
  divider:      { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 16 } as Style,

  // Body
  bodyText:     { fontSize: 10, lineHeight: 1.7, color: '#374151' } as Style,

  // Beneficiaries
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginBottom: 8, marginTop: 24 } as Style,
  sectionMeta:  { fontSize: 9, color: '#6b7280', marginBottom: 10 } as Style,
  tableHeader:  { flexDirection: 'row', backgroundColor: '#166534', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 3 } as Style,
  thText:       { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase' } as Style,
  tableRow:     { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0fdf4' } as Style,
  tableRowAlt:  { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#f0fdf4', borderBottomWidth: 1, borderBottomColor: '#dcfce7' } as Style,
  cellText:     { fontSize: 9, color: '#374151' } as Style,
  cellMuted:    { fontSize: 8, color: '#6b7280', marginTop: 2 } as Style,

  colNo:        { width: 24 } as Style,
  colId:        { width: 80 } as Style,
  colName:      { flex: 1 } as Style,
  colClass:     { width: 44 } as Style,
  colSponsor:   { width: 100 } as Style,

  totalRow:     { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#166534', borderRadius: 3, marginTop: 2 } as Style,
  totalText:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' } as Style,

  // Signature
  signatureSection: { marginTop: 40 } as Style,
  signatureLabel:   { fontSize: 9, color: '#6b7280', marginBottom: 4 } as Style,
  signatureLine:    { borderBottomWidth: 1, borderBottomColor: '#1a1a1a', width: 200, marginTop: 24 } as Style,
  signatureName:    { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 6 } as Style,
  signatureRole:    { fontSize: 9, color: '#6b7280', marginTop: 2 } as Style,

  // Footer
  footer:       { position: 'absolute', bottom: 30, left: 48, right: 48, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' } as Style,
  footerText:   { fontSize: 8, color: '#9ca3af' } as Style,
}
</script>

<template>
  <Document :title="report.title">
    <Page size="A4" :style="s.page">

      <!-- Header -->
      <View :style="s.header">
        <View>
          <Text :style="s.schoolName">Helen Kaunda Secondary School</Text>
          <Text :style="s.schoolSub">OVC Management Information System</Text>
          <Text :style="s.schoolSub">Orphan and Vulnerable Children Grant Programme</Text>
        </View>
        <View>
          <Text :style="s.reportLabel">OFFICIAL REPORT</Text>
          <View :style="s.termBadge">
            <Text :style="s.termText">{{ TERM_LABELS[report.term] }} · {{ report.year }}</Text>
          </View>
        </View>
      </View>

      <!-- Title -->
      <View :style="s.titleSection">
        <Text :style="s.title">{{ report.title }}</Text>
        <Text :style="s.meta">
          Prepared by: {{ report.created_by_name }} · Date: {{ fmtDate(report.created_at) }}
        </Text>
      </View>

      <View :style="s.divider" />

      <!-- Body -->
      <View>
        <Text :style="s.bodyText">{{ report.body }}</Text>
      </View>

      <!-- Beneficiaries table -->
      <View v-if="report.beneficiaries?.length > 0">
        <Text :style="s.sectionTitle">Beneficiaries</Text>
        <Text :style="s.sectionMeta">
          Children who received OVC grant support — {{ TERM_LABELS[report.term] }} {{ report.year }}
        </Text>

        <!-- Table header -->
        <View :style="s.tableHeader">
          <Text :style="[s.thText, s.colNo]">#</Text>
          <Text :style="[s.thText, s.colId]">Pupil ID</Text>
          <Text :style="[s.thText, s.colName]">Name</Text>
          <Text :style="[s.thText, s.colClass]">Class</Text>
          <Text :style="[s.thText, s.colSponsor]">Sponsor(s)</Text>
        </View>

        <!-- Rows -->
        <View
          v-for="(b, i) in report.beneficiaries"
          :key="b.id"
          :style="i % 2 === 0 ? s.tableRow : s.tableRowAlt"
        >
          <Text :style="[s.cellText, s.colNo]">{{ i + 1 }}</Text>
          <Text :style="[s.cellText, s.colId]">{{ b.pupil_id }}</Text>
          <View :style="s.colName">
            <Text :style="s.cellText">{{ b.first_name }} {{ b.last_name }}</Text>
            <Text :style="s.cellMuted">
              {{ (b.categories ?? []).slice(0, 2).map(c => shortName(c.name, 3)).join(', ') }}{{ (b.categories?.length ?? 0) > 2 ? '...' : '' }}
            </Text>
          </View>
          <Text :style="[s.cellText, s.colClass]">{{ b.class_name }}</Text>
          <Text :style="[s.cellText, s.colSponsor]">
            {{ (b.sponsors ?? []).map(s => shortName(s.name, 2)).join(', ') || '—' }}
          </Text>
        </View>

        <!-- Total row -->
        <View :style="s.totalRow">
          <Text :style="[s.totalText, s.colNo]"></Text>
          <Text :style="[s.totalText, s.colId]"></Text>
          <Text :style="[s.totalText, s.colName]">Total Beneficiaries</Text>
          <Text :style="[s.totalText, s.colClass]">{{ report.beneficiaries?.length ?? 0 }}</Text>
          <Text :style="[s.totalText, s.colSponsor]"></Text>
        </View>
      </View>

      <!-- Signature -->
      <View :style="s.signatureSection">
        <Text :style="s.signatureLabel">Prepared and submitted by:</Text>
        <View :style="s.signatureLine" />
        <Text :style="s.signatureName">{{ report.created_by_name }}</Text>
        <Text :style="s.signatureRole">School Guidance Staff — Helen Kaunda Secondary School</Text>
      </View>

      <!-- Footer -->
      <View :style="s.footer" fixed>
        <Text :style="s.footerText">OVC-MIS · Helen Kaunda Secondary School</Text>
        <Text :style="s.footerText">{{ TERM_LABELS[report.term] }} {{ report.year }} · Confidential</Text>
      </View>

    </Page>
  </Document>
</template>
