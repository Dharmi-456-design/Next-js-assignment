import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Project, Task, Payment, Activity } from "@/models";

// GET /api/projects — returns projects with task stats and payment totals.
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};
    if (clientId) query.clientId = clientId;
    if (status && status !== "All") query.status = status;

    const projects = await Project.find(query)
      .populate("clientId", "name company email")
      .sort({ createdAt: -1 })
      .lean();

    // Attach task completion metrics and received payments
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id }).lean();
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === "Completed").length;

        const payments = await Payment.find({
          projectId: project._id,
          status: "Successful",
        }).lean();

        const receivedAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const outstandingBalance = Math.max(0, (project.budget || 0) - receivedAmount);

        return {
          ...project,
          client: project.clientId,
          taskStats: {
            total: totalTasks,
            completed: completedTasks,
            percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          },
          receivedAmount,
          outstandingBalance,
        };
      })
    );

    return NextResponse.json(projectsWithDetails);
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects — creates a new project and logs initial activity.
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.title || !body.clientId || body.budget === undefined) {
      return NextResponse.json(
        { error: "Title, client, and budget are required" },
        { status: 400 }
      );
    }

    const project = await Project.create({
      title: body.title.trim(),
      description: body.description?.trim(),
      clientId: body.clientId,
      budget: Number(body.budget),
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      deadline: body.deadline ? new Date(body.deadline) : undefined,
      status: body.status || "Planning",
      priority: body.priority || "Medium",
      progress: Number(body.progress) || 0,
    });

    // Record creation activity
    await Activity.create({
      title: "Project Created",
      description: `Project "${project.title}" created with budget ₹${project.budget.toLocaleString("en-IN")}`,
      projectId: project._id,
      clientId: body.clientId,
      type: "Create",
    });

    const populated = await Project.findById(project._id).populate(
      "clientId",
      "name company"
    );

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

