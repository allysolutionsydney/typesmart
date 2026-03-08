import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { tool, input, tone } = await request.json();

    if (!input || !tool || !tone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
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

    return NextResponse.json({ output: generatedText });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
