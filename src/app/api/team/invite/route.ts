import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inviteTeamMember, acceptInvitation } from "@/lib/supabase";

// POST - Invite team member
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, email } = await request.json();

    if (!teamId || !email) {
      return NextResponse.json(
        { error: "Team ID and email are required" },
        { status: 400 }
      );
    }

    const invitation = await inviteTeamMember(teamId, email, userId);

    // TODO: Send email with invitation link
    // For now, just return the invite URL

    return NextResponse.json({ 
      invitation,
      message: "Invitation created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to invite team member" },
      { status: 500 }
    );
  }
}
