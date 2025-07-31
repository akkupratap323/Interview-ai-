import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 TEST CREATE RESPONSE - Starting...");
    
    const testPayload = {
      call_id: "test-call-" + Date.now(),
      interview_id: "-XuHR_yj5nA0K496qdWcm", // Use existing interview ID
      name: "Test User"
      // Removed email to avoid foreign key constraint
    };
    
    console.log("🧪 TEST CREATE RESPONSE - Payload:", testPayload);
    
    const result = await ResponseService.createResponse(testPayload);
    
    console.log("🧪 TEST CREATE RESPONSE - Result:", result);
    
    return NextResponse.json({
      success: !!result,
      result: result,
      payload: testPayload
    });
  } catch (error) {
    console.error("🧪 TEST CREATE RESPONSE - Error:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error",
      stack: error?.stack
    }, { status: 500 });
  }
}