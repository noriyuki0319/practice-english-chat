import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase認証コールバックハンドラー
 * メール確認後のリダイレクトを処理します
 * パスワードリセット、メール確認などで使用されます
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // 認証コードをセッションに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // エラーがあってもリダイレクトは継続
    }
  }

  // next パラメータで指定された場所、またはホームページにリダイレクト
  return NextResponse.redirect(`${origin}${next}`)
}

