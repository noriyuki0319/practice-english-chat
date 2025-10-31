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
  // 環境変数のチェック
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
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

    // 登録成功後、profilesテーブルにユーザー情報を作成
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        name: email.split('@')[0], // メールアドレスの@より前を初期名前として使用
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // プロフィールテーブルが存在しない可能性があるため、エラーメッセージを返す
      return {
        error: `プロフィール作成エラー: ${profileError.message}。データベースのテーブルが作成されているか確認してください。`,
      }
    }

    console.log('Profile created successfully')

    // メール確認が必要な場合のメッセージ
    if (data.user && !data.user.email_confirmed_at) {
      return {
        error: '登録が完了しました。メールアドレスに送信された確認リンクをクリックしてください。',
      }
    }

    // キャッシュを再検証
    revalidatePath('/', 'layout')
    
    // ホームページにリダイレクト
    redirect('/')
  } catch (error) {
    console.error('Unexpected error during sign up:', error)
    return {
      error: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`,
    }
  }
}

