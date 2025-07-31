"use client";

import React, { useState, useContext, ReactNode, useEffect } from "react";
import { Interviewer } from "@/types/interviewer";
import { useClerk } from "@clerk/nextjs";

interface InterviewerContextProps {
  interviewers: Interviewer[];
  setInterviewers: React.Dispatch<React.SetStateAction<Interviewer[]>>;
  createInterviewer: (payload: any) => void;
  interviewersLoading: boolean;
  setInterviewersLoading: (interviewersLoading: boolean) => void;
  fetchInterviewers: () => void;
}

export const InterviewerContext = React.createContext<InterviewerContextProps>({
  interviewers: [],
  setInterviewers: () => {},
  createInterviewer: () => {},
  interviewersLoading: false,
  setInterviewersLoading: () => undefined,
  fetchInterviewers: () => {},
});

interface InterviewerProviderProps {
  children: ReactNode;
}

export function InterviewerProvider({ children }: InterviewerProviderProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const { user } = useClerk();
  const [interviewersLoading, setInterviewersLoading] = useState(true);

  const fetchInterviewers = async () => {
    try {
      setInterviewersLoading(true);
      console.log('Fetching interviewers for user:', user?.id);
      
      const response = await fetch('/api/interviewers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      console.log('Fetched interviewers:', data.interviewers);
      console.log('Number of interviewers:', data.interviewers?.length || 0);
      
      setInterviewers(Array.isArray(data.interviewers) ? data.interviewers : []);
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      setInterviewers([]); // Set empty array on error
    } finally {
      setInterviewersLoading(false);
    }
  };

  const createInterviewer = async (payload: any) => {
    try {
      const response = await fetch('/api/create-interviewer', {
        method: 'GET', // This endpoint uses GET method
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchInterviewers();
    } catch (error) {
      console.error('Error creating interviewer:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInterviewers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <InterviewerContext.Provider
      value={{
        interviewers,
        setInterviewers,
        createInterviewer,
        interviewersLoading,
        setInterviewersLoading,
        fetchInterviewers,
      }}
    >
      {children}
    </InterviewerContext.Provider>
  );
}

export const useInterviewers = () => {
  const value = useContext(InterviewerContext);

  return value;
};
