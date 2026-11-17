import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Task, Activity } from "@/models";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const query: Record<string, unknown> = {};
    if (projectId) query.projectId = projectId;
    if (status && status !== "All") query.status = status;
    if (priority && priority !== "All") query.priority = priority;

    const tasks = await Task.find(query)
      .populate("projectId", "title clientId")
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(tasks);
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
        { error: "Task title and project reference are required" },
        { status: 400 }
      );
    }

    const task = await Task.create({
      title: body.title.trim(),
      description: body.description?.trim(),
      projectId: body.projectId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      priority: body.priority || "Medium",
      status: body.status || "To Do",
    });

    await Activity.create({
      title: "Task Created",
      description: `Task "${task.title}" added to project`,
      projectId: body.projectId,
      type: "Create",
    });

    const populated = await Task.findById(task._id).populate("projectId", "title");
    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

