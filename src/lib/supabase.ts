import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
export async function isProUser(userId: string, userEmail?: string): Promise<boolean> {
  // Check if owner first
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  return !!data;
}

// Check if user can generate (free tier: 5/day, pro: unlimited)
export async function canGenerate(userId: string): Promise<{ allowed: boolean; remaining: number; isPro: boolean }> {
  const pro = await isProUser(userId);
  
  if (pro) {
    return { allowed: true, remaining: Infinity, isPro: true };
  }
  
  const used = await getTodayUsage(userId);
  const remaining = Math.max(0, 5 - used);
  
  return {
    allowed: remaining > 0,
    remaining,
    isPro: false,
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

// Save feedback
export async function saveFeedback(userId: string, rating: number, comment: string, generationId?: string) {
  const { error } = await supabase
    .from("feedback")
    .insert({ 
      user_id: userId, 
      rating, 
      comment,
      generation_id: generationId 
    });
  
  if (error) throw error;
}

// Add to waitlist
export async function addToWaitlist(email: string, tool: string, tone: string) {
  const { error } = await supabase
    .from("waitlist")
    .insert({ email, tool, tone });
  
  if (error) {
    // If duplicate email, that's fine
    if (error.code === "23505") return;
    throw error;
  }
}

// Check if user has active team membership
export async function hasTeamAccess(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("team_members")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();
  
  if (error) return false;
  return !!data;
}

// Get user's team
export async function getUserTeam(userId: string) {
  // First check if user is a team member
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();
  
  if (membership) {
    // Get team details
    const { data: team } = await supabase
      .from("teams")
      .select("*")
      .eq("id", membership.team_id)
      .single();
    return team;
  }
  
  // Check if user owns a team
  const { data: ownedTeam } = await supabase
    .from("teams")
    .select("*")
    .eq("owner_id", userId)
    .single();
  
  return ownedTeam;
}

// Alias for compatibility with existing code
export { getUserTeam as getTeamForUser };
export { acceptTeamInvite as acceptInvitation };

// Create a team
export async function createTeam(ownerId: string, name: string, maxSeats: number = 5) {
  const { data, error } = await supabase
    .from("teams")
    .insert({ owner_id: ownerId, name, max_seats: maxSeats })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Invite member to team
export async function inviteTeamMember(teamId: string, email: string, invitedBy: string) {
  const { data, error } = await supabase
    .from("team_invites")
    .insert({ 
      team_id: teamId, 
      email, 
      invited_by: invitedBy,
      token: crypto.randomUUID()
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Accept team invite
export async function acceptTeamInvite(token: string, userId: string) {
  // Get invite
  const { data: invite, error: inviteError } = await supabase
    .from("team_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();
  
  if (inviteError || !invite) {
    throw new Error("Invalid or expired invite");
  }
  
  // Check if invite is expired (7 days)
  const inviteDate = new Date(invite.created_at);
  const now = new Date();
  const daysDiff = (now.getTime() - inviteDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff > 7) {
    await supabase
      .from("team_invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    throw new Error("Invite has expired");
  }
  
  // Add member to team
  const { error: memberError } = await supabase
    .from("team_members")
    .insert({
      team_id: invite.team_id,
      user_id: userId,
      email: invite.email
    });
  
  if (memberError) throw memberError;
  
  // Mark invite as accepted
  await supabase
    .from("team_invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);
  
  return invite.team_id;
}

// Get team members
export async function getTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("status", "active");
  
  if (error) throw error;
  return data || [];
}

// Remove team member
export async function removeTeamMember(teamId: string, memberId: string, requesterId: string) {
  // Verify requester is team owner
  const { data: team } = await supabase
    .from("teams")
    .select("owner_id")
    .eq("id", teamId)
    .single();
  
  if (!team || team.owner_id !== requesterId) {
    throw new Error("Only team owner can remove members");
  }
  
  const { error } = await supabase
    .from("team_members")
    .update({ status: "removed" })
    .eq("id", memberId)
    .eq("team_id", teamId);
  
  if (error) throw error;
}

// Get all templates
export async function getTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get templates by category
export async function getTemplatesByCategory(category: string) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Get popular templates
export async function getPopularTemplates(limit: number = 10) {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .eq("is_popular", true)
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

// Get custom tones for user
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

// Create custom tone with AI analysis
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeTone(sampleText: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a writing style analyzer. Analyze the provided text and create a prompt that captures its unique tone, style, vocabulary level, sentence structure, and overall voice. Return ONLY the prompt - no explanations."
        },
        {
          role: "user",
          content: `Analyze this writing sample and create a tone prompt:\n\n"${sampleText}"\n\nReturn a prompt like: "Rewrite the following in a [description] tone. Use [specific characteristics]."`
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || defaultTonePrompt(sampleText);
  } catch (error) {
    console.error("Error analyzing tone:", error);
    return defaultTonePrompt(sampleText);
  }
}

function defaultTonePrompt(sampleText: string): string {
  return `Rewrite the following in a tone similar to this example: "${sampleText.substring(0, 100)}...". Match the formality, vocabulary level, and sentence structure.`;
}

export async function createCustomTone(userId: string, name: string, description: string, sampleText: string) {
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
