import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Milestone, Activity } from "@/models";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    const query: Record<string, unknown> = {};
    if (projectId) query.projectId = projectId;

    const milestones = await Milestone.find(query)
      .populate("projectId", "title")
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json(milestones);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.projectId) {
      return NextResponse.json(
        { error: "Milestone title and project are required" },
        { status: 400 }
      );
    }

    const milestone = await Milestone.create({
      title: body.title.trim(),
      description: body.description?.trim(),
      projectId: body.projectId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      status: body.status || "To Do",
      completedAt: body.status === "Completed" ? new Date() : undefined,
    });

    await Activity.create({
      title: "Milestone Created",
      description: `Milestone "${milestone.title}" created`,
      projectId: body.projectId,
      type: "Milestone Created",
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

