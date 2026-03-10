-- API Keys table for extension authentication
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own API keys" ON api_keys
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid()::text = user_id);
