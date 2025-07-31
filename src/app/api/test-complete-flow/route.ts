import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, email, name } = await req.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 },
      );
    }

    console.log(
      "🧪 Test - Starting complete flow test for interview:",
      interviewId,
    );

    // Step 1: Create a test response
    const testCallId = `test-call-${Date.now()}`;
    console.log("🧪 Test - Creating response with call ID:", testCallId);

    const responseId = await ResponseService.createResponse({
      interview_id: interviewId,
      call_id: testCallId,
      email: email || `test-${Date.now()}@example.com`, // This will create a user or use null
      name: name || `Test User ${Date.now()}`,
    });

    if (!responseId) {
      return NextResponse.json(
        { error: "Failed to create test response" },
        { status: 500 },
      );
    }

    console.log("🧪 Test - Response created with ID:", responseId);

    // Step 2: Update response to simulate interview end
    console.log("🧪 Test - Marking response as ended");
    await ResponseService.saveResponse(
      {
        is_ended: true,
        duration: 120, // 2 minutes
        tab_switch_count: 0,
      },
      testCallId,
    );

    // Step 3: Add some mock details
    console.log("🧪 Test - Adding mock call details");
    await ResponseService.saveResponse(
      {
        details: {
          call_id: testCallId,
          transcript: "This is a test transcript for debugging purposes.",
          status: "completed",
          start_timestamp: Date.now() - 120000,
          end_timestamp: Date.now(),
        },
      },
      testCallId,
    );

    // Step 4: Add mock analytics
    console.log("🧪 Test - Adding mock analytics");
    await ResponseService.saveResponse(
      {
        is_analysed: true,
        analytics: {
          overallScore: 8,
          skillsAssessment: [
            {
              skill: "Communication",
              score: 8,
              feedback: "Good communication skills",
            },
            {
              skill: "Technical Knowledge",
              score: 7,
              feedback: "Solid technical foundation",
            },
          ],
          questionAnalysis: [
            {
              question: "Tell me about yourself",
              response: "Good response",
              score: 8,
            },
          ],
          generatedAt: new Date().toISOString(),
          transcriptLength: 500,
          questionCount: 3,
          modelUsed: "test-model",
        },
      },
      testCallId,
    );

    console.log("🧪 Test - Complete flow test finished");

    return NextResponse.json({
      success: true,
      message: "Test response created successfully",
      testCallId: testCallId,
      responseId: responseId,
      steps: [
        "Created response record",
        "Marked as ended",
        "Added call details",
        "Added analytics",
      ],
    });
  } catch (error) {
    console.error("🧪 Test - Error in complete flow test:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
