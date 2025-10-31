import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase認証コールバックハンドラー
 * メール確認後のリダイレクトを処理します
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // 認証コードをセッションに交換
    await supabase.auth.exchangeCodeForSession(code)
  }

  // ホームページにリダイレクト
  return NextResponse.redirect(`${origin}/`)
}

