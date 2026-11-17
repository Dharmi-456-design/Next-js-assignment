import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Deliverable, Activity } from "@/models";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (projectId) query.projectId = projectId;
    if (status && status !== "All") query.status = status;

    const deliverables = await Deliverable.find(query)
      .populate("projectId", "title clientId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(deliverables);
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
        { error: "Deliverable title and project are required" },
        { status: 400 }
      );
    }

    const deliverable = await Deliverable.create({
      title: body.title.trim(),
      description: body.description?.trim(),
      projectId: body.projectId,
      submissionDate: body.submissionDate ? new Date(body.submissionDate) : new Date(),
      fileUrl: body.fileUrl?.trim(),
      fileName: body.fileName?.trim(),
      fileType: body.fileType?.trim(),
      status: body.status || "Pending",
    });

    await Activity.create({
      title: "Deliverable Created",
      description: `Deliverable "${deliverable.title}" created`,
      projectId: body.projectId,
      type: "Create",
    });

    const populated = await Deliverable.findById(deliverable._id).populate(
      "projectId",
      "title"
    );
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
