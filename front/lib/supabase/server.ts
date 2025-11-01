import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

/**
 * サーバーコンポーネント用のSupabaseクライアントを作成
 * Server Components、Server Actions、Route Handlersで使用します
 * 環境変数はサーバー側でのみ使用され、クライアントに公開されません
 */
export async function createClient() {
  const cookieStore = await cookies()

  // サーバー専用の環境変数（NEXT_PUBLIC_プレフィックスなし）
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not set. Please set SUPABASE_URL and SUPABASE_ANON_KEY.')
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentからset cookieを呼び出した場合は無視
            // Middlewareでハンドリングされます
          }
        },
      },
    }
  )
}

