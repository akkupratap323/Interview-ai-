import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("👤 Creating test user with email:", email);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "User already exists",
        user: {
          id: existingUser.id,
          email: existingUser.email,
          existed: true
        }
      });
    }

    // Create new user
    const newUser = await db.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
      }
    });

    console.log("👤 Created test user:", newUser.id);

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        existed: false
      }
    });

  } catch (error) {
    console.error("👤 Error creating test user:", error);
    return NextResponse.json({
      error: "Failed to create test user",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}