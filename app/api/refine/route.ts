import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@/auth";

export const maxDuration = 60; // Allow up to 60s for generation

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { prompt: originalPrompt, intent, answers, previousFeedback } = await req.json();

    if (!originalPrompt || !intent) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Format the interview answers
    let answersContext = "";
    if (answers && answers.length > 0) {
      answersContext = "\n\nUser Constraints & Context from Interview:\n";
      answers.forEach((ans: any) => {
        answersContext += `Q: ${ans.question}\nA: ${ans.answer}\n`;
      });
    }

    // Format the previous feedback/refinements
    let feedbackContext = "";
    if (previousFeedback && previousFeedback.length > 0) {
      feedbackContext = "\n\nUser Feedback for Refinement:\n";
      previousFeedback.forEach((fb: string, idx: number) => {
        feedbackContext += `Revision ${idx + 1} requirement: ${fb}\n`;
      });
    }

    const systemPrompt = `You are an Expert Prompt Engineer and AI Whisperer.
Your goal is to craft a highly optimized, robust, and effective prompt ready to be used on advanced LLMs like GPT-4, Claude 3.5, or Gemini 1.5.

INTENT: ${intent}

${answersContext}
${feedbackContext}

Follow these rules for the final prompt:
1. Use clear delimiters (like XML tags or markdown) to separate instructions from data if necessary.
2. Define a clear persona or role based on the intent and constraints.
3. Specify the exact output format, tone, and constraints.
4. Provide context or examples if it helps the LLM understand.
5. ONLY output the final optimized prompt. Do NOT include introductory conversational text like "Here is the optimized prompt:". Ensure the prompt is ready to be copied and pasted directly into an AI.`;

    const result = await streamText({
      model: google("gemini-3.5-flash"),
      system: systemPrompt,
      prompt: `User's Draft Prompt:\n"${originalPrompt}"`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
