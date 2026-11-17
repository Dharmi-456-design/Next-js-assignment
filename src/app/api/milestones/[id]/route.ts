import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Milestone, Activity } from "@/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await Milestone.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    if (body.status && body.status !== existing.status) {
      existing.status = body.status;
      if (body.status === "Completed") {
        existing.completedAt = new Date();
        await Activity.create({
          title: "Milestone Completed",
          description: `Milestone "${existing.title}" completed`,
          projectId: existing.projectId,
          type: "Milestone Completed",
        });
      }
    }

    if (body.title) existing.title = body.title.trim();
    if (body.description !== undefined) existing.description = body.description.trim();
    if (body.dueDate) existing.dueDate = new Date(body.dueDate);

    await existing.save();

    return NextResponse.json(existing);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const item = await Milestone.findByIdAndDelete(id);

    if (!item) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Milestone deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

