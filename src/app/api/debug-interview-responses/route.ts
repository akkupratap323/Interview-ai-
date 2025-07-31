import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const interviewId = searchParams.get("interviewId");

    if (!interviewId) {
      return NextResponse.json(
        {
          error: "Interview ID is required",
        },
        { status: 400 },
      );
    }

    console.log("🔍 Debug - Checking responses for interview:", interviewId);

    // Get ALL responses for this interview directly from the database
    const responses = await db.response.findMany({
      where: {
        interview_id: interviewId,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("🔍 Debug - Found responses:", responses.length);

    const responsesSummary = responses.map((r: any) => ({
      call_id: r.call_id,
      email: r.email,
      name: r.name,
      is_ended: r.is_ended,
      is_analysed: r.is_analysed,
      has_details: !!r.details,
      has_analytics: !!r.analytics,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      duration: r.duration,
      tab_switch_count: r.tab_switch_count,
    }));

    return NextResponse.json({
      interviewId: interviewId,
      totalResponses: responses.length,
      responses: responsesSummary,
      rawCount: responses.length,
    });
  } catch (error) {
    console.error("🔍 Debug - Error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
