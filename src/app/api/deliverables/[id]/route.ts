import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Deliverable, Activity } from "@/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await Deliverable.findById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 }
      );
    }

    if (body.status && body.status !== existing.status) {
      await Activity.create({
        title: "Deliverable Status Changed",
        description: `Deliverable "${existing.title}" updated to ${body.status}`,
        projectId: existing.projectId,
        type: body.status === "Approved" ? "Deliverable Approved" : "Status Change",
      });
      existing.status = body.status;
    }

    if (body.title) existing.title = body.title.trim();
    if (body.description !== undefined) existing.description = body.description.trim();
    if (body.fileUrl !== undefined) existing.fileUrl = body.fileUrl.trim();
    if (body.fileName !== undefined) existing.fileName = body.fileName.trim();
    if (body.submissionDate) existing.submissionDate = new Date(body.submissionDate);

    await existing.save();

    const updated = await Deliverable.findById(id).populate("projectId", "title");
    return NextResponse.json(updated);
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
    const deliverable = await Deliverable.findByIdAndDelete(id);

    if (!deliverable) {
      return NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Deliverable deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
