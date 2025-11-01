import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'

/**
 * トップページ（ログイン後のホーム画面）
 * ログインしているユーザーのメールアドレスを表示します
 */
export default async function HomePage() {
  const supabase = await createClient()

  // 現在のユーザー情報を取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ログインしていない場合はログインページへリダイレクト
  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
          {/* ヘッダー */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI英語学習チャット
            </h1>
            <p className="text-gray-600">ログイン成功！</p>
          </div>

          {/* ユーザー情報 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              ログイン中のユーザー
            </h2>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="text-gray-800 font-medium break-all">
                {user.email}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ユーザーID: {user.id}
            </p>
          </div>

          {/* ログアウトボタン */}
          <form action={signOut} className="space-y-4">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            >
              ログアウト
            </button>
          </form>

          {/* 追加情報 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              今後、ここにチャット機能が追加されます
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
