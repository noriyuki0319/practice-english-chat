'use client'

import { useChat } from 'ai/react'
import { Volume2, Bookmark } from 'lucide-react'

/**
 * チャットメッセージコンポーネント
 * 画面設計書 S-01 に準拠
 */
export function ChatMessages() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  })

  // デバッグ用
  console.log('input:', input, 'type:', typeof input, 'trimmed:', input?.trim())

  return (
    <div className="flex flex-col h-screen">
      {/* チャットログエリア */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* システム初期メッセージ */}
          {messages.length === 0 && (
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'user' ? (
                /* ユーザーメッセージ（右側） */
                <div className="bg-green-600 text-white rounded-lg shadow-md p-4 max-w-xl">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              ) : (
                /* AIメッセージ（左側） */
                <div className="bg-white rounded-lg shadow-md p-4 max-w-xl w-full">
                  <div className="whitespace-pre-wrap text-gray-800 mb-3">
                    {message.content}
                  </div>

                  {/* 音声再生とブックマークアイコン */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="音声再生"
                      title="音声再生"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>再生</span>
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      aria-label="ブックマーク"
                      title="ブックマーク"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>保存</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ローディング表示 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg shadow-md p-4 max-w-xl">
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span>考え中...</span>
                </div>
              </div>
            </div>
          )}
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

