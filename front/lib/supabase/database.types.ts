/**
 * Supabaseデータベースの型定義
 * DB設計書.mdに基づいて定義されています
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
      chat_groups: {
        Row: {
          id: number // bigint
          user_id: string // UUID
          title: string
          created_at: string // timestamptz
          updated_at: string // timestamptz
        }
        Insert: {
          id?: number
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_groups_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: number // bigint
          chat_group_id: number // bigint
          user_id: string | null // UUID (nullable for AI messages)
          role: string // 'user' or 'ai'
          message: string
          created_at: string // timestamptz
          updated_at: string // timestamptz
        }
        Insert: {
          id?: number
          chat_group_id: number
          user_id?: string | null
          role: string
          message: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          chat_group_id?: number
          user_id?: string | null
          role?: string
          message?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_group_id_fkey"
            columns: ["chat_group_id"]
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bookmarks: {
        Row: {
          id: number // bigint
          user_id: string // UUID
          chat_message_id: number // bigint
          created_at: string // timestamptz
          updated_at: string // timestamptz
        }
        Insert: {
          id?: number
          user_id: string
          chat_message_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          chat_message_id?: number
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
            foreignKeyName: "bookmarks_chat_message_id_fkey"
            columns: ["chat_message_id"]
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

