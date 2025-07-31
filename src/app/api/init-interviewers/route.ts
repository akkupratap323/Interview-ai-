import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse, NextRequest } from "next/server";
import { INTERVIEWERS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // Check if default interviewers already exist
    const existingInterviewers = await InterviewerService.getAllInterviewers();
    
    if (existingInterviewers.length > 0) {
      return NextResponse.json(
        { 
          message: "Default interviewers already exist",
          count: existingInterviewers.length 
        },
        { status: 200 }
      );
    }

    // Create default interviewers without Retell integration for now
    const lisaInterviewer = await InterviewerService.createInterviewer({
      agent_id: "temp_lisa_agent_id", // Temporary agent ID
      user_id: null, // Global interviewer
      ...INTERVIEWERS.LISA,
    });

    const bobInterviewer = await InterviewerService.createInterviewer({
      agent_id: "temp_bob_agent_id", // Temporary agent ID
      user_id: null, // Global interviewer
      ...INTERVIEWERS.BOB,
    });

    return NextResponse.json(
      {
        message: "Default interviewers created successfully",
        interviewers: [lisaInterviewer, bobInterviewer]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error initializing default interviewers:", error);
    return NextResponse.json(
      { error: "Failed to initialize default interviewers" },
      { status: 500 }
    );
  }
}