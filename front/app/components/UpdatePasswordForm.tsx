'use client'

import { useActionState } from 'react'
import { updatePassword } from '@/app/actions/auth'

/**
 * パスワード更新フォームコンポーネント（画面設計書 S-05 ステップ2 に準拠）
 * Server Actionを使用してサーバー側でパスワード更新処理を実行します
 */
export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState<
    { error?: string; success?: string } | undefined,
    FormData
  >(updatePassword, undefined)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {/* タイトル */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          新しいパスワードの設定
        </h2>

        <form action={formAction} className="space-y-5">
          {/* エラーメッセージ */}
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{state.error}</span>
            </div>
          )}

          {/* 説明文 */}
          <p className="text-gray-600 text-sm mb-4">
            新しいパスワードを入力してください。パスワードは6文字以上である必要があります。
          </p>

          {/* 新しいパスワード入力 */}
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              新しいパスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={isPending}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="6文字以上で入力"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          {/* 新しいパスワード（確認用）入力 */}
          <div>
            <label
              htmlFor="password-confirm"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              新しいパスワード（確認用）
            </label>
            <input
              id="password-confirm"
              name="password-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={isPending}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="パスワードを再入力"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          {/* パスワード更新ボタン */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? '更新中...' : 'パスワードを更新'}
            </button>
          </div>
        </form>

        {/* ヘルプテキスト */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            パスワード更新後、新しいパスワードでログインできます
          </p>
        </div>
      </div>
    </div>
  )
}

