import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Client, Project, Payment } from "@/models";

// GET /api/clients/[id] — returns a single client with projects, payments, and financials.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const client = await Client.findById(id).lean();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const projects = await Project.find({ clientId: id }).sort({ createdAt: -1 }).lean();
    const payments = await Payment.find({ clientId: id }).sort({ paymentDate: -1 }).lean();

    const totalProjectValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const amountReceived = payments
      .filter((p) => p.status === "Successful")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingBalance = Math.max(0, totalProjectValue - amountReceived);

    return NextResponse.json({
      client,
      projects,
      payments,
      financials: {
        totalProjectValue,
        amountReceived,
        outstandingBalance,
      },
    });
  } catch (error) {
    console.error("[GET /api/clients/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] — updates a client record.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const client = await Client.findByIdAndUpdate(
      id,
      {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        address: body.address,
        notes: body.notes,
      },
      { new: true, runValidators: true }
    );

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("[PUT /api/clients/:id]", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] — removes a client record.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Client deleted" });
  } catch (error) {
    console.error("[DELETE /api/clients/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}

