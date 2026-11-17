import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Payment, Project, Activity } from "@/models";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const method = searchParams.get("method");

    const query: Record<string, unknown> = {};
    if (clientId) query.clientId = clientId;
    if (projectId) query.projectId = projectId;
    if (status && status !== "All") query.status = status;
    if (method && method !== "All") query.method = method;

    const payments = await Payment.find(query)
      .populate("clientId", "name company email")
      .populate("projectId", "title budget")
      .sort({ paymentDate: -1 })
      .lean();

    // Summary calculations
    const allPayments = await Payment.find().lean();
    const receivedRevenue = allPayments
      .filter((p) => p.status === "Successful")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingRevenue = allPayments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const failedRevenue = allPayments
      .filter((p) => p.status === "Failed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const activeProjects = await Project.find({
      status: { $in: ["In Progress", "Planning", "On Hold"] },
    }).lean();
    const totalActiveBudgets = activeProjects.reduce(
      (sum, p) => sum + (p.budget || 0),
      0
    );
    const outstandingBalance = Math.max(0, totalActiveBudgets - receivedRevenue);

    return NextResponse.json({
      payments,
      summary: {
        receivedRevenue,
        pendingRevenue,
        failedRevenue,
        outstandingBalance,
      },
    });
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

    if (!body.projectId || !body.clientId || !body.amount || !body.method) {
      return NextResponse.json(
        { error: "Project, client, amount, and payment method are required" },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      projectId: body.projectId,
      clientId: body.clientId,
      amount: Number(body.amount),
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
      method: body.method,
      status: body.status || "Pending",
      reference: body.reference?.trim(),
      notes: body.notes?.trim(),
    });

    if (payment.status === "Successful") {
      await Activity.create({
        title: "Payment Received",
        description: `Received ₹${payment.amount.toLocaleString("en-IN")} via ${payment.method}`,
        projectId: body.projectId,
        clientId: body.clientId,
        type: "Payment Received",
      });
    }

    const populated = await Payment.findById(payment._id)
      .populate("clientId", "name company")
      .populate("projectId", "title");

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

