import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createCustomTone, getCustomTones, updateCustomTone, deleteCustomTone } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET - List custom tones
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tones = await getCustomTones(userId);
    return NextResponse.json({ tones });
  } catch (error) {
    console.error("Error fetching custom tones:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom tones" },
      { status: 500 }
    );
  }
}

// POST - Create custom tone
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, sampleText } = await request.json();

    if (!name || !sampleText) {
      return NextResponse.json(
        { error: "Name and sample text are required" },
        { status: 400 }
      );
    }

    // Analyze tone with OpenAI
    const tonePrompt = await analyzeToneWithAI(sampleText);

    const tone = await createCustomTone(userId, name, description || "", sampleText, tonePrompt);

    return NextResponse.json({ tone }, { status: 201 });
  } catch (error) {
    console.error("Error creating custom tone:", error);
    return NextResponse.json(
      { error: "Failed to create custom tone" },
      { status: 500 }
    );
  }
}

// PATCH - Update custom tone
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, name, description, sampleText } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Tone ID is required" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (description) updates.description = description;
    if (sampleText) {
      updates.sample_text = sampleText;
      updates.tone_prompt = await analyzeToneWithAI(sampleText);
    }

    const tone = await updateCustomTone(userId, id, updates);

    return NextResponse.json({ tone });
  } catch (error) {
    console.error("Error updating custom tone:", error);
    return NextResponse.json(
      { error: "Failed to update custom tone" },
      { status: 500 }
    );
  }
}

// DELETE - Delete custom tone
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Tone ID is required" },
        { status: 400 }
      );
    }

    await deleteCustomTone(userId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom tone:", error);
    return NextResponse.json(
      { error: "Failed to delete custom tone" },
      { status: 500 }
    );
  }
}

// Helper function to analyze tone with OpenAI
async function analyzeToneWithAI(sampleText: string): Promise<string> {
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
          content: `Analyze this writing sample and create a tone prompt that captures its style:\n\n"${sampleText}"\n\nReturn a prompt like: "Rewrite the following in a [description] tone. Use [specific characteristics]. Avoid [what to avoid]."`
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

// Update function signature to include tonePrompt
async function createCustomTone(userId: string, name: string, description: string, sampleText: string, tonePrompt: string) {
  const { supabase } = await import("@/lib/supabase");
  
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

async function updateCustomTone(userId: string, toneId: string, updates: any) {
  const { supabase } = await import("@/lib/supabase");
  
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

async function deleteCustomTone(userId: string, toneId: string) {
  const { supabase } = await import("@/lib/supabase");
  
  const { error } = await supabase
    .from("custom_tones")
    .update({ is_active: false })
    .eq("id", toneId)
    .eq("user_id", userId);
  
  if (error) throw error;
}
