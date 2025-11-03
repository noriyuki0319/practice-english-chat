'use client'

import { Volume2, Bookmark } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  saveUserMessage,
  saveAIMessage,
  createBookmark
} from '@/app/actions/chat'

/**
 * チャットメッセージコンポーネント（履歴表示対応版）
 * 既存のチャットグループの履歴を表示し、新しいメッセージを追加できる
 */

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  chatMessageId?: number // DBに保存されたメッセージID
}

interface SuggestionGroup {
  id: string
  userMessage: string
  suggestions: Message[]
}

interface InitialMessage {
  id: number
  role: string
  message: string
  created_at: string
}

interface ChatMessagesWithHistoryProps {
  chatGroupId: number
  chatGroupTitle: string
  initialMessages: InitialMessage[]
}

export function ChatMessagesWithHistory({
  chatGroupId,
  chatGroupTitle,
  initialMessages,
}: ChatMessagesWithHistoryProps) {
  const searchParams = useSearchParams()
  const initialMessage = searchParams.get('initialMessage')
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestionGroups, setSuggestionGroups] = useState<SuggestionGroup[]>([])
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const abortControllersRef = useRef<AbortController[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasProcessedInitialMessage = useRef(false)

  // 初期メッセージを変換してsuggestionGroupsに設定
  useEffect(() => {
    if (initialMessages.length === 0) return

    const groups: SuggestionGroup[] = []
    let currentUserMessage = ''
    let currentSuggestions: Message[] = []

    initialMessages.forEach((msg) => {
      if (msg.role === 'user') {
        // 前のグループを保存
        if (currentUserMessage && currentSuggestions.length > 0) {
          groups.push({
            id: `group-${groups.length}`,
            userMessage: currentUserMessage,
            suggestions: currentSuggestions,
          })
        }
        // 新しいグループを開始
        currentUserMessage = msg.message
        currentSuggestions = []
      } else if (msg.role === 'ai') {
        currentSuggestions.push({
          id: `msg-${msg.id}`,
          role: 'assistant',
          content: msg.message,
          chatMessageId: msg.id,
        })
      }
    })

    // 最後のグループを保存
    if (currentUserMessage && currentSuggestions.length > 0) {
      groups.push({
        id: `group-${groups.length}`,
        userMessage: currentUserMessage,
        suggestions: currentSuggestions,
      })
    }

    setSuggestionGroups(groups)
  }, [initialMessages])

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [suggestionGroups])

  // initialMessageがある場合、自動的にAIストリーミングを開始
  useEffect(() => {
    if (!initialMessage || hasProcessedInitialMessage.current || suggestionGroups.length > 0) {
      return
    }

    hasProcessedInitialMessage.current = true
    
    const startInitialStreaming = async () => {
      setIsLoading(true)

      // 新しいグループIDを生成
      const groupId = `group-${Date.now()}`

      // 3つの提案用のメッセージを初期化
      const suggestions: Message[] = Array.from({ length: 3 }, (_, i) => ({
        id: `${groupId}-suggestion-${i}`,
        role: 'assistant' as const,
        content: '',
        isStreaming: true,
      }))

      // グループを追加
      setSuggestionGroups([
        {
          id: groupId,
          userMessage: initialMessage,
          suggestions,
        },
      ])

      // 3つの並列ストリーミングリクエストを開始
      const controllers = suggestions.map(() => new AbortController())
      abortControllersRef.current = controllers

      try {
        await Promise.all(
          suggestions.map((suggestion, index) =>
            fetchSuggestion(
              initialMessage,
              index,
              groupId,
              suggestion.id,
              controllers[index]
            )
          )
        )
      } catch (error) {
        console.error('Error in initial streaming:', error)
      } finally {
        setIsLoading(false)
      }
    }

    startInitialStreaming()
  }, [initialMessage, suggestionGroups.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // 1つのストリーミングリクエストを処理
  const fetchSuggestion = async (
    userMessage: string,
    suggestionIndex: number,
    groupId: string,
    suggestionId: string,
    abortController: AbortController
  ) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          suggestionIndex,
        }),
        signal: abortController.signal,
      })

      if (!response.ok || !response.body) {
        throw new Error('Failed to fetch suggestion')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        
        // AI SDK v3のストリーミングフォーマットをパース
        // フォーマット: 0:"text" の形式で送られてくる
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          // 0:"text" の形式から "text" 部分を抽出
          const match = line.match(/^\d+:"(.+)"$/)
          if (match) {
            try {
              // エスケープされた文字列をデコード
              const text = JSON.parse(`"${match[1]}"`)
              accumulatedText += text
            } catch (e) {
              // パースエラーの場合はそのまま追加
              accumulatedText += chunk
            }
          } else if (!line.startsWith('0:')) {
            // 通常のテキストの場合はそのまま追加
            accumulatedText += line
          }
        }

        // リアルタイムで表示を更新
        setSuggestionGroups((prev) =>
          prev.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  suggestions: group.suggestions.map((sug) =>
                    sug.id === suggestionId
                      ? { ...sug, content: accumulatedText, isStreaming: true }
                      : sug
                  ),
                }
              : group
          )
        )
      }

      // ストリーミング完了後、isStreamingをfalseに
      setSuggestionGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                suggestions: group.suggestions.map((sug) =>
                  sug.id === suggestionId
                    ? { ...sug, isStreaming: false }
                    : sug
                ),
              }
            : group
        )
      )

      // AIメッセージをDBに保存
      const { data: aiMessage } = await saveAIMessage(chatGroupId, accumulatedText)
      if (aiMessage) {
        // chat_message_idを更新
        setSuggestionGroups((prev) =>
          prev.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  suggestions: group.suggestions.map((sug) =>
                    sug.id === suggestionId
                      ? { ...sug, chatMessageId: aiMessage.id }
                      : sug
                  ),
                }
              : group
          )
        )
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Fetch aborted')
      } else {
        console.error('Error fetching suggestion:', error)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // 既存のAbortControllerをクリーンアップ
    abortControllersRef.current.forEach((controller) => controller.abort())
    abortControllersRef.current = []

    try {
      // ユーザーメッセージをDBに保存
      const { data: savedUserMessage, error: userMessageError } = await saveUserMessage(
        chatGroupId,
        userMessage
      )

      if (userMessageError || !savedUserMessage) {
        console.error('Failed to save user message:', userMessageError)
        alert('メッセージの保存に失敗しました。')
        setIsLoading(false)
        return
      }

      // 新しいグループIDを生成
      const newGroupId = `group-${Date.now()}`

      // 3つの空の提案を作成
      const newSuggestions: Message[] = [
        { id: `${newGroupId}-suggestion-0`, role: 'assistant', content: '', isStreaming: true },
        { id: `${newGroupId}-suggestion-1`, role: 'assistant', content: '', isStreaming: true },
        { id: `${newGroupId}-suggestion-2`, role: 'assistant', content: '', isStreaming: true },
      ]

      // 新しいグループを追加
      setSuggestionGroups((prev) => [
        ...prev,
        {
          id: newGroupId,
          userMessage,
          suggestions: newSuggestions,
        },
      ])

      // 3つの並列ストリーミングリクエストを開始
      const controllers = [0, 1, 2].map(() => new AbortController())
      abortControllersRef.current = controllers

      await Promise.all(
        controllers.map((controller, index) =>
          fetchSuggestion(
            userMessage,
            index,
            newGroupId,
            `${newGroupId}-suggestion-${index}`,
            controller
          )
        )
      )
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      alert('エラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  // 英語文を抽出する関数
  const extractEnglishSentences = (text: string): string[] => {
    // 改行で分割し、英語を含む行を抽出
    const lines = text.split('\n').map((line) => line.trim())
    const englishLines = lines.filter((line) => {
      // 英語の文字（アルファベット）を含み、日本語の文字（ひらがな、カタカナ、漢字）を含まない行
      return /[a-zA-Z]/.test(line) && !/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(line)
    })
    return englishLines
  }

  // 音声再生機能
  const handleSpeak = (messageId: string, content: string) => {
    // 既に再生中の場合は停止
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingMessageId(null)
      return
    }

    // 他の再生を停止
    window.speechSynthesis.cancel()

    // 英語文を抽出
    const englishSentences = extractEnglishSentences(content)

    if (englishSentences.length === 0) {
      alert('読み上げる英語文が見つかりませんでした。')
      return
    }

    // 最初の英語文を読み上げ
    const textToSpeak = englishSentences[0]
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.lang = 'en-US'
    utterance.rate = 0.9 // 少しゆっくり

    utterance.onstart = () => {
      setSpeakingMessageId(messageId)
    }

    utterance.onend = () => {
      setSpeakingMessageId(null)
    }

    utterance.onerror = () => {
      setSpeakingMessageId(null)
      alert('音声再生に失敗しました。')
    }

    window.speechSynthesis.speak(utterance)
  }

  // ブックマーク機能
  const handleBookmark = async (messageId: string, chatMessageId?: number) => {
    if (!chatMessageId) {
      alert('このメッセージはまだ保存されていません。')
      return
    }

    if (bookmarkedIds.has(messageId)) {
      alert('既にブックマーク済みです。')
      return
    }

    const { data, error } = await createBookmark(chatMessageId)

    if (error) {
      if (error === 'Already bookmarked') {
        alert('既にブックマーク済みです。')
      } else {
        alert('ブックマークの作成に失敗しました。')
      }
      return
    }

    if (data) {
      setBookmarkedIds((prev) => new Set(prev).add(messageId))
      alert('ブックマークに追加しました！')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 py-4 px-6">
        <h1 className="text-xl font-bold text-gray-800">{chatGroupTitle}</h1>
      </header>

      {/* チャットログ */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {suggestionGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              このチャットグループにはまだメッセージがありません
            </p>
            <p className="text-gray-400 text-sm">
              下のフォームからメッセージを送信してみましょう
            </p>
          </div>
        )}

        {suggestionGroups.map((group) => (
          <div key={group.id} className="space-y-4">
            {/* ユーザーメッセージ */}
            <div className="flex justify-end">
              <div className="bg-green-600 text-white rounded-lg px-4 py-3 max-w-2xl shadow-md">
                <p className="whitespace-pre-wrap">{group.userMessage}</p>
              </div>
            </div>

            {/* AI提案メッセージ（3つ） */}
            <div className="space-y-3">
              {group.suggestions.map((suggestion) => (
                <div key={suggestion.id} className="flex justify-start">
                  <div className="bg-white rounded-lg px-4 py-3 max-w-3xl shadow-md border border-gray-200">
                    <p className="whitespace-pre-wrap text-gray-800 mb-3">
                      {suggestion.content || (suggestion.isStreaming ? '...' : '')}
                    </p>
                    {!suggestion.isStreaming && suggestion.content && (
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleSpeak(suggestion.id, suggestion.content)}
                          className={`p-2 rounded-lg transition-colors ${
                            speakingMessageId === suggestion.id
                              ? 'bg-green-100 text-green-600'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                          aria-label="音声再生"
                          title="音声再生"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleBookmark(suggestion.id, suggestion.chatMessageId)
                          }
                          className={`p-2 rounded-lg transition-colors ${
                            bookmarkedIds.has(suggestion.id)
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`}
                          aria-label="ブックマーク"
                          title="ブックマーク"
                        >
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力フォーム */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="（例）会議で使えるフレーズ"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? '送信中...' : '送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

