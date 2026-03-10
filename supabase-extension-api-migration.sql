-- Extension API Keys Table
-- Store API keys for browser extension authentication

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id) WHERE is_active = true;

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own API keys
CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can create their own API keys
CREATE POLICY "Users can create own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own API keys
CREATE POLICY "Users can update own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Function to clean up old revoked keys (keep for 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_api_keys()
RETURNS void AS $$
BEGIN
  DELETE FROM api_keys
  WHERE is_active = false
    AND updated_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;
