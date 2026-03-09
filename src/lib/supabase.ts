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

// Check if user has pro subscription
export async function isProUser(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  return !!data;
}

// Check if user can generate (free tier: 5/day)
export async function canGenerate(userId: string): Promise<{ allowed: boolean; remaining: number; isPro: boolean }> {
  const isPro = await isProUser(userId);
  
  if (isPro) {
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
