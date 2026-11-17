import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Comment, Activity } from "@/models";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    if (!body.projectId || !body.content) {
      return NextResponse.json(
        { error: "Project ID and comment content are required" },
        { status: 400 }
      );
    }

    const comment = await Comment.create({
      projectId: body.projectId,
      content: body.content.trim(),
      author: body.author || "You",
    });

    await Activity.create({
      title: "Comment Added",
      description: `Comment posted on project: "${comment.content.slice(0, 50)}${comment.content.length > 50 ? "..." : ""}"`,
      projectId: body.projectId,
      type: "Comment Added",
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

