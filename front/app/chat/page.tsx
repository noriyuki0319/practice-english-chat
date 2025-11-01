import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/app/components/MainLayout'

/**
 * チャット画面（画面設計書 S-01 に準拠）
 */
export default async function ChatPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-screen">
        {/* チャットログエリア */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* システム初期メッセージ */}
            <div className="flex justify-start mb-4">
              <div className="bg-white rounded-lg shadow-md p-4 max-w-xl">
                <p className="text-gray-800">
                  こんにちは！英語学習のお手伝いをします。<br />
                  どんな場面で使える英語表現を知りたいですか？
                </p>
              </div>
            </div>

            {/* ここにチャットメッセージが表示される */}
            <div className="text-center text-gray-500 py-12">
              <p>メッセージを送信してチャットを開始しましょう</p>
            </div>
          </div>
        </div>

        {/* 入力フッター */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <form className="flex gap-3">
              <input
                type="text"
                placeholder="（例）会議で使えるフレーズ"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                送信
              </button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

