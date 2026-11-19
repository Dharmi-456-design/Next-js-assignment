import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Task, Activity } from "@/models";

// PUT /api/tasks/[id] — updates task details or status and logs status transitions.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const existing = await Task.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (body.status && body.status !== existing.status) {
      await Activity.create({
        title: "Task Status Changed",
        description: `Task "${existing.title}" moved to ${body.status}`,
        projectId: existing.projectId,
        type: "Status Change",
      });
      existing.status = body.status;
    }

    if (body.title) existing.title = body.title.trim();
    if (body.description !== undefined) existing.description = body.description.trim();
    if (body.priority) existing.priority = body.priority;
    if (body.dueDate) existing.dueDate = new Date(body.dueDate);

    await existing.save();

    const updated = await Task.findById(id).populate("projectId", "title");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/tasks/:id]", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] — removes a task record.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("[DELETE /api/tasks/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

