import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { canGenerate } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = user?.emailAddresses[0]?.emailAddress;
    const { remaining, isPro, isOwner } = await canGenerate(userId, userEmail);

    return NextResponse.json({ remaining, isPro, isOwner });
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}
