import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Allow unauthenticated access to fetch global interviewers for now
    console.log("Fetching interviewers for userId:", userId || "anonymous");

    const interviewers = await InterviewerService.getAllInterviewers(userId || "");
    
    console.log("Found interviewers:", interviewers.length);
    
    return NextResponse.json({ interviewers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching interviewers:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviewers" },
      { status: 500 }
    );
  }
}