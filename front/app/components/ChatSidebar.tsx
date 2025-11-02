'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { 
  MessageSquare, 
  Bookmark, 
  Settings, 
  LogOut,
  Plus,
  Trash2,
  X
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { getChatGroups, deleteChatGroup, createChatGroup } from '@/app/actions/chat'

interface ChatGroup {
  id: number
  title: string
  created_at: string
  updated_at: string
}

/**
 * チャット画面専用サイドバーコンポーネント
 * チャットグループの一覧を表示
 */
export function ChatSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newGroupTitle, setNewGroupTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  // チャットグループを取得
  const fetchChatGroups = async () => {
    setIsLoading(true)
    const { data, error } = await getChatGroups()
    if (!error && data) {
      setChatGroups(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchChatGroups()
  }, [])

  // チャットグループを削除
  const handleDelete = async (groupId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('このチャットグループを削除しますか？')) {
      return
    }

    const { error } = await deleteChatGroup(groupId)
    if (!error) {
      setChatGroups((prev) => prev.filter((group) => group.id !== groupId))
    }
  }

  // チャットグループを作成
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newGroupTitle.trim()) {
      alert('グループ名を入力してください')
      return
    }

    setIsCreating(true)
    const { data, error } = await createChatGroup(newGroupTitle.trim())
    
    if (error || !data) {
      alert('チャットグループの作成に失敗しました')
      setIsCreating(false)
      return
    }

    // 新しいグループを一覧に追加
    setChatGroups((prev) => [data, ...prev])
    
    // モーダルを閉じる
    setIsModalOpen(false)
    setNewGroupTitle('')
    setIsCreating(false)

    // 新しいグループのチャット画面に遷移
    router.push(`/chat/${data.id}`)
  }

  // モーダルを開く
  const openModal = () => {
    setIsModalOpen(true)
    setNewGroupTitle('')
  }

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false)
    setNewGroupTitle('')
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-green-600 to-green-800 text-white flex flex-col h-screen fixed left-0 top-0 shadow-lg">
      {/* 上部: ロゴ・タイトル */}
      <div className="p-6 border-b border-green-500">
        <h1 className="text-2xl font-bold text-center">
          AI英語学習
        </h1>
        <p className="text-xs text-center text-green-200 mt-1">
          English Chat
        </p>
      </div>

      {/* 中央: チャットグループ一覧 */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* 新規チャットボタン */}
        <div className="px-3 mb-2">
          <Link
            href="/chat"
            className="w-full flex items-center gap-2 px-4 py-3 bg-green-700 hover:bg-green-600 rounded-lg transition-all duration-200 shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">新しいチャット</span>
          </Link>
        </div>

        {/* グループ作成ボタン */}
        <div className="px-3 mb-4">
          <button
            onClick={openModal}
            className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 rounded-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">グループを作成</span>
          </button>
        </div>

        {/* チャットグループ一覧 */}
        <div className="px-3">
          <h2 className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-2 px-4">
            最近のチャット
          </h2>
          
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-green-200">
              読み込み中...
            </div>
          ) : chatGroups.length === 0 ? (
            <div className="px-4 py-3 text-sm text-green-200">
              チャット履歴がありません
            </div>
          ) : (
            <ul className="space-y-1">
              {chatGroups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/chat/${group.id}`}
                    className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-green-700 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{group.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(group.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-all"
                      aria-label="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* その他のナビゲーション */}
        <div className="mt-6 px-3">
          <h2 className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-2 px-4">
            メニュー
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/bookmarks"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-green-700 ${
                  isActive('/bookmarks')
                    ? 'bg-green-700 shadow-md'
                    : 'bg-transparent'
                }`}
              >
                <Bookmark className="w-5 h-5" />
                <span className="font-medium">ブックマーク</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* 下部: 設定とログアウト */}
      <div className="border-t border-green-500">
        <ul className="space-y-2 px-3 py-4">
          {/* 設定画面へのリンク */}
          <li>
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-green-700 ${
                isActive('/settings')
                  ? 'bg-green-700 shadow-md'
                  : 'bg-transparent'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">設定</span>
            </Link>
          </li>

          {/* ログアウトボタン */}
          <li>
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-600 text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">ログアウト</span>
              </button>
            </form>
          </li>
        </ul>
      </div>

      {/* モーダル: 新規チャットグループ作成 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                新しいチャットグループ
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="閉じる"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* フォーム */}
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label
                  htmlFor="groupTitle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  グループ名
                </label>
                <input
                  id="groupTitle"
                  type="text"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="例: ビジネス英語"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                  disabled={isCreating}
                  autoFocus
                />
              </div>

              {/* ボタン */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCreating}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isCreating || !newGroupTitle.trim()}
                >
                  {isCreating ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  )
}

