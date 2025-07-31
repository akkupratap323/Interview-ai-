import { OpenAI } from "openai";
import { NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import {
  SYSTEM_PROMPT,
  createUserPrompt,
} from "@/lib/prompts/generate-insights";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

export async function POST(req: Request, res: Response) {
  logger.info("generate-insights request received");
  const body = await req.json();

  const responses = await ResponseService.getAllResponses(body.interviewId);
  const interview = await InterviewService.getInterviewById(body.interviewId);

  let callSummaries = "";
  if (responses) {
    responses.forEach((response) => {
      const details = response.details as any;
      callSummaries += details?.call_analysis?.call_summary || "";
    });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY, // Support both env var names
    baseURL: "https://openrouter.ai/api/v1",
    maxRetries: 5,
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_LIVE_URL || 'http://localhost:3000',
      'X-Title': 'AI Interview Platform',
    },
  });

  try {
    const prompt = createUserPrompt(
      callSummaries,
      interview?.name || '',
      interview?.objective || '',
      interview?.description || '',
    );

    const baseCompletion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // ✅ Fixed: Added "openai/" prefix and using working model
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const basePromptOutput = baseCompletion.choices[0] || {};
    const content = basePromptOutput.message?.content || "";
    const insightsResponse = JSON.parse(content);

    await InterviewService.updateInterview(
      { insights: insightsResponse.insights },
      body.interviewId,
    );

    logger.info("Insights generated successfully");

    return NextResponse.json(
      {
        response: content,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("OpenRouter API Error:", error); // ✅ Added detailed logging
    logger.error("Error generating insights", error);

    // Handle specific error types
    if (error.status === 402) {
      return NextResponse.json(
        { error: "Insufficient credits. Please add more credits to your OpenRouter account." },
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
        error: "Failed to generate insights",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 },
    );
  }
}
