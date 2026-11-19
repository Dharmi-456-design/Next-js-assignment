import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

// GET /api/seed — checks or seeds database if empty (pass ?force=true to reset).
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    const res = await seedDatabase(force);
    return NextResponse.json(res);
  } catch (error) {
    console.error("[GET /api/seed]", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}

// POST /api/seed — forcefully re-seeds sample mock data.
export async function POST(req: Request) {
  try {
    const res = await seedDatabase(true);
    return NextResponse.json(res);
  } catch (error) {
    console.error("[POST /api/seed]", error);
    return NextResponse.json(
      { error: "Failed to re-seed database" },
      { status: 500 }
    );
  }
}

