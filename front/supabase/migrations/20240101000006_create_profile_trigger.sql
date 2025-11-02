-- ============================================================================
-- Migration: Auto-create profile on user signup
-- Description: Automatically creates a profile entry when a new user signs up
-- ============================================================================

-- 既存のトリガーと関数を削除（再適用の場合に備えて）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to create a profile for new users
-- SECURITY DEFINER: RLSポリシーをバイパスして実行
-- SET search_path: セキュリティのためにスキーマパスを固定
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    now(),
    now()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- エラーが発生してもユーザー登録自体は成功させる
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 関数の所有者をpostgresに設定（RLSをバイパスするために必要）
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Trigger: Auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a new user signs up via Supabase Auth. Runs with SECURITY DEFINER to bypass RLS.';

-- ============================================================================
-- Rollback (commented out - uncomment if needed)
-- ============================================================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();

