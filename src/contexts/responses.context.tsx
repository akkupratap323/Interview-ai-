"use client";

import React, { useContext } from "react";

interface Response {
  createResponse: (payload: any) => Promise<any>;
  saveResponse: (
    payload: any,
    call_id: string,
    interview_id?: string,
  ) => Promise<any>;
}

export const ResponseContext = React.createContext<Response>({
  createResponse: async () => null,
  saveResponse: async () => null,
});

interface ResponseProviderProps {
  children: React.ReactNode;
}

export function ResponseProvider({ children }: ResponseProviderProps) {
  const createResponse = async (payload: any) => {
    console.log("🔗 ResponseContext.createResponse - ENTRY POINT");
    console.log("🔗 ResponseContext.createResponse - payload:", payload);

    try {
      const response = await fetch("/api/create-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("🔗 ResponseContext.createResponse - API response:", result);

      if (response.ok && result.success) {
        console.log(
          "🔗 ResponseContext.createResponse - SUCCESS! ID:",
          result.id,
        );
        return result.id;
      } else {
        console.error("🔗 ResponseContext.createResponse - API ERROR:");
        console.error("🔗 Status:", response.status, response.statusText);
        console.error("🔗 Response:", result);
        return null;
      }
    } catch (error) {
      console.error("🔗 ResponseContext.createResponse - ERROR:", error);
      return null;
    }
  };

  const saveResponse = async (
    payload: any,
    call_id: string,
    interview_id?: string,
  ) => {
    try {
      console.log("🔗 ResponseContext.saveResponse - ENTRY POINT");
      console.log(
        "🔗 ResponseContext.saveResponse - payload:",
        payload,
        "call_id:",
        call_id,
        "interview_id:",
        interview_id,
      );

      const response = await fetch("/api/update-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callId: call_id,
          interviewId: interview_id,
          updates: payload,
        }),
      });

      const result = await response.json();
      console.log("🔗 ResponseContext.saveResponse - API response:", result);

      return result;
    } catch (error) {
      console.error("🔗 ResponseContext.saveResponse - ERROR:", error);
      return null;
    }
  };

  return (
    <ResponseContext.Provider
      value={{
        createResponse,
        saveResponse,
      }}
    >
      {children}
    </ResponseContext.Provider>
  );
}

export const useResponses = () => {
  const value = useContext(ResponseContext);

  return value;
};
