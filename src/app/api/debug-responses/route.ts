import { NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        { error: "interviewId parameter required" },
        { status: 400 },
      );
    }

    console.log(
      "🔍 DEBUG RESPONSES - Getting responses for interview:",
      interviewId,
    );

    const responses = await ResponseService.getAllResponses(interviewId);

    console.log("🔍 DEBUG RESPONSES - Found responses:", responses.length);

    const responseData = responses.map((response: any) => ({
      id: response.id,
      call_id: response.call_id,
      name: response.name,
      email: response.email,
      is_analysed: response.is_analysed,
      has_analytics: !!response.analytics,
      analytics_preview: response.analytics
        ? {
            overallScore: (response.analytics as any)?.overallScore,
            communication: (response.analytics as any)?.communication?.score,
          }
        : null,
      created_at: response.created_at,
    }));

    return NextResponse.json({
      success: true,
      interview_id: interviewId,
      total_responses: responses.length,
      responses: responseData,
    });
  } catch (error) {
    console.error("🔍 DEBUG RESPONSES - Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as any)?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
