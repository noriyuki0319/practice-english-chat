import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/app/components/MainLayout'

/**
 * ブックマーク一覧画面（画面設計書 S-02 に準拠）
 */
export default async function BookmarksPage() {
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
              ブックマーク一覧
            </h1>
          </div>
        </header>

        {/* コンテンツエリア */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* ブックマークがない場合の表示 */}
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">
              まだブックマークがありません
            </p>
            <p className="text-gray-500 text-sm mt-2">
              チャットで気に入った表現を保存してみましょう
            </p>
          </div>

          {/* ブックマークリスト（実装時に使用） */}
          {/* <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-lg shadow-md p-5 flex items-start justify-between hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <p className="text-gray-900 font-medium text-lg mb-2">
                    {bookmark.english_sentence}
                  </p>
                  <p className="text-gray-600">
                    {bookmark.japanese_translation}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    aria-label="音声再生"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="削除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </MainLayout>
  )
}

