import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * トップページ
 * ログイン済みユーザーは自動的にチャット画面へリダイレクト
 * 未ログインユーザーはログイン画面へリダイレクト
 */
export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // ログイン済みの場合はチャット画面へリダイレクト
  return redirect('/chat')
}
