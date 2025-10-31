/**
 * Supabaseデータベースの型定義
 * DB設計書.mdに基づいて定義されています
 * 
 * 実際のSupabaseプロジェクトから型を生成する場合は以下のコマンドを使用:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
 */

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
      profiles: {
        Row: {
          id: string // UUID
          name: string | null
          created_at: string // timestamptz
          updated_at: string // timestamptz
        }
        Insert: {
          id: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: number // bigint
          user_id: string | null // UUID
          role: string // 'user' or 'ai'
          message: string
          created_at: string // timestamptz
          updated_at: string // timestamptz
        }
        Insert: {
          id?: number
          user_id?: string | null
          role: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          role?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      suggestions: {
        Row: {
          id: number // bigint
          chat_message_id: number
          english_sentence: string
          japanese_translation: string
          created_at: string // timestamptz
          updated_at: string // timestamptz
        }
        Insert: {
          id?: number
          chat_message_id: number
          english_sentence: string
          japanese_translation: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          chat_message_id?: number
          english_sentence?: string
          japanese_translation?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_chat_message_id_fkey"
            columns: ["chat_message_id"]
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          }
        ]
      }
      bookmarks: {
        Row: {
          id: number // bigint
          user_id: string // UUID
          suggestion_id: number
          created_at: string // timestamptz
          updated_at: string // timestamptz
        }
        Insert: {
          id?: number
          user_id: string
          suggestion_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          suggestion_id?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_suggestion_id_fkey"
            columns: ["suggestion_id"]
            referencedRelation: "suggestions"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

