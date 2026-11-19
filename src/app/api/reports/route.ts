import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Project, Client, Payment, Task } from "@/models";

// GET /api/reports — returns analytical metrics for revenue trends and client distributions.
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const projectQuery: Record<string, unknown> = {};
    if (clientId) projectQuery.clientId = clientId;
    if (status && status !== "All") projectQuery.status = status;

    const [projects, payments, clients, tasks] = await Promise.all([
      Project.find(projectQuery).populate("clientId", "name company").lean(),
      Payment.find().populate("clientId", "name company").populate("projectId", "title").lean(),
      Client.find().lean(),
      Task.find().lean(),
    ]);

    // Client-wise earnings
    const clientEarningsMap: Record<string, { name: string; earned: number; outstanding: number }> = {};
    clients.forEach((c) => {
      clientEarningsMap[c._id.toString()] = {
        name: c.company ? `${c.name} (${c.company})` : c.name,
        earned: 0,
        outstanding: 0,
      };
    });

    // Calculate earnings per client
    payments.forEach((p: any) => {
      if (p.status === "Successful" && p.clientId) {
        const cId = String(p.clientId._id || p.clientId);
        if (cId && clientEarningsMap[cId]) {
          clientEarningsMap[cId].earned += p.amount;
        }
      }
    });

    // Calculate outstanding per client
    projects.forEach((p: any) => {
      const cId = String(p.clientId?._id || p.clientId);
      if (cId && clientEarningsMap[cId]) {
        const clientPayments = payments.filter(
          (pay: any) =>
            pay.status === "Successful" &&
            String(pay.projectId?._id || pay.projectId) === String(p._id)
        );
        const received = clientPayments.reduce((s: number, pay: any) => s + (pay.amount || 0), 0);
        clientEarningsMap[cId].outstanding += Math.max(0, (p.budget || 0) - received);
      }
    });

    const clientEarnings = Object.values(clientEarningsMap)
      .filter((c) => c.earned > 0 || c.outstanding > 0)
      .sort((a, b) => b.earned - a.earned);

    // Monthly revenue trend
    const monthlyMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      monthlyMap[key] = 0;
    }

    payments.forEach((p) => {
      if (p.status === "Successful") {
        const d = new Date(p.paymentDate);
        const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        if (monthlyMap[key] !== undefined) {
          monthlyMap[key] += p.amount;
        }
      }
    });

    const monthlyRevenue = Object.entries(monthlyMap).map(([month, amount]) => ({
      month,
      amount,
    }));

    // Status breakdown
    const statusCounts: Record<string, number> = {
      Planning: 0,
      "In Progress": 0,
      "On Hold": 0,
      Completed: 0,
      Cancelled: 0,
    };
    projects.forEach((p) => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
    });

    // Completion metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Completed").length;

    const totalProjectBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
    const totalReceived = payments
      .filter((p) => p.status === "Successful")
      .reduce((s, p) => s + (p.amount || 0), 0);

    return NextResponse.json({
      summary: {
        totalRevenue: totalReceived,
        totalBudget: totalProjectBudget,
        overallCompletionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        activeProjectsCount: projects.filter((p) =>
          ["In Progress", "Planning", "On Hold"].includes(p.status)
        ).length,
      },
      monthlyRevenue,
      clientEarnings,
      statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      })),
    });
  } catch (error) {
    console.error("[GET /api/reports]", error);
    return NextResponse.json(
      { error: "Failed to generate reports" },
      { status: 500 }
    );
  }
}
