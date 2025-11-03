'use client'

import { Volume2, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
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

/**
 * ブックマーク一覧コンポーネント
 * 実際のブックマークデータを表示・削除
 */
export function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [speakingId, setSpeakingId] = useState<number | null>(null)

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
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
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
    <div className="space-y-4">
      {bookmarks.map((bookmark) => {
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
  )
}

