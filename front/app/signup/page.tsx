import { SignUpForm } from '@/app/components/SignUpForm'

/**
 * 新規登録ページ（画面設計書 S-03 に準拠）
 * 中央にフォームを配置し、シンプルなレイアウトで表示します
 */
export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <SignUpForm />
    </main>
  )
}

