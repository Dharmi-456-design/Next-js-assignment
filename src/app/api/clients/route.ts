import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Client, Project, Payment } from "@/models";

// GET /api/clients — returns all clients with aggregated financial metrics.
export async function GET() {
  try {
    await connectToDatabase();
    const clients = await Client.find().sort({ createdAt: -1 }).lean();

    // Attach project count and financial summary to each client.
    const clientsWithMetrics = await Promise.all(
      clients.map(async (client) => {
        const clientProjects = await Project.find({ clientId: client._id }).lean();
        const projectCount = clientProjects.length;
        const totalProjectValue = clientProjects.reduce(
          (sum, p) => sum + (p.budget || 0),
          0
        );

        const payments = await Payment.find({
          clientId: client._id,
          status: "Successful",
        }).lean();

        const amountReceived = payments.reduce(
          (sum, pay) => sum + (pay.amount || 0),
          0
        );
        const outstandingBalance = Math.max(0, totalProjectValue - amountReceived);

        return {
          ...client,
          projectCount,
          totalProjectValue,
          amountReceived,
          outstandingBalance,
        };
      })
    );

    return NextResponse.json(clientsWithMetrics);
  } catch (error) {
    console.error("[GET /api/clients]", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

// POST /api/clients — creates a new client record.
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Client name and email are required" },
        { status: 400 }
      );
    }

    const client = await Client.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim(),
      company: body.company?.trim(),
      address: body.address?.trim(),
      notes: body.notes?.trim(),
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("[POST /api/clients]", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}

