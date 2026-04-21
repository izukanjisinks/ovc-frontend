# OVC-MIS Build Guide — Restructuring from Existing Codebase

This guide maps every build phase to specific files from the existing hotel management system
that will be **reused directly**, **adapted**, or **replaced**. The goal is to avoid starting
from scratch — the infrastructure, UI library, patterns, and tooling are all already in place.

---

## Key Decisions Before Starting

| Decision | Choice | Reason |
|---|---|---|
| PDF generation | Keep `@ceereals/vue-pdf` (already in devDependencies) | Works well, proven in InvoiceDocument pattern |
| Toast notifications | Keep `vue-sonner` (already in dependencies) | Already wired in UsersView, works globally |
| UI components | Keep all of `src/components/ui/` untouched | Full Shadcn/reka-ui set — table, dialog, badge, input, checkbox, card, etc. |
| Charts (dashboard) | Keep `@unovis/vue` (already in dependencies) | Already used in ReportsView — donut + bar charts fit OVC stats perfectly |
| State management | Keep Pinia pattern from existing stores | Consistent setup, composable actions |
| Auth flow | Adapt existing auth store + router guard | JWT pattern stays, only roles change |
| Mock layer | New `src/services/mock/` folder | Mirrors real API shape so swap-in is trivial later |

---

## Phase 1 — Cleanup & Restructure

**Goal:** Strip out all hotel domain code, wire in OVC skeleton.

### Delete entirely
These files have no reuse value and should be removed:

```
src/views/admin/bookings/
src/views/admin/clients/
src/views/admin/invoices/
src/views/admin/meals/
src/views/admin/rooms/
src/views/admin/workflow/
src/views/cleaner/
src/views/client/
src/views/profile/          ← replace with OVC profile later
src/components/bookings/
src/components/clients/
src/components/invoices/
src/components/meals/
src/components/rooms/
src/components/workflow/
src/stores/bookings.ts
src/stores/cleaning.ts
src/stores/clients.ts
src/stores/invoices.ts
src/stores/meals.ts
src/stores/rooms.ts
src/stores/workflow.ts
src/services/api/bookings.ts
src/services/api/client.ts
src/services/api/clients.ts
src/services/api/invoices.ts
src/services/api/meals.ts
src/services/api/room.ts
src/services/api/workflow.ts
src/types/booking.ts
src/types/cleaning.ts
src/types/client.ts
src/types/invoice.ts
src/types/meal.ts
src/types/room.ts
src/types/workflow.ts
```

### Keep untouched
```
src/components/ui/               ← entire Shadcn UI library
src/components/common/           ← ConfirmDialog, ForbiddenDialog, ResultDialog, Pagination, UnderDevelopment
src/components/layout/           ← AppSidebar, AccessDeniedDialog
src/components/dashboard/        ← DashboardHeader (used in every view as page title bar)
src/layouts/AuthenticatedLayout.vue
src/composables/useConfirmDialog.ts
src/composables/useForbiddenHandler.ts
src/composables/usePagination.ts
src/composables/usePermissions.ts
src/composables/useResultDialog.ts
src/lib/utils.ts
src/lib/firebase.ts              ← keep for image upload in Phase 4
src/services/storage.ts
src/main.ts
src/App.vue
```

### Adapt (modify, not replace)

| File | What changes |
|---|---|
| `src/router/index.ts` | Replace hotel routes with OVC routes: `/`, `/children`, `/children/new`, `/children/:id`, `/reports`, `/reports/new`, `/about`. Update roles to `admin`, `user`, `inspector`. |
| `src/components/layout/AppSidebar.vue` | Replace nav items with: Home, Children, Reports, About, Log Out. Keep sidebar structure and styling. |
| `src/stores/auth.ts` | Change `TOKEN_KEY` from `lodge_token` to `ovc_token`. Update `roleLabel` map to `admin → Administrator`, `user → Guidance Staff`, `inspector → Inspector`. Keep all auth logic. |
| `src/types/auth.ts` | Update `UserRole` type to `'admin' \| 'user' \| 'inspector'`. Keep `AuthUser`, `LoginCredentials`, `ApiError` shapes. |
| `src/services/api/auth.ts` | Keep structure, update endpoint base URL to OVC API when backend is ready. For now it will call mock. |
| `src/views/auth/LoginView.vue` | Update branding: school name, mission tagline. Keep form, validation, and auth store wiring. |
| `src/views/admin/reports/ReportsView.vue` | **Repurpose** — this becomes the OVC Reports list view (see Phase 5). |
| `src/views/admin/users/UsersView.vue` | **Repurpose** — this becomes the base pattern for ChildrenView (table + search + CRUD dialogs). |
| `src/views/dashboard/DashboardView.vue` | **Repurpose** — becomes OVC Home/Dashboard with stats + highlights. |

### New files to create
```
src/views/admin/children/ChildrenView.vue
src/views/admin/children/ChildDetailView.vue
src/views/admin/children/AddEditChildView.vue
src/views/admin/reports/ReportsView.vue        ← replace existing
src/views/about/AboutView.vue
```

---

## Phase 2 — Types & Mock Data Layer

**Goal:** Establish all TypeScript types and a mock data service that mirrors the real API.

### New type files
```
src/types/child.ts       ← Child, Guardian, ChildWithRelations
src/types/category.ts    ← OvcCategory
src/types/requisite.ts   ← Requisite, ChildRequisite
src/types/sponsor.ts     ← Sponsor
src/types/report.ts      ← Report
src/types/dashboard.ts   ← DashboardStats, Highlight (replace existing)
```

These map directly from the DB schema in the project spec (Section 7).

### New mock service files
```
src/services/mock/children.ts    ← CRUD operations on in-memory children array
src/services/mock/categories.ts  ← static list of 8 OVC categories
src/services/mock/requisites.ts  ← static list of 8 requisites
src/services/mock/sponsors.ts    ← static list of 3 sponsors
src/services/mock/reports.ts     ← CRUD operations on in-memory reports array
src/services/mock/dashboard.ts   ← computed stats from mock children
src/services/mock/auth.ts        ← mock login, returns fake JWT, 2 users (admin + user role)
```

**Pattern:** Each mock file exports an object with the same function signatures the real API
service will use. Stores import from mock during this phase. When the backend is ready, change
the import in the store from `@/services/mock/X` to `@/services/api/X` — nothing else changes.

### New store files
```
src/stores/children.ts    ← list, selected, loading, error + fetchChildren, createChild, updateChild, deleteChild
src/stores/reports.ts     ← list, loading, error + fetchReports, createReport, updateReport, deleteReport
src/stores/dashboard.ts   ← stats, highlights + fetchStats, fetchHighlights (replace existing)
```

**Reuse pattern from:** `src/stores/users.ts` — same loading/error/CRUD action pattern.

---

## Phase 3 — Auth & Login Page

**Goal:** Adapt login to OVC branding, wire mock auth, confirm full auth flow works end-to-end.

### Reuse directly
| File | Reuse |
|---|---|
| `src/stores/auth.ts` | Keep all logic — only change TOKEN_KEY and role labels (done in Phase 1) |
| `src/router/index.ts` | Navigation guard logic is identical — requiresAuth, guestOnly, role check |
| `src/layouts/AuthenticatedLayout.vue` | No changes needed |
| `src/composables/useForbiddenHandler.ts` | No changes needed |

### Adapt
| File | What changes |
|---|---|
| `src/views/auth/LoginView.vue` | Update page title, logo/branding to "OVC-MIS — Helen Kaunda Secondary School". Keep form inputs, validation, error display, and `authStore.login()` call. |
| `src/services/api/auth.ts` | Point to `src/services/mock/auth.ts` for now. Mock returns `{ token: 'mock-jwt', user: { id, email, full_name, role } }`. |

### Mock users (seeded in mock/auth.ts)
```
admin@ovc.edu  / password → role: admin
staff@ovc.edu  / password → role: user
```

---

## Phase 4 — Children Module

**Goal:** Full CRUD for children including the multi-step add/edit form and relationship modals.

### Reuse directly
| Existing file | Used for |
|---|---|
| `src/views/admin/users/UsersView.vue` | **Base pattern** for ChildrenView — table structure, search bar, pagination, add button, delete dialog. Copy and adapt. |
| `src/composables/usePagination.ts` | Pagination for children table — no changes needed |
| `src/components/common/ConfirmDialog.vue` | Delete child confirmation — no changes needed |
| `src/components/ui/table/` | Children data table — no changes needed |
| `src/components/ui/dialog/` | All modals (categories, requisites, sponsors) — no changes needed |
| `src/components/ui/checkbox/` | OVC category and sponsor checkboxes — no changes needed |
| `src/components/ui/badge/` | OVC category and sponsor badges in table — no changes needed |
| `src/lib/firebase.ts` | Child photo upload (Firebase Storage) — already wired for image upload |
| `src/composables/useResultDialog.ts` | Success/error feedback — no changes needed |
| `vue-sonner` (toast) | Save/delete success toasts — same pattern as UsersView |

### New components to create
```
src/components/children/ChildDialog.vue           ← multi-step form (Info → Requisites → Categories → Sponsors)
src/components/children/CategorySelectDialog.vue  ← checkbox modal for OVC categories
src/components/children/RequisiteSelectDialog.vue ← checklist with +/- quantity controls per item
src/components/children/SponsorSelectDialog.vue   ← checkbox modal for sponsors
```

**Pattern for dialogs:** Copy structure from `src/components/users/UserDialog.vue` — same
`v-model:open`, `defineEmits(['saved'])`, loading state, form validation pattern.

### New views
```
src/views/admin/children/ChildrenView.vue     ← table + search + add/delete
src/views/admin/children/AddEditChildView.vue ← full-page multi-step form
src/views/admin/children/ChildDetailView.vue  ← read-only child record summary
```

### Firebase image upload
The existing `src/lib/firebase.ts` and the pattern from `src/components/rooms/RoomImageDialog.vue`
already handle Firebase Storage uploads. The child photo upload will follow the same pattern:
upload to Firebase Storage, get back a URL, store `image_url` on the child record.

---

## Phase 5 — Reports Module

**Goal:** Report CRUD with term/year filtering and PDF generation.

### Reuse directly
| Existing file | Used for |
|---|---|
| `src/components/invoices/InvoicePdfSheet.vue` | **Base pattern** for ReportPdfSheet — same `<PDFViewer>` + `<PDFDownloadLink>` slide-out sheet |
| `src/components/invoices/InvoiceDocument.vue` | **Base pattern** for ReportDocument — same `<Document><Page>` layout structure using `@ceereals/vue-pdf` |
| `src/views/admin/users/UsersView.vue` | **Base pattern** for ReportsView — table, search, filter toolbar, pagination, delete dialog |
| `src/composables/usePagination.ts` | Reports table pagination — no changes needed |
| `src/components/common/ConfirmDialog.vue` | Delete report confirmation — no changes needed |
| `@ceereals/vue-pdf` | PDF preview and download — already in devDependencies, no install needed |
| `vue-sonner` (toast) | Save/delete feedback — same pattern |

### New components
```
src/components/reports/ReportDocument.vue     ← PDF layout: school header, title, body, term/year, author, signature
src/components/reports/ReportPdfSheet.vue     ← slide-out sheet with PDFViewer + PDFDownloadLink
src/components/reports/ReportDialog.vue       ← create/edit report form (title, body textarea, term select, year input)
src/components/reports/FilterReportsDialog.vue ← modal: term radio buttons (1/2/3) + year dropdown
```

### New views
```
src/views/admin/reports/ReportsView.vue       ← replaces existing (hotel charts view)
```

### PDF document structure (ReportDocument.vue)
Follows the same style-as-JS-objects pattern from `InvoiceDocument.vue`:
- Header: School name + "OVC Management Information System"
- Report title (large)
- Term and year
- Body text
- Author name + date
- Signature line
- Footer: page number

---

## Phase 6 — Dashboard / Home Page

**Goal:** Welcome page with school mission, summary stats cards, and highlights carousel.

### Reuse directly
| Existing file | Used for |
|---|---|
| `src/views/admin/reports/ReportsView.vue` (current hotel version) | **Base pattern** for stat cards and chart layout — Card + CardContent + CardHeader grid pattern |
| `src/components/ui/card/` | Stats cards (total children, by category, by sponsor) — no changes needed |
| `@unovis/vue` | Category breakdown donut chart — same `VisDonut` pattern already used in hotel ReportsView |
| `src/components/dashboard/DashboardHeader.vue` | Page title bar — no changes needed |
| `src/stores/dashboard.ts` | Replaced with OVC dashboard store (Phase 2) but same pattern |

### New components
```
src/components/dashboard/HighlightsCarousel.vue  ← image carousel for term highlights
src/components/dashboard/StatsCard.vue           ← reusable stat card (count + label + optional breakdown)
```

### New views
```
src/views/dashboard/DashboardView.vue   ← replaces existing hotel dashboard
```

### Stats to display
- Total children registered
- Breakdown by OVC category (donut chart using `@unovis/vue`)
- Breakdown by sponsor (donut chart)
- Current term + year
- Highlights image carousel

---

## Phase 7 — About Page & Polish

**Goal:** About page, form validation, loading states, empty states, toasts everywhere.

### Reuse directly
| Existing file | Used for |
|---|---|
| `src/components/common/UnderDevelopment.vue` | Placeholder for About page initially |
| `vue-sonner` | All success/error toasts — pattern already established in UsersView |
| `src/components/common/ResultDialog.vue` | Global operation feedback — already wired in AuthenticatedLayout |
| `src/composables/useResultDialog.ts` | Trigger result dialogs — no changes needed |

### New views
```
src/views/about/AboutView.vue   ← system info, school contact, developer credit, version
```

### Polish checklist
- All forms: required field validation with inline error messages using `src/components/ui/field/`
- All tables: loading skeleton rows (pattern from UsersView lines 133–138)
- All tables: empty state message (pattern from UsersView lines 141–147)
- All async actions: loading spinner on submit buttons (pattern from UsersView `deleting` ref)
- Children table: avatar/photo column with fallback initials if no image

---

## Phase 8 — Backend Swap-In

**Goal:** Replace mock services with real Go API calls. No component changes needed.

### Files to replace (one per domain)
```
src/services/mock/auth.ts       → src/services/api/auth.ts
src/services/mock/children.ts   → src/services/api/children.ts
src/services/mock/categories.ts → src/services/api/categories.ts
src/services/mock/requisites.ts → src/services/api/requisites.ts
src/services/mock/sponsors.ts   → src/services/api/sponsors.ts
src/services/mock/reports.ts    → src/services/api/reports.ts
src/services/mock/dashboard.ts  → src/services/api/dashboard.ts
```

Each store has a single import line that changes from `mock` to `api`. Because the function
signatures are identical, no store logic changes.

### Auth wiring
- Replace mock JWT with real JWT from Go backend
- Update `src/services/api/auth.ts` base URL to point to deployed Go server
- Add Authorization header injection (likely via an axios/fetch interceptor in `src/lib/http.ts`)

---

## Component Reuse Summary Table

| Existing component | Reused in OVC phase | Change needed |
|---|---|---|
| `AppSidebar.vue` | Phase 1 | Update nav items only |
| `AuthenticatedLayout.vue` | All phases | None |
| `DashboardHeader.vue` | All phases | None |
| `ConfirmDialog.vue` | Phase 4, 5 | None |
| `ResultDialog.vue` | All phases | None |
| `ForbiddenDialog.vue` | All phases | None |
| `Pagination.vue` | Phase 4, 5 | None |
| `usePagination.ts` | Phase 4, 5 | None |
| `useConfirmDialog.ts` | Phase 4, 5 | None |
| `useResultDialog.ts` | All phases | None |
| `usePermissions.ts` | Phase 4 | Update role names |
| `UsersView.vue` | Phase 4, 5 | Base pattern — copy and adapt |
| `UserDialog.vue` | Phase 4 | Base pattern for ChildDialog |
| `InvoiceDocument.vue` | Phase 5 | Base pattern for ReportDocument |
| `InvoicePdfSheet.vue` | Phase 5 | Base pattern for ReportPdfSheet |
| `LoginView.vue` | Phase 3 | Branding update only |
| `auth store` | Phase 3+ | TOKEN_KEY + role labels only |
| `router/index.ts` | Phase 1 | Routes + roles only |
| All `src/components/ui/` | All phases | None |
| `@ceereals/vue-pdf` | Phase 5 | None — already installed |
| `@unovis/vue` | Phase 6 | None — already installed |
| `vue-sonner` | All phases | None — already installed |
| `firebase.ts` | Phase 4 | None — reuse for child photo upload |
