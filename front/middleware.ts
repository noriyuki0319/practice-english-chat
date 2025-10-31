import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

/**
 * Next.js Middleware
 * すべてのリクエストでSupabaseセッションを更新します
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico (faviconファイル)
     * - public配下のファイル (public/配下の画像など)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

