import { db } from "@/lib/db";
import { FeedbackData } from "@/types/response";

const submitFeedback = async (feedbackData: FeedbackData) => {
  try {
    console.log("🎯 FeedbackService.submitFeedback - Creating feedback with data:", feedbackData);
    
    const data = await db.feedback.create({
      data: feedbackData,
    });
    
    console.log("🎯 FeedbackService.submitFeedback - Success! Created feedback with ID:", data.id);
    return data;
  } catch (error) {
    console.error("🎯 FeedbackService.submitFeedback - Error:", error);
    console.error("🎯 FeedbackService.submitFeedback - Error message:", (error as any)?.message);
    console.error("🎯 FeedbackService.submitFeedback - Error code:", (error as any)?.code);
    throw error;
  }
};

export const FeedbackService = {
  submitFeedback,
};
