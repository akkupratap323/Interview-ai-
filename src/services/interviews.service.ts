import { db } from "@/lib/db";

const getAllInterviews = async (userId: string, organizationId: string) => {
  // FORCE CONSOLE LOGS TO APPEAR
  console.log("🚀🚀🚀 InterviewService.getAllInterviews - ENTRY POINT 🚀🚀🚀");
  console.log("🚀 Params - userId:", userId, "organizationId:", organizationId);
  console.log("🚀 Environment check - NODE_ENV:", process.env.NODE_ENV);
  console.log("🚀 Database URL exists:", !!process.env.DATABASE_URL);
  
  // Simple direct database query without fancy connection handling
  try {
    console.log("🔍 DIRECT DATABASE QUERY - Starting...");
    
    const interviews = await db.interview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    console.log("🔍 DIRECT DATABASE QUERY - Result:", interviews.length, "interviews");
    console.log("🔍 DIRECT DATABASE QUERY - Interview names:", interviews.map(i => i.name));
    console.log("🔍 DIRECT DATABASE QUERY - Full data:", JSON.stringify(interviews, null, 2));
    
    if (interviews.length > 0) {
      console.log("✅ SUCCESS - Returning", interviews.length, "interviews");
      return interviews;
    } else {
      console.log("⚠️ WARNING - No interviews found, but query succeeded");
      return [];
    }
    
  } catch (error) {
    console.error("❌❌❌ FATAL DATABASE ERROR ❌❌❌");
    console.error("Error name:", (error as any)?.name);
    console.error("Error message:", (error as any)?.message);
    console.error("Error code:", (error as any)?.code);
    console.error("Error stack:", (error as any)?.stack);
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    // Try a simple count query to test connection
    try {
      console.log("🚨 FALLBACK - Trying simple count query...");
      const count = await db.interview.count();
      console.log("🚨 FALLBACK - Count succeeded:", count);
    } catch (countError) {
      console.error("🚨 FALLBACK - Count failed:", (countError as any)?.message);
    }
    
    return [];
  }
};

const getInterviewById = async (id: string) => {
  console.log("🔍 getInterviewById - Looking for interview with ID/slug:", id);
  
  try {
    const interview = await db.interview.findFirst({
      where: {
        OR: [
          { id },
          { readable_slug: id }
        ]
      }
    });

    if (interview) {
      console.log("✅ getInterviewById - Found interview:", interview.name);
      console.log("✅ getInterviewById - Interview details:", {
        id: interview.id,
        name: interview.name,
        readable_slug: interview.readable_slug,
        is_active: interview.is_active
      });
    } else {
      console.log("⚠️ getInterviewById - No interview found with ID/slug:", id);
    }

    return interview;
  } catch (error) {
    console.error("❌ getInterviewById - Error:", error);
    return null;
  }
};

const updateInterview = async (payload: any, id: string) => {
  try {
    const data = await db.interview.update({
      where: { id },
      data: payload,
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const deleteInterview = async (id: string) => {
  try {
    const data = await db.interview.delete({
      where: { id },
    });
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getAllRespondents = async (interviewId: string) => {
  try {
    const interview = await db.interview.findUnique({
      where: { id: interviewId },
      select: { respondents: true }
    });

    return interview ? [interview] : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const createInterview = async (payload: any) => {
  try {
    console.log("InterviewService.createInterview - payload:", payload);
    const data = await db.interview.create({
      data: payload,
    });
    console.log("InterviewService.createInterview - created interview:", data);
    return data;
  } catch (error) {
    console.error("InterviewService.createInterview - error:", error);
    throw error; // Re-throw the error so the API can handle it properly
  }
};

const deactivateInterviewsByOrgId = async (organizationId: string) => {
  try {
    await db.interview.updateMany({
      where: {
        organization_id: organizationId,
        is_active: true
      },
      data: { is_active: false }
    });
  } catch (error) {
    console.error("Unexpected error disabling interviews:", error);
  }
};

export const InterviewService = {
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getAllRespondents,
  createInterview,
  deactivateInterviewsByOrgId,
};