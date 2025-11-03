'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * 新規登録用のServer Action
 * サーバー側で実行されるため、環境変数が流出しません
 */
export async function signUp(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  // 環境変数のチェック（サーバー専用）
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set')
    return {
      error: 'サーバーの設定エラーです。環境変数を確認してください。',
    }
  }

  const supabase = await createClient()

  // フォームデータから値を取得
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('password-confirm') as string

  console.log('Sign up attempt for email:', email)

  // バリデーション
  if (!email || !password || !passwordConfirm) {
    return {
      error: 'すべてのフィールドを入力してください',
    }
  }

  if (password.length < 6) {
    return {
      error: 'パスワードは6文字以上で入力してください',
    }
  }

  // パスワード確認
  if (password !== passwordConfirm) {
    return {
      error: 'パスワードが一致しません',
    }
  }

  // メールアドレスの簡易バリデーション
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      error: '有効なメールアドレスを入力してください',
    }
  }

  try {
    // Supabaseで新規登録
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      return {
        error: `登録エラー: ${error.message}`,
      }
    }

    if (!data.user) {
      console.error('No user data returned from signUp')
      return {
        error: 'ユーザー登録に失敗しました',
      }
    }

    console.log('User created successfully:', data.user.id)

    // プロフィールはデータベーストリガーで自動作成されます
    console.log('Profile will be created automatically by database trigger')

    // メール確認が必要な場合のメッセージ
    if (data.user && !data.user.email_confirmed_at) {
      return {
        error: '登録が完了しました。メールアドレスに送信された確認リンクをクリックしてください。',
      }
    }
  } catch (error) {
    console.error('Unexpected error during sign up:', error)
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
    }
  }

  // キャッシュを再検証
  revalidatePath('/', 'layout')
  
  // ホームページにリダイレクト（try-catchの外で実行）
  redirect('/')
}

/**
 * ログイン用のServer Action
 * サーバー側で実行されるため、環境変数が流出しません
 */
export async function signIn(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  // 環境変数のチェック（サーバー専用）
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set')
    return {
      error: 'サーバーの設定エラーです。環境変数を確認してください。',
    }
  }

  const supabase = await createClient()

  // フォームデータから値を取得
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('Sign in attempt for email:', email)

  // バリデーション
  if (!email || !password) {
    return {
      error: 'メールアドレスとパスワードを入力してください',
    }
  }

  // メールアドレスの簡易バリデーション
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      error: '有効なメールアドレスを入力してください',
    }
  }

  try {
    // Supabaseでログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Sign in error:', error)
      return {
        error: 'メールアドレスまたはパスワードが正しくありません',
      }
    }

    if (!data.user) {
      console.error('No user data returned from signIn')
      return {
        error: 'ログインに失敗しました',
      }
    }

    console.log('User signed in successfully:', data.user.id)
  } catch (error) {
    console.error('Unexpected error during sign in:', error)
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
    }
  }

  // キャッシュを再検証
  revalidatePath('/', 'layout')
  
  // ホームページにリダイレクト（try-catchの外で実行）
  redirect('/')
}

/**
 * ログアウト用のServer Action
 */
export async function signOut() {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
    // エラーがあってもリダイレクトを実行
  }

  console.log('User signed out successfully')

  // キャッシュを再検証
  revalidatePath('/', 'layout')
  
  // ログインページにリダイレクト
  redirect('/login')
}

/**
 * パスワードリセットメール送信用のServer Action
 * サーバー側で実行されるため、環境変数が流出しません
 */
export async function resetPassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  // 環境変数のチェック（サーバー専用）
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set')
    return {
      error: 'サーバーの設定エラーです。環境変数を確認してください。',
    }
  }

  const supabase = await createClient()

  // フォームデータから値を取得
  const email = formData.get('email') as string

  console.log('Password reset request for email:', email)

  // バリデーション
  if (!email) {
    return {
      error: 'メールアドレスを入力してください',
    }
  }

  // メールアドレスの簡易バリデーション
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      error: '有効なメールアドレスを入力してください',
    }
  }

  try {
    // Supabaseでパスワードリセットメールを送信
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL || 'http://localhost:3000'}/auth/callback?next=/reset-password/update`,
    })

    if (error) {
      console.error('Password reset error:', error)
      return {
        error: 'パスワードリセットメールの送信に失敗しました',
      }
    }

    console.log('Password reset email sent successfully to:', email)

    return {
      success: 'パスワードリセットメールを送信しました。メールをご確認ください。',
    }
  } catch (error) {
    console.error('Unexpected error during password reset:', error)
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
    }
  }
}

/**
 * パスワード更新用のServer Action
 * メールリンクからアクセスした際のセッションを使用してパスワードを更新
 * サーバー側で実行されるため、環境変数が流出しません
 */
export async function updatePassword(
  prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  // 環境変数のチェック（サーバー専用）
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not set')
    return {
      error: 'サーバーの設定エラーです。環境変数を確認してください。',
    }
  }

  const supabase = await createClient()

  // フォームデータから値を取得
  const password = formData.get('password') as string
  const passwordConfirm = formData.get('password-confirm') as string

  console.log('Password update request')

  // バリデーション
  if (!password || !passwordConfirm) {
    return {
      error: 'すべてのフィールドを入力してください',
    }
  }

  if (password.length < 6) {
    return {
      error: 'パスワードは6文字以上で入力してください',
    }
  }

  if (password !== passwordConfirm) {
    return {
      error: 'パスワードが一致しません',
    }
  }

  try {
    // 現在のユーザーセッションを確認
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User session error:', userError)
      return {
        error: 'セッションが無効です。パスワードリセットメールから再度アクセスしてください。',
      }
    }

    console.log('Updating password for user:', user.id)

    // パスワードを更新
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      console.error('Password update error:', error)
      return {
        error: 'パスワードの更新に失敗しました',
      }
    }

    console.log('Password updated successfully for user:', user.id)
  } catch (error) {
    console.error('Unexpected error during password update:', error)
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
    }
  }

  // キャッシュを再検証
  revalidatePath('/', 'layout')

  // ログインページにリダイレクト
  redirect('/login')
}

