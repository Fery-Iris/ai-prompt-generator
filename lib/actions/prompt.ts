"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getAIModels() {
  try {
    const models = await prisma.aIModel.findMany({
      orderBy: { name: "asc" },
    });
    return models;
  } catch (error) {
    console.error("Failed to fetch AI models:", error);
    return [];
  }
}

export async function getUserPrompts() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const prompts = await prisma.prompt.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        model: true,
      },
    });

    return prompts;
  } catch (error) {
    console.error("Failed to fetch user prompts:", error);
    return [];
  }
}

export async function createPromptAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "You must be logged in to create a prompt." };
    }

    const title = formData.get("title") as string;
    const modelId = formData.get("modelId") as string;
    const intent = formData.get("intent") as string;
    const originalPrompt = formData.get("originalPrompt") as string;
    const finalPrompt = formData.get("finalPrompt") as string; // Will be set after streaming completes

    if (!title || !modelId || !intent || !originalPrompt) {
      return { error: "Please fill in all required fields." };
    }

    // Create prompt in database with DRAFT or COMPLETED status
    const newPrompt = await prisma.prompt.create({
      data: {
        userId: session.user.id,
        title,
        modelId,
        intent,
        originalPrompt,
        finalPrompt: finalPrompt || null,
        status: finalPrompt ? "COMPLETED" : "DRAFT",
      },
    });

    revalidatePath("/dashboard");
    return { success: true, promptId: newPrompt.id };
  } catch (error) {
    console.error("Failed to create prompt:", error);
    return { error: "Failed to create prompt. Please try again." };
  }
}

export async function getPromptById(promptId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return null;
    }

    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId, userId: session.user.id },
      include: {
        model: true,
        answers: {
          include: { question: true },
          orderBy: { question: { questionOrder: "asc" } },
        },
        revisions: {
          orderBy: { revisionNumber: "asc" },
        },
        feedbacks: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return prompt;
  } catch (error) {
    console.error("Failed to fetch prompt:", error);
    return null;
  }
}

export async function deletePromptAction(promptId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    await prisma.prompt.deleteMany({
      where: {
        id: promptId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete prompt:", error);
    return { error: "Failed to delete prompt. Please try again." };
  }
}

export async function deleteMultiplePromptsAction(promptIds: string[]) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!promptIds || promptIds.length === 0) {
      return { error: "No prompts selected for deletion." };
    }

    await prisma.prompt.deleteMany({
      where: {
        id: { in: promptIds },
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete prompts:", error);
    return { error: "Failed to delete selected prompts. Please try again." };
  }
}

