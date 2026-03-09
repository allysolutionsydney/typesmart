import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { canGenerate, trackGeneration, saveGeneration, hasTeamAccess } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tool, input, tone, customToneId } = await request.json();

    if (!input || !tool || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user has team access (unlimited generations)
    const hasTeam = await hasTeamAccess(userId);

    // Check usage limits (skip if team member)
    const { allowed, remaining, isPro } = hasTeam 
      ? { allowed: true, remaining: Infinity, isPro: true }
      : await canGenerate(userId);
    
    if (!allowed) {
      return NextResponse.json(
        { 
          error: "Free limit reached", 
          message: "You've used all 5 free generations today. Upgrade to Pro for unlimited access.",
          remaining: 0,
          isPro
        },
        { status: 429 }
      );
    }

    let prompt: string;

    // If custom tone ID provided, fetch the tone prompt
    if (customToneId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: customTone } = await supabase
        .from("custom_tones")
        .select("tone_prompt")
        .eq("id", customToneId)
        .eq("user_id", userId)
        .single();

      if (customTone?.tone_prompt) {
        prompt = `${customTone.tone_prompt}\n\nOriginal: ${input}`;
      } else {
        // Fallback to default
        prompt = getDefaultPrompt(tool, tone, input);
      }
    } else {
      prompt = getDefaultPrompt(tool, tone, input);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional writing assistant. Rewrite user content to match their requested tone. Be concise and effective.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedText = completion.choices[0]?.message?.content || "Error generating content";

    // Track this generation
    await trackGeneration(userId);

    // Save to history
    const generation = await saveGeneration(userId, tool, tone, input, generatedText);

    return NextResponse.json({ 
      output: generatedText,
      remaining: remaining - 1,
      isPro,
      generationId: generation.id
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

function getDefaultPrompt(tool: string, tone: string, input: string): string {
  const prompts: Record<string, string> = {
    linkedin: `Rewrite the following as a professional LinkedIn post. Tone: ${tone}. Make it engaging and appropriate for a professional audience. Original: ${input}`,
    email: `Rewrite the following email. Tone: ${tone}. Make it clear and effective. Original: ${input}`,
    dating: `Write a dating app message based on this context. Tone: ${tone}. Be genuine and engaging. Context: ${input}`,
    complaint: `Rewrite this as an effective complaint letter. Tone: ${tone}. Be firm but professional. Original: ${input}`,
  };

  return prompts[tool] || prompts.linkedin;
}
