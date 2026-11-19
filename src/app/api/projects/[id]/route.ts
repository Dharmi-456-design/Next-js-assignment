import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import {
  Project,
  Task,
  Milestone,
  Deliverable,
  Payment,
  Activity,
  Comment,
} from "@/models";

// GET /api/projects/[id] — returns project details, associated tasks, milestones, and financials.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const project = await Project.findById(id)
      .populate("clientId", "name company email phone")
      .lean();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const [tasks, milestones, deliverables, payments, activities, comments] =
      await Promise.all([
        Task.find({ projectId: id }).sort({ createdAt: -1 }).lean(),
        Milestone.find({ projectId: id }).sort({ dueDate: 1 }).lean(),
        Deliverable.find({ projectId: id }).sort({ createdAt: -1 }).lean(),
        Payment.find({ projectId: id }).sort({ paymentDate: -1 }).lean(),
        Activity.find({ projectId: id }).sort({ createdAt: -1 }).limit(20).lean(),
        Comment.find({ projectId: id }).sort({ createdAt: -1 }).lean(),
      ]);

    const receivedAmount = payments
      .filter((p) => p.status === "Successful")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingBalance = Math.max(0, (project.budget || 0) - receivedAmount);

    const completedTasks = tasks.filter((t) => t.status === "Completed").length;
    const taskCompletionRate =
      tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return NextResponse.json({
      project,
      client: project.clientId,
      tasks,
      milestones,
      deliverables,
      payments,
      activities,
      comments,
      financials: {
        budget: project.budget,
        receivedAmount,
        outstandingBalance,
        taskCompletionRate,
      },
    });
  } catch (error) {
    console.error("[GET /api/projects/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] — updates project fields and logs progress changes.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await Project.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (body.progress !== undefined) {
      existing.progress = Number(body.progress);

      await Activity.create({
        title: "Progress Updated",
        description: `Project "${existing.title}" progress set to ${body.progress}%`,
        projectId: existing._id,
        clientId: existing.clientId,
        type: "Progress Update",
      });
    }

    if (body.title) existing.title = body.title.trim();
    if (body.description !== undefined) existing.description = body.description.trim();
    if (body.budget !== undefined) existing.budget = Number(body.budget);
    if (body.status) existing.status = body.status;
    if (body.priority) existing.priority = body.priority;
    if (body.startDate) existing.startDate = new Date(body.startDate);
    if (body.deadline) existing.deadline = new Date(body.deadline);

    await existing.save();

    const updated = await Project.findById(id).populate("clientId", "name company");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/projects/:id]", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] — deletes project and associated activities.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Project deleted" });
  } catch (error) {
    console.error("[DELETE /api/projects/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
