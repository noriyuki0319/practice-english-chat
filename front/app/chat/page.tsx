import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatSidebar } from '@/app/components/ChatSidebar'
import { ChatMessages } from '@/app/components/ChatMessages'

/**
 * チャット画面（画面設計書 S-01 に準拠）
 * AI SDKを使用したストリーミングチャット機能
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
    <div className="flex min-h-screen bg-gray-50">
      <ChatSidebar />
      <main className="flex-1 ml-64">
        <ChatMessages />
      </main>
    </div>
  )
}

