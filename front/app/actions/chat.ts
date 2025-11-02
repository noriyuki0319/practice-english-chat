'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * ユーザーのチャットグループを取得
 * 最新10件を取得
 */
export async function getChatGroups() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('chat_groups')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching chat groups:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * 新しいチャットグループを作成
 */
export async function createChatGroup(title: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('chat_groups')
    .insert({
      user_id: user.id,
      title,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating chat group:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * チャットグループを削除
 */
export async function deleteChatGroup(groupId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('chat_groups')
    .delete()
    .eq('id', groupId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting chat group:', error)
    return { error: error.message }
  }

  return { error: null }
}

/**
 * チャットグループ作成とユーザーメッセージ保存
 * ユーザーの最初のメッセージ送信時に実行
 */
export async function createChatGroupWithMessage(message: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // タイトルはメッセージの最初の30文字
  const title = message.length > 30 ? message.slice(0, 30) + '...' : message

  // チャットグループを作成
  const { data: chatGroup, error: groupError } = await supabase
    .from('chat_groups')
    .insert({
      user_id: user.id,
      title,
    })
    .select()
    .single()

  if (groupError || !chatGroup) {
    console.error('Error creating chat group:', groupError)
    return { data: null, error: groupError?.message || 'Failed to create chat group' }
  }

  // ユーザーメッセージを保存
  const { data: userMessage, error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      chat_group_id: chatGroup.id,
      user_id: user.id,
      role: 'user',
      message,
    })
    .select()
    .single()

  if (messageError || !userMessage) {
    console.error('Error creating user message:', messageError)
    return { data: null, error: messageError?.message || 'Failed to create user message' }
  }

  return {
    data: {
      chat_group: chatGroup,
      user_message: userMessage,
    },
    error: null,
  }
}

/**
 * ユーザーメッセージを既存のチャットグループに保存
 */
export async function saveUserMessage(chatGroupId: number, message: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // チャットグループの所有者確認
  const { data: chatGroup, error: groupError } = await supabase
    .from('chat_groups')
    .select('id, user_id')
    .eq('id', chatGroupId)
    .eq('user_id', user.id)
    .single()

  if (groupError || !chatGroup) {
    console.error('Error fetching chat group:', groupError)
    return { data: null, error: 'Chat group not found or access denied' }
  }

  // ユーザーメッセージを保存
  const { data: userMessage, error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      chat_group_id: chatGroupId,
      user_id: user.id,
      role: 'user',
      message,
    })
    .select()
    .single()

  if (messageError || !userMessage) {
    console.error('Error creating user message:', messageError)
    return { data: null, error: messageError?.message || 'Failed to create user message' }
  }

  // チャットグループのupdated_atを更新
  await supabase
    .from('chat_groups')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatGroupId)

  return { data: userMessage, error: null }
}

/**
 * AIメッセージを保存
 */
export async function saveAIMessage(chatGroupId: number, message: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // チャットグループの所有者確認
  const { data: chatGroup, error: groupError } = await supabase
    .from('chat_groups')
    .select('id, user_id')
    .eq('id', chatGroupId)
    .eq('user_id', user.id)
    .single()

  if (groupError || !chatGroup) {
    console.error('Error fetching chat group:', groupError)
    return { data: null, error: 'Chat group not found or access denied' }
  }

  // AIメッセージを保存（user_idはNULL）
  const { data: aiMessage, error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      chat_group_id: chatGroupId,
      user_id: null,
      role: 'ai',
      message,
    })
    .select()
    .single()

  if (messageError || !aiMessage) {
    console.error('Error creating AI message:', messageError)
    return { data: null, error: messageError?.message || 'Failed to create AI message' }
  }

  // チャットグループのupdated_atを更新
  await supabase
    .from('chat_groups')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatGroupId)

  return { data: aiMessage, error: null }
}

/**
 * ブックマークを作成
 */
export async function createBookmark(chatMessageId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // チャットメッセージの存在確認
  const { data: chatMessage, error: messageError } = await supabase
    .from('chat_messages')
    .select('id, chat_group_id')
    .eq('id', chatMessageId)
    .single()

  if (messageError || !chatMessage) {
    console.error('Error fetching chat message:', messageError)
    return { data: null, error: 'Chat message not found' }
  }

  // チャットグループの所有者確認
  const { data: chatGroup, error: groupError } = await supabase
    .from('chat_groups')
    .select('id, user_id')
    .eq('id', chatMessage.chat_group_id)
    .eq('user_id', user.id)
    .single()

  if (groupError || !chatGroup) {
    console.error('Error fetching chat group:', groupError)
    return { data: null, error: 'Access denied' }
  }

  // ブックマークを作成
  const { data: bookmark, error: bookmarkError } = await supabase
    .from('bookmarks')
    .insert({
      user_id: user.id,
      chat_message_id: chatMessageId,
    })
    .select()
    .single()

  if (bookmarkError) {
    // 重複エラーの場合
    if (bookmarkError.code === '23505') {
      return { data: null, error: 'Already bookmarked' }
    }
    console.error('Error creating bookmark:', bookmarkError)
    return { data: null, error: bookmarkError.message || 'Failed to create bookmark' }
  }

  return { data: bookmark, error: null }
}

/**
 * ブックマークを削除
 */
export async function deleteBookmark(bookmarkId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', bookmarkId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting bookmark:', error)
    return { error: error.message }
  }

  return { error: null }
}

/**
 * ブックマーク一覧を取得
 */
export async function getBookmarks() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      created_at,
      chat_messages (
        id,
        message,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookmarks:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

