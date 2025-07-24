export interface User {
  id: string
  email: string
  name: string
  role: 'client' | 'supplier' | 'admin' | '営業1番隊' | '営業2番隊' | '営業3番隊' | '営業1番隊隊長' | '営業2番隊隊長' | '営業3番隊隊長'
  company_id?: string
  avatar?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  name?: string
  email?: string
  role: 'client' | 'supplier' | 'admin' | 'user'
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  avatar?: string
  phone?: string
  company_id?: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  status: 'pending' | 'approved' | 'suspended' | 'rejected'
  role?: 'client' | 'supplier' | 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface JobPost {
  id: string
  title: string
  description: string
  budget: number
  daily_rate?: number
  work_days: number
  work_dates?: any
  location: string
  skill_tags: string[]
  work_type: 'fulltime' | 'event' | 'retail' | 'any'
  preferred_carrier: string[]
  status: 'draft' | 'active' | 'closed' | 'completed' | 'assigned'
  user_id: string
  company_id?: string
  company_name?: string
  is_hot: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface TalentProfile {
  id: string
  name: string
  skills: string[]
  rate: number
  location: string
  experience_years: number
  bio: string
  work_type: 'fulltime' | 'event' | 'retail' | 'any'
  preferred_carrier: string[]
  portfolio?: string
  avatar?: string
  user_id: string
  status: 'available' | 'busy' | 'unavailable' | 'assigned'
  company_name?: string
  is_hot: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface Partner {
  id: string
  name: string
  description: string
  location: string
  company_size: 'startup' | 'small' | 'medium' | 'large'
  employee_count: number
  specialties: string[]
  website?: string
  contact_email?: string
  rating: number
  review_count: number
  user_id: string
  created_at: string
  updated_at: string
  user?: User
}

export interface Match {
  id: string
  job_post_id: string
  talent_profile_id: string
  proposer_id: string
  proposer_type: 'client' | 'talent'
  status: 'pending' | 'accepted' | 'rejected' | 'contracted' | 'completed' | 'assigned'
  assignment_type?: 'ongoing' | 'single'
  message?: string
  approval_requested: boolean
  approved_by: string[]
  pending_approval_from: string[]
  created_at: string
  updated_at: string
  job_post?: JobPost
  talent_profile?: TalentProfile
}

export interface Assignment {
  id: string
  match_id: string
  job_post_id: string
  talent_profile_id: string
  client_user_id: string
  talent_user_id: string
  status: 'active' | 'completed' | 'paused'
  start_date: string
  end_date?: string
  monthly_profit: number
  total_profit: number
  last_profit_calculation: string
  notes?: string
  created_at: string
  updated_at: string
  match?: Match
  job_post?: JobPost
  talent_profile?: TalentProfile
}

export interface ChatRoom {
  id: string
  name: string
  job_post_id?: string
  talent_profile_id?: string
  participant_ids: string[]
  last_message_at: string
  created_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  message: string
  message_type: 'text' | 'system' | 'approval_request'
  is_read: boolean
  created_at: string
  sender?: User
}

export interface Notification {
  id: string
  user_id: string
  type: 'message' | 'match' | 'job' | 'talent' | 'partner' | 'approval_request'
  title: string
  message: string
  related_id?: string
  is_read: boolean
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  favoritable_id: string
  favoritable_type: 'job' | 'talent' | 'partner'
  created_at: string
}

export interface Profit {
  id: string
  user_id: string
  match_id: string
  assignment_id?: string
  job_post_id: string
  talent_profile_id: string
  amount: number
  month: string
  type: 'client' | 'talent'
  profit_type: 'single' | 'monthly'
  created_at: string
}

export interface TimelinePost {
  id: string
  user_id: string
  content: string
  images: string[]
  likes: string[]
  created_at: string
  updated_at: string
  user?: User
}

export interface TimelineReply {
  id: string
  post_id: string
  user_id: string
  content: string
  likes: string[]
  created_at: string
  user?: User
}

export interface SalesTarget {
  id: string
  target_amount: number
  current_month: string
  created_at: string
  updated_at: string
}

export interface PartnerReview {
  id: string
  partner_id: string
  user_id: string
  rating: number
  content: string
  created_at: string
  user?: User
}

export interface Comment {
  id: string
  content: string
  user_id: string
  commentable_id: string
  commentable_type: 'job' | 'talent'
  created_at: string
  updated_at: string
  user?: User
}

export interface ApprovedUser {
  id: string
  user_id: string
  approved_by?: string
  approved_at: string
}