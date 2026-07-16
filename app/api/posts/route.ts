import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/posts — List all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get("published") === "true";
    const includeAuthor = searchParams.get("include") === "author";

    const posts = await prisma.post.findMany({
      where: publishedOnly ? { published: true } : undefined,
      include: { author: includeAuthor },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts — Create a new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, published, authorId } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!authorId) {
      return NextResponse.json(
        { error: "Author ID is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: content ?? null,
        published: published ?? false,
        authorId: parseInt(authorId, 10),
      },
      include: { author: true },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/posts error:", error);

    if (error instanceof Error && error.message.includes("Foreign key")) {
      return NextResponse.json(
        { error: "Author not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
