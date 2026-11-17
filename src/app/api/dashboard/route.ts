import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Project, Client, Payment, Task, Activity } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Core Counts & Metrics
    const allProjects = await Project.find().populate("clientId", "name company").sort({ updatedAt: -1 }).lean();
    const allPayments = await Payment.find().populate("clientId", "name").populate("projectId", "title").sort({ paymentDate: -1 }).lean();
    const allTasks = await Task.find().populate("projectId", "title").lean();
    const recentActivities = await Activity.find().sort({ createdAt: -1 }).limit(10).lean();

    const activeProjects = allProjects.filter((p) =>
      ["In Progress", "Planning", "On Hold"].includes(p.status)
    );
    const completedProjects = allProjects.filter((p) => p.status === "Completed");

    const successfulPayments = allPayments.filter((p) => p.status === "Successful");
    const revenueReceived = successfulPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    const totalActiveBudget = activeProjects.reduce(
      (sum, p) => sum + (p.budget || 0),
      0
    );
    const outstandingPayments = Math.max(0, totalActiveBudget - revenueReceived);

    // 2. Overdue tasks and upcoming deadlines
    const now = new Date();
    const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const overdueTasks = allTasks.filter((t) => {
      if (!t.dueDate || t.status === "Completed") return false;
      return new Date(t.dueDate).getTime() < now.getTime();
    });

    const upcomingDeadlines = allTasks
      .filter((t) => {
        if (!t.dueDate || t.status === "Completed") return false;
        const due = new Date(t.dueDate).getTime();
        return due >= now.getTime() && due <= fourteenDaysAhead.getTime();
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    // 3. Status distribution
    const statusCounts: Record<string, number> = {
      "Planning": 0,
      "In Progress": 0,
      "On Hold": 0,
      "Completed": 0,
      "Cancelled": 0,
    };
    allProjects.forEach((p) => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
    });

    // 4. Monthly revenue trend for last 6 months
    const monthlyRevenue: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      monthlyRevenue[key] = 0;
    }

    successfulPayments.forEach((p) => {
      const d = new Date(p.paymentDate);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      if (monthlyRevenue[key] !== undefined) {
        monthlyRevenue[key] += p.amount;
      }
    });

    const revenueTrend = Object.entries(monthlyRevenue).map(([month, amount]) => ({
      month,
      amount,
    }));

    return NextResponse.json({
      metrics: {
        revenueReceived,
        outstandingPayments,
        activeProjectsCount: activeProjects.length,
        completedProjectsCount: completedProjects.length,
        totalProjectsCount: allProjects.length,
      },
      activeProjects: activeProjects.slice(0, 5),
      recentPayments: allPayments.slice(0, 6),
      upcomingDeadlines,
      overdueTasks,
      recentActivities,
      statusDistribution: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      revenueTrend,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

