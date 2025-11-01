import { ResetPasswordForm } from '@/app/components/ResetPasswordForm'

/**
 * パスワードリセットページ（画面設計書 S-05 ステップ1 に準拠）
 * 中央にフォームを配置し、シンプルなレイアウトで表示します
 */
export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <ResetPasswordForm />
    </main>
  )
}

