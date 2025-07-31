import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    console.log("👤 Debug - Checking users in database");

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        user_id: true,
        organization_id: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10, // Show last 10 users
    });

    console.log("👤 Debug - Found users:", users.length);

    return NextResponse.json({
      totalUsers: users.length,
      users: users,
      message: "Recent users in database",
    });
  } catch (error) {
    console.error("👤 Debug - Error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
