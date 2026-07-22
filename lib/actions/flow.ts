"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function detectIntentAndGenerateQuestions(originalPrompt: string, modelId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Use Gemini to detect intent and generate 3 follow-up questions
    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      schema: z.object({
        intent: z.string().describe("The categorized intent of the prompt (e.g., Coding, Copywriting, Image Generation, Data Analysis)"),
        questions: z.array(z.string()).min(2).max(4).describe("3 follow-up questions to ask the user to gather constraints, audience, goals, etc. to improve the prompt.")
      }),
      prompt: `Analyze the following draft prompt and determine its intent. Then, generate 3 follow-up questions to ask the user to gather more context, constraints, and requirements to craft the perfect final prompt.\n\nDraft Prompt: "${originalPrompt}"`
    });

    // Save prompt as IN_PROGRESS
    const prompt = await prisma.prompt.create({
      data: {
        userId: session.user.id,
        modelId,
        title: `Draft: ${object.intent}`,
        originalPrompt,
        intent: object.intent,
        status: "IN_PROGRESS",
      }
    });

    // Insert questions into database
    const dbQuestions = await Promise.all(object.questions.map((q, idx) => 
      prisma.interviewQuestion.create({
        data: {
          intent: object.intent,
          question: q,
          questionOrder: idx + 1,
          isRequired: true,
        }
      })
    ));

    return { 
      success: true, 
      promptId: prompt.id, 
      intent: object.intent, 
      questions: dbQuestions.map(q => ({ id: q.id, text: q.question })) 
    };

  } catch (error) {
    console.error("Error in detectIntentAndGenerateQuestions:", error);
    return { error: "Failed to initialize prompt wizard." };
  }
}

export async function submitAnswersAndGetPromptData(promptId: string, answers: Record<string, string>) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Save answers
    await Promise.all(
      Object.entries(answers).map(([questionId, answer]) => 
        prisma.promptAnswer.create({
          data: {
            promptId,
            questionId,
            answer,
          }
        })
      )
    );

    // Fetch full context for the API route to stream the final prompt
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId, userId: session.user.id },
      include: {
        answers: {
          include: { question: true }
        }
      }
    });

    if (!prompt) throw new Error("Prompt not found");

    return { success: true, prompt };
  } catch (error) {
    console.error("Error submitting answers:", error);
    return { error: "Failed to submit answers." };
  }
}

export async function submitFeedbackAndRevise(promptId: string, isSatisfied: boolean, additionalRequirement?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.promptFeedback.create({
      data: {
        promptId,
        isSatisfied,
        additionalRequirement: additionalRequirement || null,
      }
    });

    if (isSatisfied) {
      await prisma.prompt.update({
        where: { id: promptId },
        data: { status: "COMPLETED" }
      });
      return { success: true, completed: true };
    } else {
      // It's a rejection, so we need a revision
      // We'll update the Prompt status just to be sure it's IN_PROGRESS
      await prisma.prompt.update({
        where: { id: promptId },
        data: { status: "IN_PROGRESS" }
      });
      return { success: true, completed: false };
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return { error: "Failed to process feedback." };
  }
}

export async function saveFinalPrompt(promptId: string, finalPrompt: string, revisionNumber: number, title?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.prompt.update({
      where: { id: promptId },
      data: { 
        finalPrompt,
        ...(title ? { title } : {}) 
      }
    });

    // Save as a revision
    await prisma.promptRevision.create({
      data: {
        promptId,
        revisionNumber,
        promptText: finalPrompt,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error saving final prompt:", error);
    return { error: "Failed to save final prompt." };
  }
}
