import { db } from "@/lib/db";

const ensureUserExists = async (email: string) => {
  if (!email) return null;

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.log("👤 User already exists with email:", email);
      return email;
    }

    // Create a new user if doesn't exist
    console.log("👤 Creating new user with email:", email);
    const newUser = await db.user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
      },
    });

    console.log("👤 Created new user with ID:", newUser.id);
    return email;
  } catch (error) {
    console.error("👤 Error ensuring user exists:", error);
    return null; // Return null to create response without user reference
  }
};

const createResponse = async (payload: any) => {
  console.log("📝 ResponseService.createResponse - ENTRY POINT");
  console.log("📝 ResponseService.createResponse - payload:", payload);

  try {
    // Handle email constraint by ensuring user exists
    let validEmail = null;
    if (payload.email) {
      validEmail = await ensureUserExists(payload.email);
      console.log("📝 Valid email for foreign key:", validEmail);
    }

    const responseData = {
      ...payload,
      email: validEmail, // Use null if user creation failed
    };

    console.log(
      "📝 ResponseService.createResponse - Creating response in database...",
    );
    console.log("📝 Final response data:", responseData);

    const data = await db.response.create({
      data: responseData,
      select: { id: true },
    });
    console.log(
      "✅ ResponseService.createResponse - Success! Created response with ID:",
      data.id,
    );
    return data.id;
  } catch (error) {
    console.error("❌ ResponseService.createResponse - ERROR:", error);
    console.error(
      "❌ ResponseService.createResponse - Error message:",
      (error as any)?.message,
    );
    console.error(
      "❌ ResponseService.createResponse - Error code:",
      (error as any)?.code,
    );
    return null;
  }
};

const saveResponse = async (payload: any, call_id: string) => {
  try {
    const data = await db.response.update({
      where: { call_id },
      data: payload,
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getAllResponses = async (interviewId: string) => {
  try {
    console.log(
      "📊 ResponseService.getAllResponses - Fetching for interview:",
      interviewId,
    );

    // First, get all responses for debugging
    const allResponses = await db.response.findMany({
      where: {
        interview_id: interviewId,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      "📊 ResponseService.getAllResponses - Found total responses:",
      allResponses.length,
    );
    allResponses.forEach((r, index) => {
      console.log(`📊 Response ${index + 1}:`, {
        call_id: r.call_id,
        email: r.email,
        name: r.name,
        is_ended: r.is_ended,
        is_analysed: r.is_analysed,
        has_details: !!r.details,
        has_analytics: !!r.analytics,
        created_at: r.createdAt,
      });
    });

    // Apply filters gradually for better debugging
    const endedResponses = allResponses.filter((r) => r.is_ended === true);
    console.log(
      "📊 ResponseService.getAllResponses - Ended responses:",
      endedResponses.length,
    );

    const responsesWithDetails = endedResponses.filter(
      (r) => r.details !== null && r.details !== undefined,
    );
    console.log(
      "📊 ResponseService.getAllResponses - With details:",
      responsesWithDetails.length,
    );

    // For debugging: Show ALL responses for this interview to see what's in the database
    console.log(
      "📊 ResponseService.getAllResponses - Showing ALL responses for debugging",
    );

    // Temporarily return ALL responses to debug what's happening
    const finalResponses = allResponses;

    console.log(
      "📊 ResponseService.getAllResponses - Final responses (all for debugging):",
      finalResponses.length,
    );

    return finalResponses.map((response) => ({
      ...response,
      id: response.id, // Keep as string - it's a cuid(), not a BigInt
      created_at: response.createdAt,
      duration: response.duration || 0,
      email: response.email || "",
      candidate_status: response.candidate_status || "",
    }));
  } catch (error) {
    console.error("📊 ResponseService.getAllResponses - Error:", error);
    return [];
  }
};

const getResponseCountByOrganizationId = async (
  organizationId: string,
): Promise<number> => {
  try {
    const count = await db.response.count({
      where: {
        interview: {
          organization_id: organizationId,
        },
      },
    });

    return count;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const getAllEmailAddressesForInterview = async (interviewId: string) => {
  try {
    const responses = await db.response.findMany({
      where: { interview_id: interviewId },
      select: { email: true },
    });

    return responses;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getResponseByCallId = async (id: string) => {
  try {
    console.log(
      "🔍 ResponseService.getResponseByCallId - Looking for call_id:",
      id,
    );

    const response = await db.response.findUnique({
      where: { call_id: id },
    });

    console.log(
      "🔍 ResponseService.getResponseByCallId - Query result:",
      response ? "FOUND" : "NULL",
    );

    if (response) {
      console.log(
        "🔍 ResponseService.getResponseByCallId - Found response with ID:",
        response.id,
      );
      console.log(
        "🔍 ResponseService.getResponseByCallId - Response details:",
        {
          call_id: response.call_id,
          interview_id: response.interview_id,
          email: response.email,
          name: response.name,
          is_ended: response.is_ended,
          is_analysed: response.is_analysed,
        },
      );
    }

    if (!response) return null;

    return {
      ...response,
      id: response.id, // Keep as string - it's a cuid(), not a BigInt
      created_at: response.createdAt,
      duration: response.duration || 0,
      email: response.email || "",
      candidate_status: response.candidate_status || "",
    };
  } catch (error) {
    console.error("🔍 ResponseService.getResponseByCallId - ERROR:", error);
    console.error(
      "🔍 ResponseService.getResponseByCallId - Error message:",
      (error as any)?.message,
    );
    return null;
  }
};

const deleteResponse = async (id: string) => {
  try {
    const data = await db.response.delete({
      where: { call_id: id },
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const updateResponse = async (payload: any, call_id: string) => {
  try {
    const data = await db.response.update({
      where: { call_id },
      data: payload,
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const ResponseService = {
  createResponse,
  saveResponse,
  updateResponse,
  getAllResponses,
  getResponseByCallId,
  deleteResponse,
  getResponseCountByOrganizationId,
  getAllEmails: getAllEmailAddressesForInterview,
};
