import { NextRequest, NextResponse } from "next/server";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";
import { buildSystemPrompt, buildUserPrompt, getFallbackResponse } from "@/lib/game/prompts";
import { ChatRequest, Suspect, CaseTemplate } from "@/types/game";

// Request validation schema
const chatRequestSchema = z.object({
  suspectId: z.string(),
  questionType: z.enum(["whereabouts", "relationship", "evidence", "accusation"]),
  clueId: z.string().optional(),
  caseData: z.object({
    id: z.string(),
    title: z.string(),
    victim: z.object({
      name: z.string(),
      description: z.string(),
      foundIn: z.string(),
      timeOfDeath: z.string(),
    }),
    suspects: z.array(z.any()),
    rooms: z.array(z.any()),
    clues: z.array(z.any()),
    weapons: z.array(z.any()),
    solution: z.object({
      killerId: z.string(),
      weaponId: z.string(),
      locationId: z.string(),
      motive: z.string(),
      confession: z.string(),
    }),
    maxActions: z.number(),
  }),
  conversationHistory: z.array(z.any()),
  discoveredClues: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(clientIp);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = chatRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { suspectId, questionType, clueId, caseData, conversationHistory, discoveredClues } =
      validationResult.data as ChatRequest;

    // Find the suspect
    const suspect = caseData.suspects.find((s: Suspect) => s.id === suspectId);
    if (!suspect) {
      return NextResponse.json(
        { error: "Suspect not found" },
        { status: 404 }
      );
    }

    // Find the clue if provided
    const clue = clueId
      ? caseData.clues.find((c) => c.id === clueId)
      : undefined;

    // Check for API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Return a fallback response if no API key
      return NextResponse.json({
        message: getFallbackResponse(suspect),
      });
    }

    // Build prompts
    const systemPrompt = buildSystemPrompt(suspect, caseData as CaseTemplate, discoveredClues);
    const userPrompt = buildUserPrompt(questionType, suspect, clue);

    // Format conversation history for context
    const historyMessages = conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === "player" ? "user" : "assistant",
      content: msg.role === "player" ? `Detective asks about: ${msg.questionType}` : msg.content,
    }));

    try {
      const groq = createGroq({
        apiKey,
      });

      const { text } = await generateText({
        model: groq("llama-3.1-8b-instant"),
        system: systemPrompt,
        messages: [
          ...historyMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user", content: userPrompt },
        ],
        maxTokens: 200,
        temperature: 0.7,
      });

      // Validate response length and content
      let response = text.trim();

      // Truncate if too long
      if (response.length > 800) {
        response = response.substring(0, 800) + "...";
      }

      // If response is empty, use fallback
      if (!response) {
        response = getFallbackResponse(suspect);
      }

      return NextResponse.json({ message: response });
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Return fallback on AI error
      return NextResponse.json({
        message: getFallbackResponse(suspect),
      });
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
