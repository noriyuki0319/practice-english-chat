import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

/**
 * Middleware用のSupabaseクライアントを作成
 * 認証状態の更新とセッション管理を行います
 * 環境変数はサーバー側でのみ使用され、クライアントに公開されません
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // サーバー専用の環境変数（NEXT_PUBLIC_プレフィックスなし）
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are not set')
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッションを更新（重要: サーバーコンポーネントでユーザー情報を取得する前に実行する必要があります）
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 認証が必要なページへのアクセス制御を追加する場合はここに記述
  // 例: if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return supabaseResponse
}

