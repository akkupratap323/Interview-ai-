import { NextRequest, NextResponse } from "next/server";
import { Retell } from "retell-sdk";
import { generateInterviewAnalytics } from "@/services/analytics.service";
import { ResponseService } from "@/services/responses.service";
import { logger } from "@/lib/logger";

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-retell-signature") as string;

    // Verify the webhook signature
    if (!Retell.verify(body, process.env.RETELL_API_KEY || "", signature)) {
      console.error("❌ Webhook - Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const { event, call } = JSON.parse(body) as { event: string; call: any };
    logger.info(
      `🔔 Webhook - Received ${event} event for call ${call.call_id}`,
    );

    switch (event) {
      case "call_started":
        console.log("📞 Webhook - Call started:", call.call_id);
        break;

      case "call_ended":
        console.log("📞 Webhook - Call ended:", call.call_id);
        // Update the response to mark it as ended
        await ResponseService.saveResponse({ is_ended: true }, call.call_id);
        break;

      case "call_analyzed":
        console.log("🧠 Webhook - Call analyzed:", call.call_id);
        await processCallAnalysis(call.call_id);
        break;

      default:
        console.log("🔔 Webhook - Unknown event:", event);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook - Error processing:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function processCallAnalysis(callId: string) {
  try {
    console.log("🧠 Processing call analysis for:", callId);

    // Get the response record
    const callDetails = await ResponseService.getResponseByCallId(callId);
    if (!callDetails) {
      console.error("❌ Call details not found for:", callId);
      return;
    }

    // Skip if already analyzed
    if (callDetails.is_analysed) {
      console.log("✅ Call already analyzed:", callId);
      return;
    }

    // Get call data from Retell
    const callOutput = await retell.call.retrieve(callId);
    const interviewId = callDetails?.interview_id;

    if (!callOutput || !interviewId) {
      console.error("❌ Missing call output or interview ID for:", callId);
      return;
    }

    const callData = callOutput as any;
    const duration = Math.round(
      (callData?.end_timestamp || 0) / 1000 -
        (callData?.start_timestamp || 0) / 1000,
    );

    // Generate analytics
    const payload = {
      callId: callId,
      interviewId: interviewId,
      transcript: callData?.transcript || "",
    };

    console.log("🧠 Generating analytics for:", callId);
    const result = await generateInterviewAnalytics(payload);
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

    console.log("✅ Call analysis completed for:", callId);
  } catch (error) {
    console.error("❌ Error processing call analysis:", error);
  }
}
