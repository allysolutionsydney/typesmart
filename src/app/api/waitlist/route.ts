import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WAITLIST_FILE = path.join(process.cwd(), "data", "waitlist.json");

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(WAITLIST_FILE)) {
  fs.writeFileSync(WAITLIST_FILE, JSON.stringify([], null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Read current waitlist
    const waitlist = JSON.parse(fs.readFileSync(WAITLIST_FILE, "utf-8"));

    // Check if already exists
    if (waitlist.some((entry: { email: string }) => entry.email === email)) {
      return NextResponse.json(
        { message: "Already on waitlist" },
        { status: 200 }
      );
    }

    // Add new entry
    waitlist.push({
      email,
      joinedAt: new Date().toISOString(),
    });

    // Save
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(waitlist, null, 2));

    return NextResponse.json(
      { message: "Added to waitlist" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
