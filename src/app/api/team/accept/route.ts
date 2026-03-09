import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { acceptInvitation } from "@/lib/supabase";

// POST - Accept invitation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Invitation token is required" },
        { status: 400 }
      );
    }

    await acceptInvitation(token, userId);

    return NextResponse.json({ 
      success: true,
      message: "You have successfully joined the team"
    });
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: error.message || "Failed to accept invitation" },
      { status: 400 }
    );
  }
}
