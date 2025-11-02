import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/app/components/MainLayout'
import { Volume2, Trash2 } from 'lucide-react'

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

  // モックデータ
  const mockBookmarks = [
    {
      id: 1,
      english_sentence: "Could you please send me the meeting agenda in advance?",
      japanese_translation: "事前に会議の議題を送っていただけますか？",
      created_at: "2024-11-01T10:30:00Z"
    },
    {
      id: 2,
      english_sentence: "I'd like to schedule a follow-up meeting to discuss this further.",
      japanese_translation: "これについてさらに話し合うためのフォローアップミーティングを予定したいのですが。",
      created_at: "2024-11-01T11:15:00Z"
    },
    {
      id: 3,
      english_sentence: "Let me get back to you on that by the end of the week.",
      japanese_translation: "週末までにそれについて返事をさせてください。",
      created_at: "2024-11-01T14:20:00Z"
    },
    {
      id: 4,
      english_sentence: "Could you walk me through the process step by step?",
      japanese_translation: "そのプロセスを段階的に説明していただけますか？",
      created_at: "2024-11-01T15:45:00Z"
    },
    {
      id: 5,
      english_sentence: "I appreciate your prompt response on this matter.",
      japanese_translation: "この件について迅速にご対応いただきありがとうございます。",
      created_at: "2024-11-01T16:30:00Z"
    }
  ]

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 py-6">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              ブックマーク一覧
            </h1>
            <p className="text-center text-sm text-gray-500 mt-2">
              保存した英語表現: {mockBookmarks.length}件
            </p>
          </div>
        </header>

        {/* コンテンツエリア */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {mockBookmarks.length === 0 ? (
            /* ブックマークがない場合の表示 */
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
          ) : (
            /* ブックマークリスト */
            <div className="space-y-4">
              {mockBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-white rounded-lg shadow-md p-5 flex items-start justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium text-lg mb-2">
                      {bookmark.english_sentence}
                    </p>
                    <p className="text-gray-600 mb-3">
                      {bookmark.japanese_translation}
                    </p>
                    <p className="text-xs text-gray-400">
                      保存日時: {new Date(bookmark.created_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="音声再生"
                      title="音声再生"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="削除"
                      title="削除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}

