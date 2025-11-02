import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayout } from '@/app/components/MainLayout'
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
    <MainLayout>
      <ChatMessages />
    </MainLayout>
  )
}

