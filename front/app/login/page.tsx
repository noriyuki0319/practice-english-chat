import { LoginForm } from '@/app/components/LoginForm'

/**
 * ログインページ（画面設計書 S-04 に準拠）
 * 中央にフォームを配置し、シンプルなレイアウトで表示します
 */
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <LoginForm />
    </main>
  )
}

