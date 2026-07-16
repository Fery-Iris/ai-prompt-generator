import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/health — Health check endpoint
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        users: userCount,
        posts: postCount,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: { connected: false },
      },
      { status: 503 }
    );
  }
}
