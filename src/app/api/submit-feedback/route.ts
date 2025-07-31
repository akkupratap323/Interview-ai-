import { NextRequest, NextResponse } from "next/server";
import { FeedbackService } from "@/services/feedback.service";
import { FeedbackData } from "@/types/response";

export async function POST(req: NextRequest) {
  try {
    console.log("🎯 API - submit-feedback request received");

    const body = await req.json();
    console.log("🎯 API - Request body:", body);

    // Validate required fields
    if (!body.interview_id) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 },
      );
    }

    // Validate that at least satisfaction or feedback is provided
    if (
      body.satisfaction === null &&
      (!body.feedback || body.feedback.trim() === "")
    ) {
      return NextResponse.json(
        { error: "Either satisfaction rating or feedback text is required" },
        { status: 400 },
      );
    }

    const feedbackData: FeedbackData = {
      interview_id: body.interview_id,
      satisfaction: body.satisfaction !== undefined ? body.satisfaction : null,
      feedback: body.feedback || null,
      email: body.email || null,
    };

    console.log("🎯 API - Processed feedback data:", feedbackData);

    const result = await FeedbackService.submitFeedback(feedbackData);

    console.log("🎯 API - Feedback submitted successfully:", result.id);

    return NextResponse.json(
      {
        success: true,
        message: "Feedback submitted successfully",
        id: result.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🎯 API - Error submitting feedback:", error);

    // Handle specific Prisma errors or other database errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit feedback",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}
