import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { InterviewService } from "@/services/interviews.service";
import { logger } from "@/lib/logger";

export const maxDuration = 60;

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export async function POST(req: Request, res: Response) {
  logger.info("create-interview request received");
  
  try {
    // ✅ Get authenticated user and organization
    const { userId, orgId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const payload = body.interviewData;

    // ✅ Validate and set organization_id
    const organizationId = orgId || payload.organization_id;
    
    if (!organizationId || organizationId.trim() === '') {
      logger.error("Organization ID is missing");
      return NextResponse.json(
        { error: "Organization ID is required. Please select an organization." },
        { status: 400 }
      );
    }

    // ✅ Validate required fields
    if (!payload.name || payload.name.trim() === '') {
      return NextResponse.json(
        { error: "Interview name is required." },
        { status: 400 }
      );
    }

    // ✅ Generate URL and slug
    const url_id = nanoid();
    const url = `${base_url}/call/${url_id}`;
    
    let readableSlug = null;
    if (body.organizationName) {
      const interviewNameSlug = payload.name?.toLowerCase().replace(/\s/g, "-");
      const orgNameSlug = body.organizationName
        ?.toLowerCase()
        .replace(/\s/g, "-");
      readableSlug = `${orgNameSlug}-${interviewNameSlug}`;
    }

    // ✅ Create interview with proper IDs
    const interviewData = {
      ...payload,
      id: url_id,
      url: url,
      readable_slug: readableSlug,
      organization_id: organizationId, // ✅ Ensure this is set
      user_id: userId, // ✅ Ensure this is set
    };

    // ✅ Debug logging
    console.log("Creating interview with data:", {
      id: interviewData.id,
      name: interviewData.name,
      organization_id: interviewData.organization_id,
      user_id: interviewData.user_id,
    });

    const newInterview = await InterviewService.createInterview(interviewData);

    logger.info("Interview created successfully");

    return NextResponse.json(
      { 
        response: "Interview created successfully",
        interview: newInterview,
        url: url
      },
      { status: 201 }, // ✅ Use 201 for creation
    );

  } catch (err: any) {
    console.error("Create interview error:", err); // ✅ Detailed error logging
    logger.error("Error creating interview", err);

    // ✅ Handle specific database errors
    if (err.code === '23503') {
      // Foreign key violation
      if (err.message.includes('organization_id')) {
        return NextResponse.json(
          { error: "Invalid organization. Please select a valid organization." },
          { status: 400 }
        );
      }
      if (err.message.includes('user_id')) {
        return NextResponse.json(
          { error: "Invalid user. Please sign in again." },
          { status: 401 }
        );
      }
    }

    if (err.code === '23505') {
      // Unique constraint violation
      return NextResponse.json(
        { error: "Interview with this ID already exists. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create interview",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}
