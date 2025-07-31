import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callId = searchParams.get("callId");

    if (!callId) {
      return NextResponse.json(
        {
          error: "Call ID is required",
        },
        { status: 400 },
      );
    }

    console.log("🔍 Debug - Checking call_id in database:", callId);

    // Direct database query to check if response exists
    const response = await db.response.findUnique({
      where: {
        call_id: callId,
      },
    });

    console.log(
      "🔍 Debug - Direct query result:",
      response ? "FOUND" : "NOT FOUND",
    );

    if (response) {
      console.log("🔍 Debug - Response details:", {
        id: response.id,
        call_id: response.call_id,
        interview_id: response.interview_id,
        email: response.email,
        name: response.name,
        is_ended: response.is_ended,
        is_analysed: response.is_analysed,
        created_at: response.createdAt,
        updated_at: response.updatedAt,
      });
    }

    // Also check if there are any responses with similar call_ids (in case of typos)
    const similarResponses = await db.response.findMany({
      where: {
        call_id: {
          contains: callId.substring(0, 10), // Check first 10 characters
        },
      },
      select: {
        call_id: true,
        id: true,
        interview_id: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      callId: callId,
      exists: !!response,
      response: response
        ? {
            id: response.id,
            call_id: response.call_id,
            interview_id: response.interview_id,
            email: response.email,
            name: response.name,
            is_ended: response.is_ended,
            is_analysed: response.is_analysed,
            created_at: response.createdAt,
          }
        : null,
      similarResponses: similarResponses,
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
