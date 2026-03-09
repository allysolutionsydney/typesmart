import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { 
  createTeam, 
  getTeamForUser, 
  getTeamMembers, 
  inviteTeamMember,
  removeTeamMember,
  hasTeamAccess 
} from "@/lib/supabase";

// GET - Get team info
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await getTeamForUser(userId);
    
    if (!team) {
      return NextResponse.json({ team: null });
    }

    // Get members if user is owner
    let members = [];
    if (team.role === 'owner') {
      members = await getTeamMembers(team.id);
    }

    return NextResponse.json({ team, members });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

// POST - Create team
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, maxSeats = 5 } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    // Check if user already has a team
    const existingTeam = await getTeamForUser(userId);
    if (existingTeam) {
      return NextResponse.json(
        { error: "You already have a team" },
        { status: 400 }
      );
    }

    const team = await createTeam(userId, name, maxSeats);

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
