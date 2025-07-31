/* eslint-disable newline-before-return */
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { InterviewService } from "@/services/interviews.service";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

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

    // ✅ Validate and set organization_id (allow null for personal users)
    const organizationId = orgId || payload.organization_id || null;
    
    console.log("Organization ID:", organizationId, "Clerk orgId:", orgId, "Payload orgId:", payload.organization_id);

    // ✅ Ensure user and organization exist in database using transaction
    try {
      await db.$transaction(async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => {
        // First, check if organization exists and create if not (MUST be done before creating user)
        if (organizationId) {
          const existingOrg = await tx.organization.findUnique({
            where: { id: organizationId }
          });

          if (!existingOrg) {
            console.log("Creating organization:", organizationId);
            await tx.organization.create({
              data: {
                id: organizationId,
                plan: "free",
                allowed_responses_count: 10,
              }
            });
            console.log("Organization created successfully:", organizationId);
          } else {
            console.log("Organization already exists:", organizationId);
          }
        }

        // Then, check if user exists, create if not
        const existingUser = await tx.user.findUnique({
          where: { id: userId }
        });

        if (!existingUser) {
          console.log("Creating user:", userId);
          const newUser = await tx.user.create({
            data: {
              id: userId, // This is the Clerk user ID
              user_id: userId, // This can also be the Clerk user ID for reference
              organization_id: organizationId,
            }
          });
          console.log("User created successfully:", newUser.id);
        } else {
          console.log("User already exists:", existingUser.id);
        }
      });
    } catch (ensureError) {
      console.error("Error ensuring user/org exists:", ensureError);
      return NextResponse.json(
        { 
          error: "Failed to prepare user data",
          details: ensureError instanceof Error ? ensureError.message : String(ensureError)
        },
        { status: 500 }
      );
    }

    // ✅ Validate required fields
    if (!payload.name || payload.name.trim() === '') {
      return NextResponse.json(
        { error: "Interview name is required." },
        { status: 400 }
      );
    }

    if (!payload.interviewer_id || payload.interviewer_id.trim() === '') {
      return NextResponse.json(
        { error: "Interviewer selection is required." },
        { status: 400 }
      );
    }

    if (!payload.objective || payload.objective.trim() === '') {
      return NextResponse.json(
        { error: "Interview objective is required." },
        { status: 400 }
      );
    }

    // ✅ Generate URL and slug
    const url_id = nanoid();
    const url = `${base_url}/call/${url_id}`;
    
    let readableSlug = null;
    if (body.organizationName) {
      const interviewNameSlug = payload.name?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .trim();
      const orgNameSlug = body.organizationName
        ?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .trim();
      
      // Generate base slug
      let baseSlug = `${orgNameSlug}-${interviewNameSlug}`;
      readableSlug = baseSlug;
      
      // Check if slug already exists and make it unique if needed
      let counter = 1;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        const existingInterview = await db.interview.findUnique({
          where: { readable_slug: readableSlug }
        });
        
        if (!existingInterview) {
          break; // Slug is unique, we can use it
        }
        
        // Slug exists, try with counter
        counter++;
        readableSlug = `${baseSlug}-${counter}`;
        attempts++;
      }
      
      // If we couldn't find a unique slug after max attempts, use nanoid as fallback
      if (attempts >= maxAttempts) {
        readableSlug = `${baseSlug}-${url_id.substring(0, 8)}`;
        console.log("Using nanoid fallback for slug:", readableSlug);
      }
      
      console.log("Generated readable slug:", readableSlug);
    }

    // ✅ Create interview with proper IDs and defaults
    const interviewData = {
      ...payload,
      id: url_id,
      url: url,
      readable_slug: readableSlug,
      organization_id: organizationId, // ✅ Ensure this is set
      user_id: userId, // ✅ Ensure this is set
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      response_count: payload.response_count || 0,
      question_count: payload.question_count || 0,
      is_anonymous: payload.is_anonymous !== undefined ? payload.is_anonymous : false,
      theme_color: payload.theme_color || "",
      insights: payload.insights || [],
      quotes: payload.quotes || [],
      details: payload.details || {},
      respondents: payload.respondents || [],
    };

    // ✅ Debug logging
    console.log("Creating interview with data:", {
      id: interviewData.id,
      name: interviewData.name,
      organization_id: interviewData.organization_id,
      user_id: interviewData.user_id,
    });

    // Verify user exists before creating interview
    const userExists = await db.user.findUnique({
      where: { id: interviewData.user_id }
    });
    console.log("User exists check:", userExists ? "YES" : "NO", "for ID:", interviewData.user_id);

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
          { 
            error: "Organization not found in database", 
            details: "The organization may need to be created first. Please try signing out and back in.",
          },
          { status: 400 }
        );
      }
      if (err.message.includes('user_id')) {
        return NextResponse.json(
          { 
            error: "User not found in database", 
            details: "The user may need to be created first. Please try signing out and back in.",
          },
          { status: 401 }
        );
      }
    }

    if (err.code === '23505') {
      // Unique constraint violation
      if (err.message.includes('readable_slug')) {
        return NextResponse.json(
          { 
            error: "Interview slug conflict", 
            details: "An interview with a similar name already exists. Please try a different name or try again."
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Interview with this ID already exists. Please try again." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: "Failed to create interview",
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}
