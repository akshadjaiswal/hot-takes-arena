// Database types generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hottakes_categories: {
        Row: {
          id: string
          name: string
          slug: string
          emoji: string | null
          display_order: number | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          emoji?: string | null
          display_order?: number | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          emoji?: string | null
          display_order?: number | null
          is_active?: boolean
        }
      }
      hottakes_takes: {
        Row: {
          id: string
          content: string
          category: string
          created_at: string
          agree_count: number
          disagree_count: number
          total_votes: number
          controversy_score: number | null
          is_hidden: boolean
          hidden_reason: string | null
          device_fingerprint: string | null
          ip_hash: string | null
        }
        Insert: {
          id?: string
          content: string
          category: string
          created_at?: string
          agree_count?: number
          disagree_count?: number
          total_votes?: number
          controversy_score?: number | null
          is_hidden?: boolean
          hidden_reason?: string | null
          device_fingerprint?: string | null
          ip_hash?: string | null
        }
        Update: {
          id?: string
          content?: string
          category?: string
          created_at?: string
          agree_count?: number
          disagree_count?: number
          total_votes?: number
          controversy_score?: number | null
          is_hidden?: boolean
          hidden_reason?: string | null
          device_fingerprint?: string | null
          ip_hash?: string | null
        }
      }
      hottakes_votes: {
        Row: {
          id: string
          take_id: string
          vote_type: 'agree' | 'disagree'
          created_at: string
          device_fingerprint: string
          ip_hash: string
        }
        Insert: {
          id?: string
          take_id: string
          vote_type: 'agree' | 'disagree'
          created_at?: string
          device_fingerprint: string
          ip_hash: string
        }
        Update: {
          id?: string
          take_id?: string
          vote_type?: 'agree' | 'disagree'
          created_at?: string
          device_fingerprint?: string
          ip_hash?: string
        }
      }
      hottakes_reports: {
        Row: {
          id: string
          take_id: string
          reason: string
          additional_info: string | null
          reported_at: string
          status: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
          reviewed_by: string | null
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          take_id: string
          reason: string
          additional_info?: string | null
          reported_at?: string
          status?: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          take_id?: string
          reason?: string
          additional_info?: string | null
          reported_at?: string
          status?: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
          reviewed_by?: string | null
          reviewed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Category = Database['public']['Tables']['hottakes_categories']['Row']
export type Take = Database['public']['Tables']['hottakes_takes']['Row']
export type Vote = Database['public']['Tables']['hottakes_votes']['Row']
export type Report = Database['public']['Tables']['hottakes_reports']['Row']

export type InsertTake = Database['public']['Tables']['hottakes_takes']['Insert']
export type InsertVote = Database['public']['Tables']['hottakes_votes']['Insert']
export type InsertReport = Database['public']['Tables']['hottakes_reports']['Insert']

export type VoteType = 'agree' | 'disagree'
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed'

// Extended types with computed properties
export interface TakeWithVoteCheck extends Take {
  userVote?: VoteType | null
  agreePercentage: number
  disagreePercentage: number
}

export interface TakeWithReports extends Take {
  reports?: Report[]
  reportCount?: number
}

// Sort options
export type SortOption = 'controversial' | 'fresh' | 'trending' | 'top_agreed' | 'top_disagreed'

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  nextCursor?: string
  hasMore: boolean
}
