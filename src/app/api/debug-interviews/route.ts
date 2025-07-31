import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId, orgId } = auth();

    console.log("DEBUG API - userId:", userId, "orgId:", orgId);

    // First test basic database connectivity
    try {
      const testQuery = await db.interview.count();
      console.log("DEBUG API - total interviews in database:", testQuery);
    } catch (dbError) {
      console.error("DEBUG API - database connection error:", dbError);
      return NextResponse.json({
        error: "Database connection failed",
        details: dbError instanceof Error ? dbError.message : String(dbError),
      });
    }

    // Get all interviews in the database
    const allInterviews = await db.interview.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get interviews for this user
    const userInterviews = userId
      ? await db.interview.findMany({
          where: { user_id: userId },
          orderBy: { createdAt: "desc" },
        })
      : [];

    // Get interviews for this organization
    const orgInterviews = orgId
      ? await db.interview.findMany({
          where: { organization_id: orgId },
          orderBy: { createdAt: "desc" },
        })
      : [];

    return NextResponse.json({
      userId,
      orgId,
      allInterviews: allInterviews.length,
      userInterviews: userInterviews.length,
      orgInterviews: orgInterviews.length,
      allInterviewsData: allInterviews.map((i: any) => ({
        id: i.id,
        name: i.name,
        user_id: i.user_id,
        organization_id: i.organization_id,
        created: i.createdAt,
      })),
      userInterviewsData: userInterviews.map((i: any) => ({
        id: i.id,
        name: i.name,
        user_id: i.user_id,
        organization_id: i.organization_id,
        created: i.createdAt,
      })),
      orgInterviewsData: orgInterviews.map((i: any) => ({
        id: i.id,
        name: i.name,
        user_id: i.user_id,
        organization_id: i.organization_id,
        created: i.createdAt,
      })),
    });
  } catch (error) {
    console.error("Debug interviews error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
