import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatSidebar } from '@/app/components/ChatSidebar'
import { ChatMessagesWithHistory } from '@/app/components/ChatMessagesWithHistory'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * 特定のチャットグループの画面
 * 過去のメッセージ履歴を表示し、新しいメッセージを追加できる
 */
export default async function ChatGroupPage({ params }: PageProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { id } = await params
  const chatGroupId = parseInt(id, 10)

  if (isNaN(chatGroupId)) {
    return redirect('/chat')
  }

  // チャットグループの存在確認と所有者確認
  const { data: chatGroup, error: groupError } = await supabase
    .from('chat_groups')
    .select('id, title, user_id')
    .eq('id', chatGroupId)
    .eq('user_id', user.id)
    .single()

  if (groupError || !chatGroup) {
    console.error('Chat group not found or access denied:', groupError)
    return redirect('/chat')
  }

  // チャットメッセージ履歴を取得
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('id, role, message, created_at')
    .eq('chat_group_id', chatGroupId)
    .order('created_at', { ascending: true })

  if (messagesError) {
    console.error('Error fetching messages:', messagesError)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ChatSidebar />
      <main className="flex-1 ml-64">
        <ChatMessagesWithHistory
          chatGroupId={chatGroupId}
          chatGroupTitle={chatGroup.title}
          initialMessages={messages || []}
        />
      </main>
    </div>
  )
}

