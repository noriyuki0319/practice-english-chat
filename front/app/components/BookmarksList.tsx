'use client'

import { Volume2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBookmarks, deleteBookmark } from '@/app/actions/chat'

interface Bookmark {
  id: number
  created_at: string
  chat_messages: {
    id: number
    message: string
    created_at: string
  } | null
}

const ITEMS_PER_PAGE = 5

/**
 * ブックマーク一覧コンポーネント
 * 実際のブックマークデータを表示・削除
 * ページネーション機能付き（5件ずつ表示）
 * ページ番号はURLクエリパラメータで管理
 */
export function BookmarksList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [speakingId, setSpeakingId] = useState<number | null>(null)

  // URLクエリパラメータからページ番号を取得（デフォルトは1）
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  // ブックマーク一覧を取得
  useEffect(() => {
    const fetchBookmarks = async () => {
      setIsLoading(true)
      const { data, error } = await getBookmarks()
      
      if (error) {
        console.error('Failed to fetch bookmarks:', error)
      } else {
        setBookmarks(data || [])
      }
      setIsLoading(false)
    }

    fetchBookmarks()
  }, [])

  // ページネーション計算
  const totalPages = Math.ceil(bookmarks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentBookmarks = bookmarks.slice(startIndex, endIndex)

  // ページ変更
  const goToPage = (page: number) => {
    // URLクエリパラメータを更新
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`?${params.toString()}`)
    
    // ページ変更時にスクロールをトップに戻す
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 英語文を抽出する関数
  const extractEnglishSentence = (message: string): string => {
    const lines = message.split('\n').map(line => line.trim())
    const englishLine = lines.find(line => 
      /[a-zA-Z]/.test(line) && !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(line)
    )
    return englishLine || message.split('\n')[0] || message
  }

  // 日本語訳を抽出する関数
  const extractJapaneseTranslation = (message: string): string => {
    const lines = message.split('\n').map(line => line.trim())
    const japaneseLine = lines.find(line => 
      /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(line)
    )
    return japaneseLine || ''
  }

  // 音声再生機能
  const handleSpeak = (bookmarkId: number, message: string) => {
    // 既に再生中の場合は停止
    if (speakingId === bookmarkId) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    // 他の再生を停止
    window.speechSynthesis.cancel()

    // 英語文を抽出
    const englishSentence = extractEnglishSentence(message)

    if (!englishSentence) {
      alert('読み上げる英語文が見つかりませんでした。')
      return
    }

    const utterance = new SpeechSynthesisUtterance(englishSentence)
    utterance.lang = 'en-US'
    utterance.rate = 0.9

    utterance.onstart = () => {
      setSpeakingId(bookmarkId)
    }

    utterance.onend = () => {
      setSpeakingId(null)
    }

    utterance.onerror = () => {
      setSpeakingId(null)
      alert('音声再生に失敗しました。')
    }

    window.speechSynthesis.speak(utterance)
  }

  // ブックマーク削除
  const handleDelete = async (bookmarkId: number) => {
    if (!confirm('このブックマークを削除してもよろしいですか？')) {
      return
    }

    setDeletingId(bookmarkId)
    const { error } = await deleteBookmark(bookmarkId)

    if (error) {
      console.error('Failed to delete bookmark:', error)
      alert('ブックマークの削除に失敗しました。')
    } else {
      // 削除成功したら一覧から削除
      const newBookmarks = bookmarks.filter(b => b.id !== bookmarkId)
      setBookmarks(newBookmarks)
      
      // 現在のページが空になった場合、前のページに戻る
      const newTotalPages = Math.ceil(newBookmarks.length / ITEMS_PER_PAGE)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        goToPage(newTotalPages)
      }
    }
    setDeletingId(null)
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">読み込み中...</p>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
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
    )
  }

  return (
    <div>
      {/* ブックマークリスト */}
      <div className="space-y-4 mb-8">
        {currentBookmarks.map((bookmark) => {
          const message = bookmark.chat_messages?.message || ''
          const englishSentence = extractEnglishSentence(message)
          const japaneseTranslation = extractJapaneseTranslation(message)

          return (
            <div
              key={bookmark.id}
              className="bg-white rounded-lg shadow-md p-5 flex items-start justify-between hover:shadow-lg transition-shadow"
            >
              <div className="flex-1">
                <p className="text-gray-900 font-medium text-lg mb-2">
                  {englishSentence}
                </p>
                {japaneseTranslation && (
                  <p className="text-gray-600 mb-3">
                    {japaneseTranslation}
                  </p>
                )}
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
                  onClick={() => handleSpeak(bookmark.id, message)}
                  disabled={deletingId === bookmark.id}
                  className={`p-2 rounded-lg transition-colors ${
                    speakingId === bookmark.id
                      ? 'bg-green-100 text-green-600'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                  aria-label={speakingId === bookmark.id ? '停止' : '音声再生'}
                  title={speakingId === bookmark.id ? '停止' : '音声再生'}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  disabled={deletingId === bookmark.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="削除"
                  title="削除"
                >
                  {deletingId === bookmark.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {/* 前へボタン */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="前のページ"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>前へ</span>
          </button>

          {/* ページ番号 */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-green-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-label={`ページ ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          {/* 次へボタン */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="次のページ"
          >
            <span>次へ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ページ情報 */}
      {bookmarks.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          全 {bookmarks.length} 件中 {startIndex + 1} - {Math.min(endIndex, bookmarks.length)} 件を表示
        </div>
      )}
    </div>
  )
}

