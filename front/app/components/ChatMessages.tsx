'use client'

import { Volume2, Bookmark } from 'lucide-react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  createChatGroupWithMessage, 
  saveAIMessage, 
  createBookmark 
} from '@/app/actions/chat'

/**
 * チャットメッセージコンポーネント
 * 画面設計書 S-01 に準拠
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
  chatGroupId?: number // DBに保存されたチャットグループID
}

export function ChatMessages() {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestionGroups, setSuggestionGroups] = useState<SuggestionGroup[]>([])
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [currentChatGroupId, setCurrentChatGroupId] = useState<number | null>(null)
  const abortControllersRef = useRef<AbortController[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // 1つのストリーミングリクエストを処理
  const fetchSuggestion = async (
    userMessage: string,
    suggestionIndex: number,
    groupId: string,
    suggestionId: string,
    abortController: AbortController,
    chatGroupId: number
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
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('0:')) {
            // "0:" プレフィックスを削除
            let content = line.slice(2)
            
            // JSONエスケープされた文字列をパース
            try {
              // ダブルクォートで囲まれている場合はJSONとしてパース
              if (content.startsWith('"') && content.endsWith('"')) {
                content = JSON.parse(content)
              }
            } catch (e) {
              // パースに失敗した場合はそのまま使用
              console.warn('Failed to parse content:', content)
            }
            
            if (content) {
              fullContent += content
              setSuggestionGroups((prev) =>
                prev.map((group) =>
                  group.id === groupId
                    ? {
                        ...group,
                        suggestions: group.suggestions.map((sug) =>
                          sug.id === suggestionId
                            ? { ...sug, content: sug.content + content }
                            : sug
                        ),
                      }
                    : group
                )
              )
            }
          }
        }
      }

      // ストリーミング完了後、AIメッセージをDBに保存
      const { data: aiMessage, error } = await saveAIMessage(chatGroupId, fullContent)
      
      if (error) {
        console.error('Error saving AI message:', error)
      }

      // ストリーミング完了とchatMessageIdを設定
      setSuggestionGroups((prev) =>
        prev.map((group) =>
          group.id === groupId
            ? {
                ...group,
                suggestions: group.suggestions.map((sug) =>
                  sug.id === suggestionId 
                    ? { 
                        ...sug, 
                        isStreaming: false,
                        chatMessageId: aiMessage?.id 
                      } 
                    : sug
                ),
              }
            : group
        )
      )
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching suggestion:', error)
      }
    }
  }

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // チャットグループとユーザーメッセージをDBに保存
    const { data, error } = await createChatGroupWithMessage(userMessage)
    
    if (error || !data) {
      console.error('Error creating chat group:', error)
      alert('チャットグループの作成に失敗しました')
      setIsLoading(false)
      return
    }

    const { chat_group, user_message } = data
    
    // チャットグループIDを保存
    setCurrentChatGroupId(chat_group.id)

    // すぐにチャットグループのページに遷移
    // ユーザーメッセージをクエリパラメータで渡して即座に表示
    router.push(`/chat/${chat_group.id}?initialMessage=${encodeURIComponent(userMessage)}`)
  }

  // 英語の文を抽出する関数
  const extractEnglishSentences = (text: string): string[] => {
    const lines = text.split('\n')
    const englishSentences: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 以下のパターンにマッチする行を英語文として扱う:
      // - 数字+ピリオド+スペース+英字 (例: "1. Could you...")
      // - ハイフン+スペース+英字 (例: "- Could you...")
      // - アスタリスク+スペース+英字 (例: "* Could you...")
      // - 直接英字で始まる行（大文字） (例: "Could you...")
      if (
        /^\d+[\.\)]\s+[A-Z]/.test(line) ||  // 番号付き
        /^[\-\*]\s+[A-Z]/.test(line) ||      // ハイフンやアスタリスク付き
        (/^[A-Z][a-z]/.test(line) && line.length > 10) // 大文字で始まる長めの文
      ) {
        // 番号やマーカーを除去
        let sentence = line.replace(/^[\d\-\*]+[\.\)]\s*/, '').trim()
        
        // 英語っぽいか確認（アルファベットが50%以上）
        const alphaCount = (sentence.match(/[a-zA-Z]/g) || []).length
        if (alphaCount > sentence.length * 0.3) {
          englishSentences.push(sentence)
        }
      }
    }
    
    // デバッグ用
    console.log('Extracted sentences:', englishSentences)
    
    return englishSentences
  }

  // 音声再生機能
  const handleSpeak = (messageId: string, text: string) => {
    // すでに再生中の場合は停止
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingMessageId(null)
      return
    }

    // 他の音声を停止
    window.speechSynthesis.cancel()

    // ブラウザが音声合成に対応しているか確認
    if (!('speechSynthesis' in window)) {
      alert('お使いのブラウザは音声再生に対応していません。')
      return
    }

    // 英語の文を抽出
    const englishSentences = extractEnglishSentences(text)
    
    if (englishSentences.length === 0) {
      alert('読み上げる英語文が見つかりませんでした。')
      return
    }

    setSpeakingMessageId(messageId)

    // 各英語文を順番に読み上げ
    let currentIndex = 0
    const speakNext = () => {
      if (currentIndex >= englishSentences.length) {
        setSpeakingMessageId(null)
        return
      }

      const utterance = new SpeechSynthesisUtterance(englishSentences[currentIndex])
      utterance.lang = 'en-US' // 英語（アメリカ）
      utterance.rate = 0.9 // 少しゆっくり
      
      utterance.onend = () => {
        currentIndex++
        // 次の文がある場合は少し間を空けて再生
        if (currentIndex < englishSentences.length) {
          setTimeout(speakNext, 500)
        } else {
          setSpeakingMessageId(null)
        }
      }

      utterance.onerror = () => {
        setSpeakingMessageId(null)
        alert('音声再生中にエラーが発生しました。')
      }

      window.speechSynthesis.speak(utterance)
    }

    speakNext()
  }

  // ブックマーク処理
  const handleBookmark = async (suggestion: Message) => {
    if (!suggestion.chatMessageId) {
      alert('メッセージがまだ保存されていません')
      return
    }

    // 既にブックマーク済みの場合
    if (bookmarkedIds.has(suggestion.id)) {
      alert('既にブックマーク済みです')
      return
    }

    const { data, error } = await createBookmark(suggestion.chatMessageId)
    
    if (error) {
      if (error === 'Already bookmarked') {
        alert('既にブックマーク済みです')
      } else {
        alert('ブックマークの作成に失敗しました')
      }
      return
    }

    // ブックマーク成功
    setBookmarkedIds((prev) => new Set(prev).add(suggestion.id))
    alert('ブックマークに追加しました！')
  }

  return (
    <div className="flex flex-col h-screen">
      {/* チャットログエリア */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* システム初期メッセージ */}
          {suggestionGroups.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg shadow-md p-4 max-w-xl">
                <p className="text-gray-800">
                  こんにちは！英語学習のお手伝いをします。
                  <br />
                  どんな場面で使える英語表現を知りたいですか？
                </p>
              </div>
            </div>
          )}

          {/* チャットメッセージ */}
          {suggestionGroups.map((group) => (
            <div key={group.id} className="space-y-4">
              {/* ユーザーメッセージ */}
              <div className="flex justify-end">
                <div className="bg-green-600 text-white rounded-lg shadow-md p-4 max-w-2xl">
                  <p className="whitespace-pre-wrap">{group.userMessage}</p>
                </div>
              </div>

              {/* AI提案（3つ） */}
              <div className="space-y-3">
                {group.suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="flex justify-start">
                    <div className="bg-white rounded-lg shadow-md p-4 max-w-3xl">
                      {suggestion.content ? (
                        <>
                          <div className="whitespace-pre-wrap text-gray-800 mb-3">
                            {suggestion.content}
                          </div>

                          {/* 音声再生とブックマークアイコン */}
                          {!suggestion.isStreaming && (
                            <div className="flex gap-2 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => handleSpeak(suggestion.id, suggestion.content)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                  speakingMessageId === suggestion.id
                                    ? 'bg-green-600 text-white'
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                aria-label={speakingMessageId === suggestion.id ? '停止' : '音声再生'}
                                title={speakingMessageId === suggestion.id ? '停止' : '音声再生'}
                              >
                                <Volume2 className="w-4 h-4" />
                                <span>{speakingMessageId === suggestion.id ? '停止' : '再生'}</span>
                              </button>
                              <button
                                onClick={() => handleBookmark(suggestion)}
                                disabled={bookmarkedIds.has(suggestion.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                  bookmarkedIds.has(suggestion.id)
                                    ? 'bg-green-600 text-white cursor-not-allowed'
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                aria-label="ブックマーク"
                                title={bookmarkedIds.has(suggestion.id) ? 'ブックマーク済み' : 'ブックマーク'}
                              >
                                <Bookmark className={`w-4 h-4 ${bookmarkedIds.has(suggestion.id) ? 'fill-current' : ''}`} />
                                <span>{bookmarkedIds.has(suggestion.id) ? '保存済み' : '保存'}</span>
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        /* ローディング表示 */
                        <div className="flex items-center gap-2 text-gray-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span>考え中...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 入力フッター */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="（例）会議で使えるフレーズ"
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? '送信中...' : '送信'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

