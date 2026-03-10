import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get or create API key
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get existing API key
    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json({ 
      apiKey: apiKey ? {
        id: apiKey.id,
        key: maskApiKey(apiKey.key),
        created_at: apiKey.created_at,
        last_used: apiKey.last_used
      } : null
    });
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key" },
      { status: 500 }
    );
  }
}

// POST - Create new API key
export async function POST() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deactivate existing keys
    await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("user_id", userId);

    // Generate new key
    const newKey = `ts_live_${crypto.randomBytes(32).toString("hex")}`;

    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .insert({
        user_id: userId,
        key: newKey,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      apiKey: {
        id: apiKey.id,
        key: newKey, // Only show full key once on creation
        created_at: apiKey.created_at
      }
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke API key
export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("api_keys")
      .update({ is_active: false })
      .eq("user_id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}

function maskApiKey(key: string): string {
  if (key.length <= 12) return "••••••••••••";
  return key.slice(0, 8) + "••••••••••••••••" + key.slice(-4);
}
