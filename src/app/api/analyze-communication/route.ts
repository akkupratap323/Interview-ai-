import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
  SYSTEM_PROMPT,
  getCommunicationAnalysisPrompt,
} from "@/lib/prompts/communication-analysis";

export const maxDuration = 60;

export async function POST(req: Request) {
  logger.info("analyze-communication request received");

  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Your OpenRouter API key
      baseURL: "https://openrouter.ai/api/v1",
      maxRetries: 5,
      dangerouslyAllowBrowser: true,
      defaultHeaders: {
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_LIVE_URL || "http://localhost:3000",
        "X-Title": "AI Interview Platform",
      },
    });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // ✅ Changed to working model
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: getCommunicationAnalysisPrompt(transcript),
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = completion.choices[0]?.message?.content;

    logger.info("Communication analysis completed successfully");

    return NextResponse.json(
      { analysis: JSON.parse(analysis || "{}") },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Communication Analysis Error:", error);
    logger.error("Error analyzing communication skills", error);

    // Handle specific error types
    if (error.status === 402) {
      return NextResponse.json(
        {
          error:
            "Insufficient credits. Please add more credits to your OpenRouter account.",
        },
        { status: 402 },
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to analyze communication skills",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
