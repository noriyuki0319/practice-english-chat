import { UpdatePasswordForm } from '@/app/components/UpdatePasswordForm'

/**
 * パスワード更新ページ（画面設計書 S-05 ステップ2 に準拠）
 * メール内のリンクからアクセスされる
 * 中央にフォームを配置し、シンプルなレイアウトで表示します
 */
export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <UpdatePasswordForm />
    </main>
  )
}

