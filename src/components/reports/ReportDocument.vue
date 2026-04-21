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

const s: Record<string, Style> = {
  page:        { padding: 48, fontSize: 10, fontFamily: 'Helvetica', color: '#1a1a1a' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, paddingBottom: 20, borderBottomWidth: 2, borderBottomColor: '#15803d' },
  schoolName:  { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#14532d' },
  schoolSub:   { fontSize: 9, color: '#6b7280', marginTop: 3 },
  reportLabel: { fontSize: 10, color: '#6b7280', textAlign: 'right' },
  termBadge:   { marginTop: 4, alignSelf: 'flex-end', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  termText:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#15803d' },

  titleSection: { marginBottom: 24 },
  title:        { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', marginBottom: 6 },
  meta:         { fontSize: 9, color: '#6b7280' },

  divider:      { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', marginBottom: 16 },

  bodyText:     { fontSize: 10, lineHeight: 1.7, color: '#374151' },

  signatureSection: { marginTop: 48 },
  signatureLabel:   { fontSize: 9, color: '#6b7280', marginBottom: 4 },
  signatureName:    { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  signatureRole:    { fontSize: 9, color: '#6b7280', marginTop: 2 },
  signatureLine:    { borderBottomWidth: 1, borderBottomColor: '#1a1a1a', width: 200, marginTop: 24 },

  footer:       { position: 'absolute', bottom: 30, left: 48, right: 48, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText:   { fontSize: 8, color: '#9ca3af' },
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
