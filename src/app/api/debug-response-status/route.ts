import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get("callId");
    const interviewId = searchParams.get("interviewId");

    if (!callId && !interviewId) {
      return NextResponse.json(
        {
          error: "Either callId or interviewId is required",
        },
        { status: 400 },
      );
    }

    let response;
    let responses;

    if (callId) {
      console.log("🔍 Checking response status for call:", callId);
      response = await ResponseService.getResponseByCallId(callId);

      if (response) {
        return NextResponse.json({
          found: true,
          callId: response.call_id,
          interviewId: response.interview_id,
          email: response.email,
          name: response.name,
          isEnded: response.is_ended,
          isAnalysed: response.is_analysed,
          hasAnalytics: !!response.analytics,
          hasDetails: !!response.details,
          duration: response.duration,
          createdAt: response.createdAt,
          tabSwitchCount: response.tab_switch_count,
        });
      } else {
        return NextResponse.json({
          found: false,
          message: `No response found for call ID: ${callId}`,
        });
      }
    }

    if (interviewId) {
      console.log("🔍 Checking responses for interview:", interviewId);
      responses = await ResponseService.getAllResponses(interviewId);

      return NextResponse.json({
        interviewId: interviewId,
        totalResponses: responses.length,
        responses: responses.map((r) => ({
          callId: r.call_id,
          email: r.email,
          name: r.name,
          isEnded: r.is_ended,
          isAnalysed: r.is_analysed,
          hasAnalytics: !!r.analytics,
          hasDetails: !!r.details,
          duration: r.duration,
          createdAt: r.created_at,
          tabSwitchCount: r.tab_switch_count,
        })),
      });
    }
  } catch (error) {
    console.error("🔍 Debug response status error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
