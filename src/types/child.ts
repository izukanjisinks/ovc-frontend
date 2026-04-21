export interface Child {
  id: string
  pupil_id: string
  first_name: string
  last_name: string
  address: string
  class_name: string
  image_url?: string
  guardian_first_name: string
  guardian_last_name: string
  guardian_address: string
  guardian_phone: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ChildCategory {
  id: number
  name: string
}

export interface ChildRequisite {
  id: number
  name: string
  checked: boolean
  quantity: number
  price_per_item: number
}

export interface ChildSponsor {
  id: number
  name: string
}

export interface ChildWithRelations extends Child {
  categories: ChildCategory[]
  requisites: ChildRequisite[]
  sponsors: ChildSponsor[]
}

export interface ChildPayload {
  pupil_id: string
  first_name: string
  last_name: string
  address: string
  class_name: string
  image_url?: string
  guardian_first_name: string
  guardian_last_name: string
  guardian_address: string
  guardian_phone: string
  category_ids: number[]
  requisites: { id: number; checked: boolean; quantity: number; price_per_item: number }[]
  sponsor_ids: number[]
}
