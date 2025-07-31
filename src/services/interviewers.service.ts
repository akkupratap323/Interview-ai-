import { db } from "@/lib/db";

const getAllInterviewers = async (clientId: string = "") => {
  try {
    // Fetch global interviewers (those without user_id) and user-specific ones
    const interviewers = await db.interviewer.findMany({
      where: {
        OR: [
          { user_id: null }, // Global interviewers
          { user_id: clientId }, // User-specific interviewers
        ],
      },
    });
    console.log("Fetched interviewers from database:", interviewers.length);
    return interviewers.map((interviewer) => ({
      ...interviewer,
      id: interviewer.id, // Keep as string, don't convert to BigInt
      created_at: interviewer.createdAt,
      user_id: interviewer.user_id || "",
      name: interviewer.name || "",
      image: interviewer.image || "",
      description: interviewer.description || "",
      audio: interviewer.audio || "",
      agent_id: interviewer.agent_id || "",
    }));
  } catch (error) {
    console.log("Error fetching interviewers:", error);
    return [];
  }
};

const createInterviewer = async (payload: any) => {
  try {
    // Check for existing interviewer with the same name and agent_id
    const existingInterviewer = await db.interviewer.findFirst({
      where: {
        name: payload.name,
        agent_id: payload.agent_id,
      },
    });

    if (existingInterviewer) {
      console.error("An interviewer with this name already exists");
      return null;
    }

    const data = await db.interviewer.create({
      data: payload,
    });

    return data;
  } catch (error) {
    console.error("Error creating interviewer:", error);
    return null;
  }
};

const getInterviewer = async (interviewerId: string) => {
  try {
    const interviewer = await db.interviewer.findUnique({
      where: { id: interviewerId },
    });

    if (!interviewer) return null;

    return {
      ...interviewer,
      id: interviewer.id, // Keep as string, don't convert to BigInt
      created_at: interviewer.createdAt,
      user_id: interviewer.user_id || "",
      name: interviewer.name || "",
      image: interviewer.image || "",
      description: interviewer.description || "",
      audio: interviewer.audio || "",
      agent_id: interviewer.agent_id || "",
    };
  } catch (error) {
    console.error("Error fetching interviewer:", error);
    return null;
  }
};

export const InterviewerService = {
  getAllInterviewers,
  createInterviewer,
  getInterviewer,
};
