export type UserRole = 'superadmin' | 'admin'

export type AuthUser = {
  id: number
  username: string
  displayName: string
  role: UserRole
  branchId: number | null
}

export type Branch = {
  id: number
  name: string
  governorate: string
  address: string
  phone: string
  whatsapp: string
  facebook: string | null
  telegram: string | null
  instagram: string | null
}

export type EventItem = {
  id: number
  branch_id: number
  title: string
  image_url: string
  announcement: string
  event_date: string
  location: string
  branch_name?: string
  branch_governorate?: string
}

export type SiteContent = {
  id: number
  organization_name: string
  slogan: string
  definition_text: string
  vision_text: string
  mission_text: string
  goals_text: string
  volunteer_form_url: string
}

export type AdminUser = {
  id: number
  username: string
  display_name: string
  role: UserRole
  branch_id: number | null
  branch_name: string | null
}
