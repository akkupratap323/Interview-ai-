import { logger } from "@/lib/logger";
import { generateInterviewAnalytics } from "@/services/analytics.service";
import { ResponseService } from "@/services/responses.service";
import { Response } from "@/types/response";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: Request, res: Response) {
  logger.info("get-call request received");

  try {
    const body = await req.json();

    if (!body.id) {
      logger.error("get-call - No call ID provided");
      return NextResponse.json(
        { error: "Call ID is required" },
        { status: 400 },
      );
    }

    const callDetails = await ResponseService.getResponseByCallId(body.id);

    if (!callDetails) {
      logger.error("get-call - Call not found:", body.id);
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    let callResponse = callDetails.details;
    if (callDetails.is_analysed) {
      logger.info("get-call - Call already analyzed:", body.id);
      return NextResponse.json(
        {
          callResponse,
          analytics: callDetails.analytics,
        },
        { status: 200 },
      );
    }

    // Get call data from Retell
    const callOutput = await retell.call.retrieve(body.id);
    const interviewId = callDetails?.interview_id;

    if (!callOutput) {
      logger.error("get-call - Failed to retrieve call from Retell:", body.id);
      return NextResponse.json(
        { error: "Failed to retrieve call data" },
        { status: 500 },
      );
    }

    if (!interviewId) {
      logger.error("get-call - No interview ID found for call:", body.id);
      return NextResponse.json(
        { error: "Interview ID not found" },
        { status: 400 },
      );
    }

    callResponse = callOutput as any;
    const callData = callResponse as any;
    const duration = Math.round(
      (callData?.end_timestamp || 0) / 1000 -
        (callData?.start_timestamp || 0) / 1000,
    );

    const payload = {
      callId: body.id,
      interviewId: interviewId,
      transcript: callData?.transcript || "",
    };

    logger.info("get-call - Generating analytics for:", body.id);
    const result = await generateInterviewAnalytics(payload);

    if (result.error) {
      logger.error("get-call - Analytics generation failed:", result.error);
      return NextResponse.json(
        {
          error: "Analytics generation failed",
          details: result.error,
        },
        { status: result.status || 500 },
      );
    }

    const analytics = result.analytics;

    await ResponseService.saveResponse(
      {
        details: callResponse,
        is_analysed: true,
        duration: duration,
        analytics: analytics,
      },
      body.id,
    );

    logger.info("get-call - Call analysed successfully:", body.id);

    return NextResponse.json(
      {
        callResponse,
        analytics,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("get-call - Error processing request:", error as any);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 },
    );
  }
}
