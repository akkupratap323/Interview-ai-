"use client";

import React, { useState, useContext, ReactNode, useEffect, useRef } from "react";
import { Interview } from "@/types/interview";
import { InterviewService } from "@/services/interviews.service";
import { useClerk, useOrganization } from "@clerk/nextjs";

interface InterviewContextProps {
  interviews: Interview[];
  setInterviews: React.Dispatch<React.SetStateAction<Interview[]>>;
  getInterviewById: (interviewId: string) => Interview | null | any;
  interviewsLoading: boolean;
  setInterviewsLoading: (interviewsLoading: boolean) => void;
  fetchInterviews: () => void;
}

export const InterviewContext = React.createContext<InterviewContextProps>({
  interviews: [],
  setInterviews: () => {},
  getInterviewById: () => null,
  setInterviewsLoading: () => undefined,
  interviewsLoading: false,
  fetchInterviews: () => {},
});

interface InterviewProviderProps {
  children: ReactNode;
}

export function InterviewProvider({ children }: InterviewProviderProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const { user } = useClerk();
  const { organization } = useOrganization();
  const [interviewsLoading, setInterviewsLoading] = useState(false);
  const [hasTriggeredFetch, setHasTriggeredFetch] = useState(false);
  const initializeRef = useRef(false);
  
  console.log("🏗️ InterviewProvider - INITIALIZED");
  console.log("🏗️ InterviewProvider - interviews state:", interviews.length);
  console.log("🏗️ InterviewProvider - hasTriggeredFetch:", hasTriggeredFetch);
  console.log("🏗️ InterviewProvider - user status:", {
    exists: !!user,
    id: user?.id,
    loaded: user !== undefined
  });
  console.log("🏗️ InterviewProvider - organization status:", {
    exists: !!organization,
    id: organization?.id,
    loaded: organization !== undefined
  });

  const fetchInterviews = async () => {
    console.log("🎯 FETCHINTERVIEWS - ENTRY POINT");
    setInterviewsLoading(true);
    
    try {
      console.log("🎯 FETCHINTERVIEWS - Method 1: Trying service...");
      
      const userId = user?.id || "bypass-user";
      const orgId = organization?.id || "bypass-org";
      
      console.log("🎯 FETCHINTERVIEWS - Calling InterviewService.getAllInterviews");
      const response = await InterviewService.getAllInterviews(userId, orgId);
      
      console.log("🎯 FETCHINTERVIEWS - Service returned:", response);
      console.log("🎯 FETCHINTERVIEWS - Response length:", response?.length);
      
      if (response && Array.isArray(response) && response.length > 0) {
        console.log("🎯 FETCHINTERVIEWS - Service worked! Processing interviews...");
        
        const mappedInterviews = response.map((interview, index) => ({
          id: interview.id,
          name: interview.name || `Interview ${index + 1}`,
          user_id: interview.user_id || "",
          organization_id: interview.organization_id || "",
          interviewer_id: interview.interviewer_id || "",
          objective: interview.objective || "",
          description: interview.description || "",
          url: interview.url || "",
          readable_slug: interview.readable_slug || "",
          time_duration: interview.time_duration || "10",
          question_count: interview.question_count || 0,
          response_count: interview.response_count || 0,
          is_anonymous: interview.is_anonymous ?? false,
          is_active: interview.is_active ?? true,
          questions: interview.questions || [],
          insights: interview.insights || [],
          quotes: interview.quotes || [],
          details: interview.details || {},
          respondents: interview.respondents || [],
          theme_color: interview.theme_color || "",
          logo_url: interview.logo_url || "",
          created_at: interview.createdAt || new Date(),
          updated_at: interview.updatedAt || new Date(),
        }));
        
        console.log("🎯 FETCHINTERVIEWS - SUCCESS! Setting", mappedInterviews.length, "interviews");
        setInterviews(mappedInterviews);
        return;
      }
      
      console.log("🎯 FETCHINTERVIEWS - Method 2: Service failed, trying direct API...");
      
      // Fallback: Try direct API call
      const apiResponse = await fetch('/api/test-service');
      const apiData = await apiResponse.json();
      
      console.log("🎯 FETCHINTERVIEWS - API response:", apiData);
      
      if (apiData.success && apiData.interviews && apiData.interviews.length > 0) {
        console.log("🎯 FETCHINTERVIEWS - API worked! Using API data...");
        
        const mappedFromAPI = apiData.interviews.map((interview, index) => ({
          id: interview.id,
          name: interview.name || `Interview ${index + 1}`,
          user_id: interview.user_id || "",
          organization_id: interview.organization_id || "",
          interviewer_id: "default",
          objective: "",
          description: "",
          url: "",
          readable_slug: "",
          time_duration: "10",
          question_count: 5,
          response_count: 0,
          is_anonymous: false,
          is_active: true,
          questions: [],
          insights: [],
          quotes: [],
          details: {},
          respondents: [],
          theme_color: "",
          logo_url: "",
          created_at: new Date(interview.createdAt),
          updated_at: new Date(interview.createdAt),
        }));
        
        console.log("🎯 FETCHINTERVIEWS - SUCCESS via API! Setting", mappedFromAPI.length, "interviews");
        setInterviews(mappedFromAPI);
        return;
      }
      
      console.log("🎯 FETCHINTERVIEWS - Both methods failed, no interviews found");
      setInterviews([]);
      
    } catch (error) {
      console.error("🎯 FETCHINTERVIEWS - FATAL ERROR:", error);
      console.error("🎯 FETCHINTERVIEWS - Error details:", error?.message);
      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
      console.log("🎯 FETCHINTERVIEWS - Loading set to false");
    }
  };

  // INITIALIZE FETCH ONCE
  if (!initializeRef.current) {
    console.log("🚨 InterviewProvider - FIRST TIME INITIALIZATION");
    initializeRef.current = true;
    // Use setTimeout to avoid calling during render
    setTimeout(() => {
      console.log("🚨 InterviewProvider - TRIGGERING DELAYED INITIALIZATION FETCH");
      fetchInterviews();
    }, 0);
  }

  const getInterviewById = async (interviewId: string) => {
    console.log("🔍 Context.getInterviewById - Looking for interview:", interviewId);
    console.log("🔍 Context.getInterviewById - Available interviews in context:", interviews.length);
    console.log("🔍 Context.getInterviewById - Available interview IDs:", interviews.map(i => i.id));
    console.log("🔍 Context.getInterviewById - Available interview slugs:", interviews.map(i => i.readable_slug));
    
    try {
      const response = await InterviewService.getInterviewById(interviewId);
      
      if (response) {
        console.log("✅ Context.getInterviewById - Service found interview:", response.name);
      } else {
        console.log("❌ Context.getInterviewById - Service returned null");
        
        // Fallback: Try to find in context interviews
        const contextInterview = interviews.find(i => 
          i.id === interviewId || i.readable_slug === interviewId
        );
        
        if (contextInterview) {
          console.log("✅ Context.getInterviewById - Found in context interviews:", contextInterview.name);
          return contextInterview;
        } else {
          console.log("❌ Context.getInterviewById - Not found in context either");
        }
      }
      
      return response;
    } catch (error) {
      console.error("❌ Context.getInterviewById - Error:", error);
      return null;
    }
  };

  // BACKUP useEffect TRIGGERS
  useEffect(() => {
    console.log("⚡ InterviewProvider - MOUNT useEffect TRIGGERED");
    const timer = setTimeout(() => {
      console.log("⚡ InterviewProvider - BACKUP FETCH TRIGGER (1s delay)");
      fetchInterviews();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // FORCE TRIGGER IF NO INTERVIEWS AFTER 3 SECONDS
  useEffect(() => {
    const timer = setTimeout(() => {
      if (interviews.length === 0 && !interviewsLoading) {
        console.log("🔥 InterviewProvider - EMERGENCY FETCH - no interviews after 3s");
        fetchInterviews();
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  console.log("🏗️ InterviewProvider - RENDERING with interviews:", interviews.length);
  
  return (
    <InterviewContext.Provider
      value={{
        interviews,
        setInterviews,
        getInterviewById,
        interviewsLoading,
        setInterviewsLoading,
        fetchInterviews,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
}

export const useInterviews = () => {
  const value = useContext(InterviewContext);
  console.log("🔗 useInterviews - hook called, returning:", value.interviews.length, "interviews");
  console.log("🔗 useInterviews - value:", value);

  return value;
};
