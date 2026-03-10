import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Owner configuration - Add your email(s) here for free unlimited access
const OWNER_EMAILS = [
  // Add your email here, e.g., "youremail@gmail.com"
  "allysolutionsydney@gmail.com", // Replace with your actual email
];

// Check if user is owner (bypasses all payment checks)
async function isOwner(userId: string): Promise<boolean> {
  // Check if user has owner flag in database
  const { data: user } = await supabase
    .from("users")
    .select("email, is_owner")
    .eq("id", userId)
    .single();
  
  if (user?.is_owner) return true;
  if (user?.email && OWNER_EMAILS.includes(user.email)) return true;
  
  return false;
}

// Create a mock client if env vars are missing (for build time)
const createMockClient = () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
        single: () => Promise.resolve({ data: null, error: null }),
      }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    insert: () => Promise.resolve({ error: null }),
    update: () => ({ eq: () => ({ eq: () => Promise.resolve({ error: null }) }) }),
  }),
});

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : (createMockClient() as any);

// Track a generation for a user
export async function trackGeneration(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  
  // Check if record exists for today
  const { data: existing } = await supabase
    .from("usage")
    .select("count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  if (existing) {
    // Increment count
    const { error } = await supabase
      .from("usage")
      .update({ count: existing.count + 1 })
      .eq("user_id", userId)
      .eq("date", today);
    
    if (error) throw error;
    return existing.count + 1;
  } else {
    // Create new record
    const { error } = await supabase
      .from("usage")
      .insert({ user_id: userId, date: today, count: 1 });
    
    if (error) throw error;
    return 1;
  }
}

// Get today's usage count for a user
export async function getTodayUsage(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  
  const { data } = await supabase
    .from("usage")
    .select("count")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  return data?.count || 0;
}

// Check if user has pro subscription (or is owner)
export async function isProUser(userId: string): Promise<boolean> {
  // Check if owner first
  if (await isOwner(userId)) return true;
  
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  return !!data;
}

// Check if user can generate (free tier: 5/day, owners: unlimited)
export async function canGenerate(userId: string): Promise<{ allowed: boolean; remaining: number; isPro: boolean; isOwner: boolean }> {
  // Check if owner first
  if (await isOwner(userId)) {
    return { allowed: true, remaining: Infinity, isPro: true, isOwner: true };
  }
  
  const isPro = await isProUser(userId);
  
  if (isPro) {
    return { allowed: true, remaining: Infinity, isPro: true, isOwner: false };
  }
  
  const used = await getTodayUsage(userId);
  const remaining = Math.max(0, 5 - used);
  
  return {
    allowed: remaining > 0,
    remaining,
    isPro: false,
    isOwner: false,
  };
}

// Save generation to history
export async function saveGeneration(userId: string, tool: string, tone: string, input: string, output: string) {
  const { data, error } = await supabase
    .from("generations")
    .insert({ user_id: userId, tool, tone, input, output })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get user's generation history
export async function getGenerationHistory(userId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// Delete a generation from history
export async function deleteGeneration(userId: string, generationId: string) {
  const { error } = await supabase
    .from("generations")
    .delete()
    .eq("id", generationId)
    .eq("user_id", userId);
  
  if (error) throw error;
}

// Save feedback for a generation
export async function saveFeedback(userId: string, generationId: string, rating: number, comment?: string) {
  const { error } = await supabase
    .from("feedback")
    .insert({ user_id: userId, generation_id: generationId, rating, comment });
  
  if (error) throw error;
}

// CUSTOM TONES

// Create a custom tone
export async function createCustomTone(userId: string, name: string, description: string, sampleText: string) {
  // Generate tone prompt from sample text using OpenAI
  const tonePrompt = await analyzeTone(sampleText);
  
  const { data, error } = await supabase
    .from("custom_tones")
    .insert({ 
      user_id: userId, 
      name, 
      description, 
      sample_text: sampleText,
      tone_prompt: tonePrompt 
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get all custom tones for a user
export async function getCustomTones(userId: string) {
  const { data, error } = await supabase
    .from("custom_tones")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Update custom tone
export async function updateCustomTone(userId: string, toneId: string, updates: any) {
  // If sample_text updated, regenerate tone_prompt
  if (updates.sample_text) {
    updates.tone_prompt = await analyzeTone(updates.sample_text);
  }
  
  const { data, error } = await supabase
    .from("custom_tones")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", toneId)
    .eq("user_id", userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Delete custom tone (soft delete)
export async function deleteCustomTone(userId: string, toneId: string) {
  const { error } = await supabase
    .from("custom_tones")
    .update({ is_active: false })
    .eq("id", toneId)
    .eq("user_id", userId);
  
  if (error) throw error;
}

// Helper function to analyze tone
async function analyzeTone(sampleText: string): Promise<string> {
  // This would call OpenAI to analyze the tone
  // For now, return a default prompt
  return `Rewrite the following in a tone similar to this example: "${sampleText.substring(0, 200)}...". Match the formality, vocabulary level, sentence structure, and overall voice.`;
}

// TEAM MANAGEMENT

// Create a team
export async function createTeam(ownerId: string, name: string, maxSeats: number = 5) {
  const { data, error } = await supabase
    .from("teams")
    .insert({ 
      owner_id: ownerId, 
      name, 
      max_seats: maxSeats 
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Get team for user
export async function getTeamForUser(userId: string) {
  // Check if user owns a team
  const { data: ownedTeam } = await supabase
    .from("teams")
    .select("*")
    .eq("owner_id", userId)
    .single();
  
  if (ownedTeam) return { ...ownedTeam, role: 'owner' };
  
  // Check if user is a member of a team
  const { data: membership } = await supabase
    .from("team_members")
    .select("*, team:teams(*)")
    .eq("user_id", userId)
    .eq("role", 'member')
    .single();
  
  if (membership) {
    return { ...membership.team, role: membership.role };
  }
  
  return null;
}

// Get team members
export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId);
  
  if (error) throw error;
  return data || [];
}

// Invite team member
export async function inviteTeamMember(teamId: string, email: string, invitedBy: string) {
  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
  
  const { data, error } = await supabase
    .from("team_invitations")
    .insert({ 
      team_id: teamId, 
      email, 
      invited_by: invitedBy,
      token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  return { ...data, inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/team/invite?token=${token}` };
}

// Accept team invitation
export async function acceptInvitation(token: string, userId: string) {
  // Get invitation
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", 'pending')
    .gt("expires_at", new Date().toISOString())
    .single();
  
  if (!invitation) {
    throw new Error("Invalid or expired invitation");
  }
  
  // Add user to team
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: invitation.team_id,
      user_id: userId,
      invited_by: invitation.invited_by,
      joined_at: new Date().toISOString()
    });
  
  if (memberError) throw memberError;
  
  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from("team_invitations")
    .update({ status: 'accepted' })
    .eq("id", invitation.id);
  
  if (updateError) throw updateError;
  
  return { success: true };
}

// Remove team member
export async function removeTeamMember(teamId: string, userId: string, removedBy: string) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);
  
  if (error) throw error;
}

// Check if user has team access (for usage limits)
export async function hasTeamAccess(userId: string): Promise<boolean> {
  const team = await getTeamForUser(userId);
  return !!team && team.status === 'active';
}

// Helper function
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
