import { Sidebar } from './Sidebar'

/**
 * メインレイアウトコンポーネント
 * サイドバーとメインコンテンツエリアを含むレイアウト
 */
interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツエリア（サイドバーの右側） */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}

