import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

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

    console.log("📊 API - Getting responses for interview:", interviewId);

    const responses = await ResponseService.getAllResponses(interviewId);

    console.log("📊 API - Found responses:", responses?.length || 0);

    return NextResponse.json({
      success: true,
      responses: responses || [],
      count: responses?.length || 0,
    });
  } catch (error) {
    console.error("📊 API - Error getting responses:", error);
    return NextResponse.json(
      {
        error: "Failed to get responses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
