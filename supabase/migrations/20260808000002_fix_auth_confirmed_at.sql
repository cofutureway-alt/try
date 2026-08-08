-- Fix confirmed_at in auth.users from generated column back to regular column
DO $$
BEGIN
  BEGIN
    ALTER TABLE auth.users DROP COLUMN IF EXISTS confirmed_at CASCADE;
    ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone;
    UPDATE auth.users SET confirmed_at = COALESCE(email_confirmed_at, now()) WHERE confirmed_at IS NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping confirmed_at alter: %', SQLERRM;
  END;
END $$;
