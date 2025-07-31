import { NextRequest, NextResponse } from "next/server";
import { InterviewService } from "@/services/interviews.service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: "ID parameter required" }, { status: 400 });
  }
  
  console.log("🧪 TEST BY ID API - Testing getInterviewById with:", id);
  
  try {
    const result = await InterviewService.getInterviewById(id);
    
    return NextResponse.json({
      success: !!result,
      id: id,
      found: !!result,
      interview: result || null // Return the full interview object
    });
  } catch (error) {
    console.error("🧪 TEST BY ID API - Error:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error"
    }, { status: 500 });
  }
}