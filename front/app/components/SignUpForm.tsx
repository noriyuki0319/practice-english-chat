'use client'

import { useActionState } from 'react'
import { signUp } from '@/app/actions/auth'

/**
 * 新規登録フォームコンポーネント（画面設計書 S-03 に準拠）
 * Server Actionを使用してサーバー側で認証処理を実行します
 */
export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<
    { error?: string } | undefined,
    FormData
  >(signUp, undefined)

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
              autoComplete="new-password"
              required
              minLength={6}
              disabled={isPending}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="6文字以上で入力"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          {/* パスワード（確認用）入力 */}
          <div>
            <label
              htmlFor="password-confirm"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              パスワード（確認用）
            </label>
            <input
              id="password-confirm"
              name="password-confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={isPending}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="パスワードを再入力"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
            />
          </div>

          {/* 登録するボタン */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>

        {/* ログインページへのリンク */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            すでにアカウントをお持ちですか？{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              ログイン
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

