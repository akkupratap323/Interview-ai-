import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export async function POST(req: NextRequest) {
  try {
    console.log("🔬 Debug Response Creation - Starting test");

    const { interviewId, email, name } = await req.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID required" },
        { status: 400 },
      );
    }

    const testCallId = `debug-test-${Date.now()}`;

    console.log("🔬 Testing response creation with:");
    console.log("🔬 Interview ID:", interviewId);
    console.log("🔬 Call ID:", testCallId);
    console.log("🔬 Email:", email);
    console.log("🔬 Name:", name);

    // Test direct service call
    try {
      const responseId = await ResponseService.createResponse({
        interview_id: interviewId,
        call_id: testCallId,
        email: email || "debug@test.com",
        name: name || "Debug User",
      });

      console.log("🔬 Direct service call result:", responseId);

      if (responseId) {
        // Test retrieval
        const retrieved = await ResponseService.getResponseByCallId(testCallId);
        console.log("🔬 Retrieved response:", retrieved ? "SUCCESS" : "FAILED");

        return NextResponse.json({
          success: true,
          message: "Debug response creation successful",
          responseId: responseId,
          testCallId: testCallId,
          retrieved: !!retrieved,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Response creation returned null",
            testCallId: testCallId,
          },
          { status: 500 },
        );
      }
    } catch (serviceError) {
      console.error("🔬 Direct service error:", serviceError);
      return NextResponse.json(
        {
          success: false,
          error: "Service call failed",
          details:
            serviceError instanceof Error
              ? serviceError.message
              : "Unknown error",
          testCallId: testCallId,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("🔬 Debug endpoint error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
