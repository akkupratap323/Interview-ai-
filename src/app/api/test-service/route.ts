import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  console.log("🧪 TEST API - Starting database test");

  try {
    // Test 1: Basic database connection
    console.log("🧪 TEST API - Step 1: Testing basic connection");
    const connectionTest = await db.$queryRaw`SELECT 1 as test`;
    console.log("🧪 TEST API - Connection successful:", connectionTest);

    // Test 2: Count interviews
    console.log("🧪 TEST API - Step 2: Counting interviews");
    const count = await db.interview.count();
    console.log("🧪 TEST API - Total interviews:", count);

    // Test 3: Fetch interviews
    console.log("🧪 TEST API - Step 3: Fetching interviews");
    const interviews = await db.interview.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        user_id: true,
        organization_id: true,
        createdAt: true,
      },
    });
    console.log("🧪 TEST API - Fetched interviews:", interviews.length);

    // Test 4: Try the service
    console.log("🧪 TEST API - Step 4: Testing service");
    try {
      const { InterviewService } = await import(
        "@/services/interviews.service"
      );
      const serviceResult = await InterviewService.getAllInterviews(
        "test-user",
        "test-org",
      );
      console.log("🧪 TEST API - Service result:", serviceResult?.length || 0);

      return NextResponse.json({
        success: true,
        tests: {
          connection: !!connectionTest,
          count: count,
          directFetch: interviews.length,
          serviceResult: serviceResult?.length || 0,
        },
        interviews: interviews,
      });
    } catch (serviceError) {
      console.error("🧪 TEST API - Service error:", serviceError);
      return NextResponse.json({
        success: false,
        tests: {
          connection: !!connectionTest,
          count: count,
          directFetch: interviews.length,
          serviceError: (serviceError as any)?.message,
        },
        interviews: interviews,
      });
    }
  } catch (error) {
    console.error("🧪 TEST API - Fatal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as any)?.message || "Unknown error",
        stack: (error as any)?.stack,
      },
      { status: 500 },
    );
  }
}
