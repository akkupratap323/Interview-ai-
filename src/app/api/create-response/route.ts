import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export async function POST(req: NextRequest) {
  try {
    console.log("📝 API - create-response request received");
    
    const body = await req.json();
    console.log("📝 API - Request body:", body);

    // Validate required fields
    if (!body.interview_id) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    if (!body.call_id) {
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 }
      );
    }

    console.log("📝 API - Creating response with data:", body);

    const responseId = await ResponseService.createResponse(body);

    if (responseId) {
      console.log("📝 API - Response created successfully with ID:", responseId);
      return NextResponse.json(
        {
          success: true,
          message: "Response created successfully",
          id: responseId,
        },
        { status: 201 }
      );
    } else {
      console.error("📝 API - Response creation returned null");
      return NextResponse.json(
        { error: "Failed to create response" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("📝 API - Error creating response:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create response",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}