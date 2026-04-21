export type ReportTerm = 'TERM_1' | 'TERM_2' | 'TERM_3'

export interface Report {
  id: string
  title: string
  body: string
  term: ReportTerm
  year: number
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
  beneficiaries: ReportBeneficiary[]
}

export interface ReportBeneficiary {
  id: string
  pupil_id: string
  first_name: string
  last_name: string
  class_name: string
  sponsors: { id: number; name: string }[]
  categories: { id: number; name: string }[]
}

export interface ReportPayload {
  title: string
  body: string
  term: ReportTerm
  year: number
  child_ids: string[]
}

export interface ReportFilters {
  term?: ReportTerm
  year?: number
}
