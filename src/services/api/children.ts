import { apiClient } from './client'
import type { Child, ChildWithRelations, ChildPayload } from '@/types/child'

export interface ChildListParams extends Record<string, string | number | boolean | undefined> {
  search?: string
}

export const childrenApi = {
  list: (params?: ChildListParams) =>
    apiClient.get<ChildWithRelations[]>('/children', { params }),

  get: (id: string) =>
    apiClient.get<ChildWithRelations>(`/children/${id}`),

  create: (payload: ChildPayload): Promise<ChildWithRelations> =>
    apiClient.post<Child>('/children', {
      pupil_id:             payload.pupil_id,
      first_name:           payload.first_name,
      last_name:            payload.last_name,
      address:              payload.address,
      class_name:           payload.class_name,
      image_url:            payload.image_url ?? null,
      guardian_first_name:  payload.guardian_first_name,
      guardian_last_name:   payload.guardian_last_name,
      guardian_address:     payload.guardian_address,
      guardian_phone:       payload.guardian_phone,
    }).then(child => childrenApi._setRelations(child.id, payload)),

  update: (id: string, payload: ChildPayload): Promise<ChildWithRelations> =>
    apiClient.put<void>(`/children/${id}`, {
      first_name:           payload.first_name,
      last_name:            payload.last_name,
      address:              payload.address,
      class_name:           payload.class_name,
      image_url:            payload.image_url ?? null,
      guardian_first_name:  payload.guardian_first_name,
      guardian_last_name:   payload.guardian_last_name,
      guardian_address:     payload.guardian_address,
      guardian_phone:       payload.guardian_phone,
    }).then(() => childrenApi._setRelations(id, payload)),

  delete: (id: string) =>
    apiClient.delete<void>(`/children/${id}`),

  // Sets all three relationship types then fetches the full record
  async _setRelations(id: string, payload: ChildPayload): Promise<ChildWithRelations> {
    await Promise.all([
      apiClient.put<void>(`/children/${id}/categories`, {
        category_ids: payload.category_ids,
      }),
      apiClient.put<void>(`/children/${id}/requisites`, {
        requisites: payload.requisites.map(r => ({
          requisite_id:   r.id,
          quantity:       r.quantity,
          checked:        r.checked,
          price_per_item: r.price_per_item,
        })),
      }),
      apiClient.put<void>(`/children/${id}/sponsors`, {
        sponsor_ids: payload.sponsor_ids,
      }),
    ])
    return childrenApi.get(id)
  },
}
