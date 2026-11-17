import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Client, Project, Payment } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();
    const clients = await Client.find().sort({ createdAt: -1 }).lean();

    // Calculate aggregated metrics per client
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

    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Client name and email are required" },
        { status: 400 }
      );
    }

    const client = await Client.create({
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim(),
      company: body.company?.trim(),
      address: body.address?.trim(),
      notes: body.notes?.trim(),
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

