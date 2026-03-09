import { NextRequest, NextResponse } from "next/server";
import { templates } from "@/lib/templates";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get("tool");

    if (tool && tool in templates) {
      return NextResponse.json({ templates: templates[tool as keyof typeof templates] });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
