import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import { canGenerate, trackGeneration } from "@/lib/supabase";

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

    const { tool, input, tone } = await request.json();

    if (!input || !tool || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check usage limits
    const { allowed, remaining, isPro } = await canGenerate(userId);
    
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

    const prompts: Record<string, string> = {
      linkedin: `Rewrite the following as a professional LinkedIn post. Tone: ${tone}. Make it engaging and appropriate for a professional audience. Original: ${input}`,
      email: `Rewrite the following email. Tone: ${tone}. Make it clear and effective. Original: ${input}`,
      dating: `Write a dating app message based on this context. Tone: ${tone}. Be genuine and engaging. Context: ${input}`,
      complaint: `Rewrite this as an effective complaint letter. Tone: ${tone}. Be firm but professional. Original: ${input}`,
    };

    const prompt = prompts[tool] || prompts.linkedin;

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

    return NextResponse.json({ 
      output: generatedText,
      remaining: remaining - 1,
      isPro
    });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
