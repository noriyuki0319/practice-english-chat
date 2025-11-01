'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/app/actions/auth'

/**
 * パスワードリセットフォームコンポーネント（画面設計書 S-05 ステップ1 に準拠）
 * Server Actionを使用してサーバー側でメール送信処理を実行します
 */
export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState<
    { error?: string; success?: string } | undefined,
    FormData
  >(resetPassword, undefined)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {/* タイトル */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          パスワードの再設定
        </h2>

        <form action={formAction} className="space-y-5">
          {/* エラーメッセージ */}
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{state.error}</span>
            </div>
          )}

          {/* 成功メッセージ */}
          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{state.success}</span>
            </div>
          )}

          {/* 説明文 */}
          {!state?.success && (
            <p className="text-gray-600 text-sm mb-4">
              登録済みのメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
            </p>
          )}

          {/* メールアドレス入力 */}
          {!state?.success && (
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="example@email.com"
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
              />
            </div>
          )}

          {/* 再設定メール送信ボタン */}
          {!state?.success && (
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? '送信中...' : '再設定メールを送信'}
              </button>
            </div>
          )}
        </form>

        {/* ログイン画面に戻るリンク */}
        <div className="text-center mt-6">
          <a
            href="/login"
            className="text-sm text-green-600 hover:text-green-700 underline"
          >
            ログイン画面に戻る
          </a>
        </div>
      </div>
    </div>
  )
}

