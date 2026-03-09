-- Custom Tones table
CREATE TABLE IF NOT EXISTS custom_tones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sample_text TEXT NOT NULL,
  tone_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team/Organization table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  max_seats INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  invited_by TEXT NOT NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_tones_user_id ON custom_tones(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- Enable RLS
ALTER TABLE custom_tones ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own custom tones" ON custom_tones;
DROP POLICY IF EXISTS "Team owners can manage team" ON teams;
DROP POLICY IF EXISTS "Team members can view team" ON team_members;
DROP POLICY IF EXISTS "Users can view own invitations" ON team_invitations;

-- Custom tones policies
CREATE POLICY "Users can manage own custom tones"
ON custom_tones FOR ALL
USING (auth.uid()::text = user_id);

-- Teams policies
CREATE POLICY "Team owners can manage team"
ON teams FOR ALL
USING (auth.uid()::text = owner_id);

CREATE POLICY "Team members can view team"
ON teams FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_members.team_id = teams.id 
    AND team_members.user_id = auth.uid()::text
  )
);

-- Team members policies
CREATE POLICY "Users can view team memberships"
ON team_members FOR SELECT
USING (
  user_id = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.owner_id = auth.uid()::text
  )
);

CREATE POLICY "Team owners can manage members"
ON team_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.owner_id = auth.uid()::text
  )
);

-- Team invitations policies
CREATE POLICY "Users can view own invitations"
ON team_invitations FOR SELECT
USING (
  email = auth.email() OR
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_invitations.team_id 
    AND teams.owner_id = auth.uid()::text
  )
);

CREATE POLICY "Team owners can manage invitations"
ON team_invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_invitations.team_id 
    AND teams.owner_id = auth.uid()::text
  )
);
