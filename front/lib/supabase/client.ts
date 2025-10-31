import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

/**
 * ブラウザ用のSupabaseクライアントを作成
 * クライアントコンポーネントで使用します
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

