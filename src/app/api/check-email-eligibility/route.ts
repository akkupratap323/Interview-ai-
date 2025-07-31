import { NextRequest, NextResponse } from "next/server";
import { ResponseService } from "@/services/responses.service";

export async function POST(req: NextRequest) {
  try {
    const { interviewId, email } = await req.json();

    if (!interviewId || !email) {
      return NextResponse.json(
        { error: "Interview ID and email are required" },
        { status: 400 }
      );
    }

    console.log("🔍 Checking email eligibility for:", email, "in interview:", interviewId);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interviewId)
    ).map((item: any) => item.email || '').filter(email => email !== '');

    console.log("🔍 Found existing emails:", oldUserEmails.length);

    const isOldUser = oldUserEmails.includes(email);

    return NextResponse.json({
      isOldUser,
      existingEmailCount: oldUserEmails.length,
    });

  } catch (error) {
    console.error("🔍 Error checking email eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check email eligibility" },
      { status: 500 }
    );
  }
}