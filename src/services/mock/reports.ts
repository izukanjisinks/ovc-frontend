import type { Report, ReportPayload, ReportFilters, ReportBeneficiary } from '@/types/report'
import { mockChildrenApi } from './children'

function delay(ms = 400): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function uuid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

async function resolveBeneficiaries(child_ids: string[]): Promise<ReportBeneficiary[]> {
  const results: ReportBeneficiary[] = []
  for (const id of child_ids) {
    try {
      const child = await mockChildrenApi.get(id)
      results.push({
        id: child.id,
        pupil_id: child.pupil_id,
        first_name: child.first_name,
        last_name: child.last_name,
        class_name: child.class_name,
        sponsors: child.sponsors,
        categories: child.categories,
      })
    } catch {
      // child may have been deleted
    }
  }
  return results
}

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Term 1 OVC Support Report — 2024',
    body: `This report summarises the distribution of OVC grant support for Term 1, 2024 at Helen Kaunda Secondary School.\n\nA total of 47 children received support this term across all vulnerability categories. The majority of beneficiaries fall under the DOUBLE ORPHAN and SINGLE ORPHAN categories, accounting for 38% of all registered children.\n\nSupplies distributed included school uniforms, note books, pens and pencils, and mathematical sets. Funding was primarily sourced from the Government Republic of Zambia (GRZ).\n\nThe school guidance team conducted home visits for 12 newly registered children to verify eligibility and update guardian information.`,
    term: 'TERM_1',
    year: 2024,
    created_by: '2',
    created_by_name: 'Grace Mwale',
    created_at: '2024-04-15T08:00:00Z',
    updated_at: '2024-04-15T08:00:00Z',
    beneficiaries: [],
  },
  {
    id: '2',
    title: 'Term 2 OVC Support Report — 2024',
    body: `This report covers OVC grant disbursements for Term 2, 2024.\n\nFive new children were registered this term following re-entry from out-of-school status. Sanitary towels were distributed to all eligible female students. Calculator sets were provided to Grade 12 students preparing for national examinations.\n\nAn NGO partner contributed additional funding for text books across the sciences. Total beneficiaries this term: 52.`,
    term: 'TERM_2',
    year: 2024,
    created_by: '2',
    created_by_name: 'Grace Mwale',
    created_at: '2024-08-20T10:00:00Z',
    updated_at: '2024-08-20T10:00:00Z',
    beneficiaries: [],
  },
  {
    id: '3',
    title: 'Term 3 OVC Support Report — 2024',
    body: `End-of-year OVC grant report for Helen Kaunda Secondary School, Term 3, 2024.\n\nThis term marked the highest number of registered beneficiaries since the programme began, with 58 children receiving support. Three children were removed from the register following improvement in household income as verified by CWAC.\n\nAll school bags and uniforms for the following year have been ordered in advance. Programme funding remains primarily from GRZ with supplementary support from Other Sponsors.`,
    term: 'TERM_3',
    year: 2024,
    created_by: '1',
    created_by_name: 'Admin User',
    created_at: '2024-12-05T09:00:00Z',
    updated_at: '2024-12-05T09:00:00Z',
    beneficiaries: [],
  },
]

export const mockReportsApi = {
  async list(filters?: ReportFilters): Promise<Report[]> {
    await delay()
    let results = [...MOCK_REPORTS]
    if (filters?.term) results = results.filter(r => r.term === filters.term)
    if (filters?.year) results = results.filter(r => r.year === filters.year)
    return results
  },

  async get(id: string): Promise<Report> {
    await delay()
    const found = MOCK_REPORTS.find(r => r.id === id)
    if (!found) throw { error: { code: 'NOT_FOUND', message: 'Report not found.' } }
    return { ...found }
  },

  async create(payload: ReportPayload, authorName: string, authorId: string): Promise<Report> {
    await delay()
    const beneficiaries = await resolveBeneficiaries(payload.child_ids)
    const report: Report = {
      id: uuid(),
      title: payload.title,
      body: payload.body,
      term: payload.term,
      year: payload.year,
      created_by: authorId,
      created_by_name: authorName,
      created_at: now(),
      updated_at: now(),
      beneficiaries,
    }
    MOCK_REPORTS.unshift(report)
    return report
  },

  async update(id: string, payload: Partial<ReportPayload>): Promise<Report> {
    await delay()
    const idx = MOCK_REPORTS.findIndex(r => r.id === id)
    if (idx === -1) throw { error: { code: 'NOT_FOUND', message: 'Report not found.' } }
    const beneficiaries = payload.child_ids
      ? await resolveBeneficiaries(payload.child_ids)
      : MOCK_REPORTS[idx]!.beneficiaries
    MOCK_REPORTS[idx] = {
      ...MOCK_REPORTS[idx]!,
      ...payload,
      beneficiaries,
      updated_at: now(),
    }
    return { ...MOCK_REPORTS[idx]! }
  },

  async delete(id: string): Promise<void> {
    await delay()
    const idx = MOCK_REPORTS.findIndex(r => r.id === id)
    if (idx !== -1) MOCK_REPORTS.splice(idx, 1)
  },
}
