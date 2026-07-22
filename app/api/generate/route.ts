import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { auth } from "@/auth";

export const maxDuration = 60; // Allow up to 60s for generation

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2. Parse request body
    const { prompt: originalPrompt, intent } = await req.json();

    if (!originalPrompt || !intent) {
      return new Response("Missing required fields", { status: 400 });
    }

    // 3. System Prompt Definition
    const systemPrompt = `You are an Expert Prompt Engineer and AI Whisperer.
Your goal is to take the user's rough draft prompt and their stated intent, and transform it into a highly optimized, robust, and effective prompt ready to be used on advanced LLMs like GPT-4, Claude 3.5, or Gemini 1.5.

Here is the user's INTENT for the prompt:
"${intent}"

Follow these rules for the final prompt:
1. Use clear delimiters (like XML tags or markdown) to separate instructions from data if necessary.
2. Define a clear persona or role.
3. Specify the exact output format, tone, and constraints.
4. Provide context or examples if it helps the LLM understand.
5. ONLY output the final optimized prompt. Do NOT include introductory conversational text like "Here is the optimized prompt:".`;

    // 4. Generate stream using Gemini 1.5 Flash
    const result = await streamText({
      model: google("gemini-3.5-flash"),
      system: systemPrompt,
      prompt: `User's Draft Prompt:\n${originalPrompt}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Generation Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
