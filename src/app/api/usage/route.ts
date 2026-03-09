import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { canGenerate } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { remaining, isPro } = await canGenerate(userId);

    return NextResponse.json({ remaining, isPro });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
