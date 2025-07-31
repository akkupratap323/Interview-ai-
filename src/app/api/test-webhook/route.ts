import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";
import { generateInterviewAnalytics } from "@/services/analytics.service";
import Retell from "retell-sdk";

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const { callId } = await req.json();
    
    if (!callId) {
      return NextResponse.json({ error: "Call ID is required" }, { status: 400 });
    }

    console.log("🧪 Testing webhook processing for call:", callId);

    // Get the response record
    const callDetails = await ResponseService.getResponseByCallId(callId);
    if (!callDetails) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Skip if already analyzed
    if (callDetails.is_analysed) {
      return NextResponse.json({ 
        message: "Call already analyzed", 
        analytics: callDetails.analytics 
      });
    }

    // Get call data from Retell
    const callOutput = await retell.call.retrieve(callId);
    const interviewId = callDetails?.interview_id;
    
    if (!callOutput || !interviewId) {
      return NextResponse.json({ 
        error: "Missing call output or interview ID" 
      }, { status: 400 });
    }
    
    const callData = callOutput as any;
    const duration = Math.round(
      (callData?.end_timestamp || 0) / 1000 - (callData?.start_timestamp || 0) / 1000,
    );

    // Generate analytics
    const payload = {
      callId: callId,
      interviewId: interviewId,
      transcript: callData?.transcript || '',
    };
    
    console.log("🧪 Generating analytics...");
    const result = await generateInterviewAnalytics(payload);
    
    if (result.error) {
      return NextResponse.json({ 
        error: "Analytics generation failed", 
        details: result.error 
      }, { status: result.status || 500 });
    }

    const analytics = result.analytics;

    // Save the analyzed response
    await ResponseService.saveResponse(
      {
        details: callOutput,
        is_analysed: true,
        duration: duration,
        analytics: analytics,
      },
      callId,
    );

    console.log("🧪 Test webhook processing completed successfully");

    return NextResponse.json({
      success: true,
      message: "Webhook processing completed",
      analytics: analytics,
      duration: duration
    });

  } catch (error) {
    console.error("🧪 Test webhook processing error:", error);
    return NextResponse.json({ 
      error: "Test failed", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}