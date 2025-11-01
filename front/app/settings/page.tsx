import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/app/components/MainLayout'

/**
 * 設定画面（画面設計書 S-06 に準拠）
 */
export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              設定
            </h1>
          </div>
        </header>

        {/* コンテンツエリア */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
            {/* アカウント情報セクション */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                アカウント情報
              </h2>
              <div className="space-y-3">
                {/* 現在のメールアドレス表示 */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-gray-600">メールアドレス</p>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>
                </div>

                {/* メールアドレス変更（将来実装） */}
                {/* <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-700">メールアドレス変更</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button> */}

                {/* パスワード変更 */}
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <span className="text-gray-700">パスワード変更</span>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* システムセクション */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                システム
              </h2>
              <div className="space-y-3">
                {/* 退会する */}
                <button
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-between text-red-600"
                >
                  <span className="font-medium">退会する</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ユーザー情報表示 */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">ユーザーID</p>
            <p className="text-xs text-gray-500 font-mono mt-1 break-all">
              {user.id}
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

