'use client'

import { useActionState } from 'react'
import { signIn } from '@/app/actions/auth'

/**
 * ログインフォームコンポーネント（画面設計書 S-04 に準拠）
 * Server Actionを使用してサーバー側で認証処理を実行します
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    { error?: string } | undefined,
    FormData
  >(signIn, undefined)

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <form action={formAction} className="space-y-5">
          {/* エラーメッセージ */}
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{state.error}</span>
            </div>
          )}

          {/* メールアドレス入力 */}
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
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="example@email.com"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          {/* パスワード入力 */}
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="パスワードを入力"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          {/* ログインボタン */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>
        </form>

        {/* リンク */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <a
              href="/reset-password"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              パスワードを忘れましたか？ 再設定
            </a>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              アカウントをお持ちでないですか？{' '}
              <a
                href="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                新規登録
              </a>
            </p>
          </div>
        </div>

        {/* ソーシャルログイン（オプション） */}
        {/* <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded py-2 px-4 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Googleでログイン
            </button>
          </div>
        </div> */}
      </div>
    </div>
  )
}

