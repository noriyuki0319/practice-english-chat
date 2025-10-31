'use client'

import { useEffect } from 'react'

/**
 * ブラウザ拡張機能によるHydrationエラーを抑制するコンポーネント
 * 開発環境でのみ使用
 */
export function ErrorSuppression() {
  useEffect(() => {
    // 開発環境でのみ実行
    if (process.env.NODE_ENV === 'development') {
      // console.error を上書き
      const originalError = console.error
      console.error = (...args) => {
        // Keeper等のブラウザ拡張機能によるHydrationエラーを無視
        const errorString = args[0]?.toString() || ''
        if (
          errorString.includes('Hydration') ||
          errorString.includes('keeper-lock') ||
          errorString.includes('data-keeper') ||
          errorString.includes('data-1p-ignore') ||
          errorString.includes('data-lpignore')
        ) {
          return
        }
        originalError.apply(console, args)
      }

      // console.warn も上書き
      const originalWarn = console.warn
      console.warn = (...args) => {
        const warnString = args[0]?.toString() || ''
        if (
          warnString.includes('Hydration') ||
          warnString.includes('keeper-lock')
        ) {
          return
        }
        originalWarn.apply(console, args)
      }

      // グローバルエラーハンドラーを追加
      const errorHandler = (event: ErrorEvent) => {
        if (
          event.message.includes('Hydration') ||
          event.message.includes('keeper-lock')
        ) {
          event.preventDefault()
          event.stopPropagation()
          return false
        }
      }

      window.addEventListener('error', errorHandler)

      return () => {
        console.error = originalError
        console.warn = originalWarn
        window.removeEventListener('error', errorHandler)
      }
    }
  }, [])

  return null
}

