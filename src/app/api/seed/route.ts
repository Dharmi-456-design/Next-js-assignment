import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    const res = await seedDatabase(force);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const res = await seedDatabase(true);
    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

