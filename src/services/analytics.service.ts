"use server";

import { OpenAI } from "openai";
import { ResponseService } from "@/services/responses.service";
import { InterviewService } from "@/services/interviews.service";
import { Question } from "@/types/interview";
import { Analytics } from "@/types/response";
import {
  getInterviewAnalyticsPrompt,
  SYSTEM_PROMPT,
} from "@/lib/prompts/analytics";

export const generateInterviewAnalytics = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    console.log("Starting analytics generation for callId:", callId);

    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (!response) {
      console.error("Response not found for callId:", callId);
      return { error: "Response not found", status: 404 };
    }

    if (!interview) {
      console.error("Interview not found for interviewId:", interviewId);
      return { error: "Interview not found", status: 404 };
    }

    // Check if analytics already exist
    if (response.analytics) {
      console.log("Analytics already exist for callId:", callId);
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    // Get transcript data
    const interviewTranscript = transcript || response.details?.transcript;
    
    if (!interviewTranscript || interviewTranscript.trim().length === 0) {
      console.error("No transcript available for callId:", callId);
      return { error: "No transcript available", status: 400 };
    }

    console.log("Transcript length:", interviewTranscript.length);

    // Prepare questions
    const questions = interview?.questions || [];
    
    if (questions.length === 0) {
      console.error("No questions found for interview:", interviewId);
      return { error: "No questions found", status: 400 };
    }

    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    console.log("Questions prepared:", questions.length);

    // Initialize OpenAI client with OpenRouter configuration
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Use OpenRouter API key
      baseURL: "https://openrouter.ai/api/v1", // OpenRouter base URL
      maxRetries: 3,
      timeout: 60000, // 60 seconds timeout
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_LIVE_URL || 'http://localhost:3000',
        'X-Title': 'AI Interview Platform',
      },
    });

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenRouter API key not configured");
      return { error: "OpenRouter API key not configured", status: 500 };
    }

    // Generate the analytics prompt
    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions,
    );

    console.log("Prompt generated, length:", prompt.length);

    // Make OpenRouter API call with cost-effective model
    const baseCompletion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // Cost-effective model through OpenRouter
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
      temperature: 0.3, // Lower temperature for more consistent results
      max_tokens: 4000, // Ensure enough tokens for complete response
    });

    const basePromptOutput = baseCompletion.choices[0];
    
    if (!basePromptOutput || !basePromptOutput.message?.content) {
      console.error("Empty response from OpenRouter");
      return { error: "Empty response from OpenRouter", status: 500 };
    }

    const content = basePromptOutput.message.content;
    console.log("OpenRouter response received, length:", content.length);

    // Parse JSON response with better error handling
    let analyticsResponse;
    try {
      analyticsResponse = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenRouter response:", parseError);
      console.error("Raw content:", content);
      return { error: "Failed to parse analytics response", status: 500 };
    }

    // Validate required fields in analytics response
    if (!analyticsResponse.overallScore && analyticsResponse.overallScore !== 0) {
      console.error("Missing overallScore in analytics response");
      console.log("Analytics response:", analyticsResponse);
    }

    // Add questions to analytics
    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );

    // Add metadata
    analyticsResponse.generatedAt = new Date().toISOString();
    analyticsResponse.transcriptLength = interviewTranscript.length;
    analyticsResponse.questionCount = questions.length;
    analyticsResponse.modelUsed = "openai/gpt-3.5-turbo";

    console.log("Analytics generated successfully:", {
      overallScore: analyticsResponse.overallScore,
      hasQuestionAnalysis: !!analyticsResponse.questionAnalysis,
      hasSkillsAssessment: !!analyticsResponse.skillsAssessment,
    });

    // Save analytics to the response record
    await ResponseService.updateResponse({
      analytics: analyticsResponse,
    }, callId);

    console.log("Analytics saved to database for callId:", callId);

    return { analytics: analyticsResponse, status: 200 };

  } catch (error: any) {
    console.error("Error in generateInterviewAnalytics:", error);
    
    // Handle specific OpenRouter error types
    if (error.status === 402) {
      console.error("Insufficient credits on OpenRouter account");
      return { 
        error: "Insufficient credits. Please add more credits to your OpenRouter account.", 
        status: 402 
      };
    }

    if (error.status === 429) {
      console.error("Rate limit exceeded on OpenRouter");
      return { 
        error: "Rate limit exceeded. Please try again later.", 
        status: 429 
      };
    }

    if (error.status === 401) {
      console.error("Invalid OpenRouter API key");
      return { 
        error: "Invalid API key. Please check your OpenRouter configuration.", 
        status: 401 
      };
    }

    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return { 
      error: error instanceof Error ? error.message : "Internal server error", 
      status: 500 
    };
  }
};

// Alternative function with GPT-4o model for higher accuracy (costs more)
export const generateInterviewAnalyticsAdvanced = async (payload: {
  callId: string;
  interviewId: string;
  transcript: string;
}) => {
  const { callId, interviewId, transcript } = payload;

  try {
    const response = await ResponseService.getResponseByCallId(callId);
    const interview = await InterviewService.getInterviewById(interviewId);

    if (response.analytics) {
      return { analytics: response.analytics as Analytics, status: 200 };
    }

    const interviewTranscript = transcript || response.details?.transcript;
    const questions = interview?.questions || [];
    const mainInterviewQuestions = questions
      .map((q: Question, index: number) => `${index + 1}. ${q.question}`)
      .join("\n");

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      maxRetries: 3,
      timeout: 60000,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_LIVE_URL || 'http://localhost:3000',
        'X-Title': 'AI Interview Platform',
      },
    });

    const prompt = getInterviewAnalyticsPrompt(
      interviewTranscript,
      mainInterviewQuestions,
    );

    // Use GPT-4o for more accurate analysis (higher cost)
    const baseCompletion = await openai.chat.completions.create({
      model: "openai/gpt-4o", // More accurate but costs more
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
      temperature: 0.2,
      max_tokens: 4000,
    });

    const content = baseCompletion.choices[0]?.message?.content || "";
    const analyticsResponse = JSON.parse(content);

    analyticsResponse.mainInterviewQuestions = questions.map(
      (q: Question) => q.question,
    );
    analyticsResponse.modelUsed = "openai/gpt-4o";

    await ResponseService.updateResponse({
      analytics: analyticsResponse,
    }, callId);

    return { analytics: analyticsResponse, status: 200 };

  } catch (error: any) {
    console.error("Error in advanced analytics generation:", error);
    return { 
      error: error instanceof Error ? error.message : "Internal server error", 
      status: 500 
    };
  }
};

// Helper function to check OpenRouter account status
export const checkOpenRouterStatus = async () => {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_LIVE_URL || 'http://localhost:3000',
        'X-Title': 'AI Interview Platform',
      },
    });

    // Simple test request to check API key validity
    const testCompletion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5,
    });

    return { 
      status: "active", 
      message: "OpenRouter API key is valid and working",
      model: "openai/gpt-3.5-turbo"
    };

  } catch (error: any) {
    console.error("OpenRouter status check failed:", error);
    return { 
      status: "error", 
      message: error.message || "Failed to connect to OpenRouter",
      error: error.status || 500
    };
  }
};
