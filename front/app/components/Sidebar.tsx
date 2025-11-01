'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { 
  MessageSquare, 
  Bookmark, 
  Settings, 
  LogOut 
} from 'lucide-react'

/**
 * サイドバーコンポーネント（画面設計書 C-01 に準拠）
 * ログイン後の主要画面に常に表示されるナビゲーションメニュー
 */
export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
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

      {/* 中央: ナビゲーションリンク */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {/* チャット画面へのリンク */}
          <li>
            <Link
              href="/chat"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-green-700 ${
                isActive('/chat')
                  ? 'bg-green-700 shadow-md'
                  : 'bg-transparent'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">チャット</span>
            </Link>
          </li>

          {/* ブックマーク一覧画面へのリンク */}
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
      </nav>

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
    </aside>
  )
}

