-- Add generations history table
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  tone TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  generation_id UUID REFERENCES generations(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_generation_id ON feedback(generation_id);

-- Enable RLS
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own generations" ON generations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own generations" ON generations
  FOR DELETE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can read own feedback" ON feedback
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
