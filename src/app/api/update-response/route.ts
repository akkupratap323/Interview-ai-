import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export async function POST(req: NextRequest) {
  try {
    const { callId, interviewId, updates } = await req.json();

    if (!callId) {
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 },
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Updates object is required" },
        { status: 400 },
      );
    }

    console.log("📝 Updating response for call:", callId, "with:", updates);

    // First check if the response exists with better error handling
    let existingResponse;
    try {
      existingResponse = await ResponseService.getResponseByCallId(callId);
      console.log(
        "📝 Response lookup result:",
        existingResponse ? "FOUND" : "NOT FOUND",
      );
    } catch (lookupError) {
      console.error("📝 Error during response lookup:", lookupError);
      return NextResponse.json(
        {
          success: false,
          error: "Database lookup failed",
          details:
            lookupError instanceof Error
              ? lookupError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }

    if (!existingResponse) {
      console.log("📝 Response not found for call:", callId);
      console.log(
        "📝 This usually means the response was never created during interview start",
      );
      console.log(
        "📝 We cannot safely create it now due to unique constraints",
      );

      return NextResponse.json(
        {
          success: false,
          error: "Response record not found",
          message:
            "The response was never created during interview start. This suggests an issue with the interview initialization process.",
          callId: callId,
          suggestion: "Check the response creation logs during interview start",
        },
        { status: 404 },
      );
    }

    const result = await ResponseService.saveResponse(updates, callId);

    if (result) {
      console.log("📝 Response updated successfully");
      return NextResponse.json({
        success: true,
        message: "Response updated successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to update response" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("📝 Error updating response:", error);
    return NextResponse.json(
      { error: "Failed to update response" },
      { status: 500 },
    );
  }
}
