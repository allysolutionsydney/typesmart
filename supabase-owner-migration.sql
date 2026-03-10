-- Add owner flag to users table for free unlimited access
-- This allows the app creator to use all features without paying

-- Add is_owner column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT false;

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_is_owner ON users(is_owner) WHERE is_owner = true;

-- Instructions to make yourself an owner:
-- 
-- After signing up with your email, run this SQL:
--
-- UPDATE users 
-- SET is_owner = true 
-- WHERE email = 'your-email@example.com';
--
-- Or add your email to the OWNER_EMAILS array in src/lib/supabase.ts
