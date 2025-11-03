import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/app/components/MainLayout'
import { BookmarksList } from '@/app/components/BookmarksList'

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
          <BookmarksList />
        </div>
      </div>
    </MainLayout>
  )
}

