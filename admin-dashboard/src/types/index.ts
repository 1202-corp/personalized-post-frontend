export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  access_token: string
  token_type: string
}

export type UserRole = 'guest' | 'member' | 'admin'
export type UserStatus = 'new' | 'onboarding' | 'training' | 'trained' | 'active' | 'churned'

export interface User {
  id: number
  telegram_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  status: UserStatus
  user_role: UserRole
  language: string
  bonus_channels_count: number
  created_at: string | null
  last_activity_at: string | null
  // Backward compatibility: computed property
  is_trained?: boolean
}

export interface Channel {
  id: number
  telegram_id: number
  username: string
  title: string
  is_default: boolean
  posts_count: number
}

export interface DashboardOverview {
  users: {
    total: number
    trained: number
    training_rate: number
  }
  channels: {
    total: number
  }
  posts: {
    total: number
  }
  interactions: {
    total: number
    likes: number
    dislikes: number
    skips: number
    like_rate: number
  }
}

export interface DailyStat {
  date: string
  new_users: number
  interactions: number
}

export interface ChannelStat {
  id: number
  username: string
  title: string
  posts_count: number
  interactions: number
  likes: number
  like_rate: number
}

export interface RetentionStat {
  retention_rate: number
  completion_rate: number
  active_users: number
  total_users: number
}

export interface RecommendationStat {
  posts_with_scores: number
  avg_liked_score: number
  avg_disliked_score: number
  score_difference: number
  scoring_coverage: number
}

export interface DashboardData {
  overview: DashboardOverview
  daily: DailyStat[]
  channels: ChannelStat[]
  retention: RetentionStat
  recommendations: RecommendationStat
}

export interface ABTestVariant {
  algorithm: string
  users: number
  trained: number
  post_training_interactions: number
  like_rate: number | null
  note?: string
}

export interface ABTestResults {
  variants: Record<string, ABTestVariant>
}

export interface ClusterStats {
  total_clusters: number
  total_posts: number
  posts_with_clusters: number
  cluster_distribution: Record<number, number>
}

export interface PaginatedResponse<T> {
  total: number
  skip: number
  limit: number
  items: T[]
}
