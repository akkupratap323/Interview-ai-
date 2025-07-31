"use client";

import {
  XCircleIcon,
  Volume2,
  Play,
  Shield,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useResponses } from "@/contexts/responses.context";
import Image from "next/image";
import axios from "axios";
import { RetellWebClient } from "retell-client-js-sdk";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { toast } from "sonner";
import { isLightColor, testEmail } from "@/lib/utils";
import { Interview } from "@/types/interview";
import { FeedbackData } from "@/types/response";
import { FeedbackForm } from "@/components/call/feedbackForm";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InterviewerService } from "@/services/interviewers.service";

const webClient = new RetellWebClient();

type InterviewProps = {
  interview: Interview;
};

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

function Call({ interview }: InterviewProps) {
  console.log("🎙️ Call component - Received interview:", interview);
  console.log("🎙️ Call component - Interview questions:", interview?.questions);
  console.log("🎙️ Call component - Questions type:", typeof interview?.questions);
  console.log("🎙️ Call component - Questions is array:", Array.isArray(interview?.questions));
  const { createResponse } = useResponses();
  const [lastInterviewerResponse, setLastInterviewerResponse] = useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [interviewTimeDuration, setInterviewTimeDuration] = useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);
  const handleFeedbackSubmit = async (formData: Omit<FeedbackData, "interview_id">) => {
    try {
      console.log("🎯 Submitting feedback with data:", {
        ...formData,
        interview_id: interview.id,
      });
      
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          interview_id: interview.id,
        }),
      });

      const result = await response.json();
      console.log("🎯 Feedback API response:", result);

      if (response.ok && result.success) {
        toast.success("Thank you for your feedback!");
        setIsFeedbackSubmitted(true);
        setIsDialogOpen(false);
      } else {
        console.error("🎯 Feedback submission failed:", result);
        toast.error(result.error || "Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("🎯 Error submitting feedback:", error);
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Keep all existing useEffect hooks unchanged
  useEffect(() => {
    if (lastUserResponseRef.current) {
      lastUserResponseRef.current.scrollTop = lastUserResponseRef.current.scrollHeight;
    }
  }, [lastUserResponse]);

  useEffect(() => {
    let intervalId: any;
    if (isCalling) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    setCurrentTimeDuration(String(Math.floor(time / 100)));
    if (Number(currentTimeDuration) == Number(interviewTimeDuration) * 60) {
      webClient.stopCall();
      setIsEnded(true);
    }

    return () => clearInterval(intervalId);
  }, [isCalling, time, currentTimeDuration]);

  // Function to generate insights after interview completion
  const generateInsights = async () => {
    console.log("🧠 Generating insights for interview:", interview.id);
    setIsGeneratingInsights(true);
    setInsightsError(null);
    
    try {
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interview.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("🧠 Insights generated:", data);
      
      if (data.response) {
        const parsedInsights = JSON.parse(data.response);
        setInsights(parsedInsights.insights);
        console.log("🧠 Parsed insights:", parsedInsights.insights);
      }
    } catch (error) {
      console.error("🧠 Error generating insights:", error);
      setInsightsError(error.message || "Failed to generate insights");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Generate insights when interview ends
  useEffect(() => {
    if (isEnded && isStarted && !insights && !isGeneratingInsights) {
      console.log("🧠 Interview ended, generating insights...");
      // Add a small delay to ensure responses are saved
      setTimeout(() => {
        generateInsights();
      }, 2000);
    }
  }, [isEnded, isStarted, insights, isGeneratingInsights]);

  useEffect(() => {
    if (testEmail(email)) {
      setIsValidEmail(true);
    }
  }, [email]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    webClient.on("call_ended", () => {
      console.log("Call ended");
      setIsCalling(false);
      setIsEnded(true);
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });

        setLastInterviewerResponse(roleContents["agent"]);
        setLastUserResponse(roleContents["user"]);
      }
    });

    return () => {
      webClient.removeAllListeners();
    };
  }, []);

  const onEndCallClick = async () => {
    if (isStarted) {
      setLoading(true);
      webClient.stopCall();
      setIsEnded(true);
      setLoading(false);
    } else {
      setIsEnded(true);
    }
  };

  const startConversation = async () => {
    console.log("🎙️ Starting conversation - interview data:", interview);
    console.log("🎙️ Starting conversation - questions:", interview?.questions);
    
    const data = {
      mins: interview?.time_duration || "10",
      objective: interview?.objective || "General interview",
      questions: interview?.questions && Array.isArray(interview.questions) 
        ? interview.questions.map((q) => q.question).join(", ")
        : "No questions available",
      name: name || "not provided",
    };
    
    console.log("🎙️ Starting conversation - prepared data:", data);
    setLoading(true);

    console.log("🎙️ Checking user eligibility - email:", email);
    
    let OldUser = false;
    
    try {
      const eligibilityResponse = await fetch('/api/check-email-eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: interview.id,
          email: email,
        }),
      });

      const eligibilityResult = await eligibilityResponse.json();
      console.log("🎙️ Eligibility check result:", eligibilityResult);

      // DEVELOPMENT MODE: Skip validation for testing
      const isDevelopment = process.env.NODE_ENV === 'development';
      console.log("🎙️ Development mode:", isDevelopment);
      
      OldUser = !isDevelopment && (
        eligibilityResult.isOldUser ||
        (interview?.respondents && Array.isArray(interview.respondents) && !interview.respondents.includes(email))
      );
      
      console.log("🎙️ User validation result - OldUser:", OldUser);
    } catch (error) {
      console.error("🎙️ Error checking eligibility:", error);
      // In case of error, allow the user to proceed (fail open)
      OldUser = false;
    }

    if (OldUser) {
      console.log("🎙️ User blocked - already responded or not eligible");
      setIsOldUser(true);
    } else {
      console.log("🎙️ User allowed - proceeding with interview");
      const registerCallResponse: registerCallResponseType = await axios.post(
        "/api/register-call",
        { dynamic_data: data, interviewer_id: interview?.interviewer_id },
      );
      if (registerCallResponse.data.registerCallResponse.access_token) {
        await webClient
          .startCall({
            accessToken:
              registerCallResponse.data.registerCallResponse.access_token,
          })
          .catch(console.error);
        setIsCalling(true);
        setIsStarted(true);

        setCallId(registerCallResponse?.data?.registerCallResponse?.call_id);

        console.log("💾 Creating response record...");
        const responsePayload = {
          interview_id: interview.id,
          call_id: registerCallResponse.data.registerCallResponse.call_id,
          email: email,
          name: name,
        };
        console.log("💾 Response payload:", responsePayload);
        
        const responseId = await createResponse(responsePayload);
        
        if (responseId) {
          console.log("💾 Response created successfully with ID:", responseId);
        } else {
          console.error("💾 CRITICAL: Failed to create response record!");
          console.error("💾 This will cause issues when the interview ends!");
          console.error("💾 Call ID:", registerCallResponse.data.registerCallResponse.call_id);
          console.error("💾 Interview ID:", interview.id);
          
          // Show user warning but continue with interview
          toast.error("Warning: Response recording may have issues. Please contact support if problems persist.");
        }
      } else {
        console.log("Failed to register call");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(
        String(interview.interviewer_id || ''),
      );
      setInterviewerImg(interviewer?.image || '');
    };
    fetchInterviewer();
  }, [interview.interviewer_id]);

  useEffect(() => {
    if (isEnded && callId) {
      const updateInterview = async () => {
        try {
          console.log("📝 Updating response as ended for call:", callId);
          
          const response = await fetch('/api/update-response', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              callId: callId,
              interviewId: interview.id, // Include interview ID for fallback creation
              updates: { is_ended: true, tab_switch_count: tabSwitchCount },
            }),
          });

          const result = await response.json();
          console.log("📝 Update response result:", result);

          if (!response.ok) {
            if (response.status === 404) {
              console.warn("📝 Response record not found during update - this suggests response creation failed during interview start");
              console.warn("📝 Call ID:", callId);
              console.warn("📝 Interview ID:", interview.id);
              
              // Don't show error to user for 404 as it's an expected scenario
            } else {
              console.error("📝 Failed to update response:", result);
              console.error("📝 Status:", response.status);
              console.error("📝 Response details:", result);
            }
          } else {
            console.log("📝 Response marked as ended successfully");
          }
        } catch (error) {
          console.error("📝 Error updating response:", error);
        }
      };

      updateInterview();
    }
  }, [isEnded, callId, tabSwitchCount]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (isEnded) return 100;
    const current = Number(currentTimeDuration);
    const total = Number(interviewTimeDuration) * 60;
    return total > 0 ? (current / total) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-white">
      {isStarted && <TabSwitchWarning />}
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header - Only show when not in active interview */}
        {(!isStarted || isEnded) && (
          <div className="text-center mb-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{interview?.name}</h1>
              <p className="text-gray-600">AI Interview</p>
            </div>

            {!isEnded && (
              <div className="max-w-sm mx-auto">
                <div className="flex justify-center text-sm text-gray-600 mb-2">
                  <span>Duration: {interviewTimeDuration} mins</span>
                </div>
                <Progress 
                  value={getProgressPercentage()} 
                  className="h-2 bg-gray-200"
                />
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex justify-center">
          {/* Pre-Interview Setup */}
          {!isStarted && !isEnded && !isOldUser && (
            <Card className="w-full max-w-2xl border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Welcome Section */}
                  <div className="text-center space-y-3">
                    <h2 className="text-xl font-semibold text-gray-900">Ready to Begin?</h2>
                    
                    {interview?.description && (
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {interview.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Setup Instructions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Volume2 className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Ensure microphone access is granted</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Find a quiet environment</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Stay focused - tab switching is monitored</span>
                    </div>
                  </div>

                  {/* Form Section */}
                  {!interview?.is_anonymous && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-base font-medium text-gray-900 mb-1">Your Details</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="email" className="text-sm text-gray-700">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 border-gray-300 focus:border-gray-500"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="name" className="text-sm text-gray-700">
                            First Name *
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your first name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 border-gray-300 focus:border-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={startConversation}
                      disabled={Loading || (!interview?.is_anonymous && (!isValidEmail || !name))}
                      className="flex-1 bg-black hover:bg-gray-800 text-white"
                    >
                      {Loading ? (
                        <>
                          <MiniLoader />
                          <span className="ml-2">Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Interview
                        </>
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={Loading}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          Exit
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Exit Interview?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to exit? You won't be able to restart this interview.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Stay</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={onEndCallClick}
                          >
                            Exit Interview
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Simple Interview Interface */}
          {isStarted && !isEnded && !isOldUser && (
            <div className="w-full h-screen fixed inset-0 bg-white z-50">
              {/* Top Bar */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-900">{interview?.name}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {formatTime(Number(currentTimeDuration))} / {formatTime(Number(interviewTimeDuration) * 60)}
                    </span>
                    
                    <div className="w-24">
                      <Progress 
                        value={getProgressPercentage()} 
                        className="h-1 bg-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Interview Area */}
              <div className="flex-1 flex">
                {/* AI Interviewer Side - Left */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
                  <div className="text-center space-y-4">
                    {/* AI Avatar */}
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full border-2 transition-all duration-300 ${
                        activeTurn === "agent" 
                          ? "border-black bg-black" 
                          : "border-gray-300 bg-white"
                      } flex items-center justify-center`}>
                        <span className={`text-lg font-medium ${
                          activeTurn === "agent" ? "text-white" : "text-gray-600"
                        }`}>AI</span>
                      </div>
                      
                      {/* Speaking Indicator */}
                      {activeTurn === "agent" && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="bg-black text-white px-2 py-1 rounded text-xs">
                            Speaking
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">AI Interviewer</h3>
                      <span className="text-sm text-gray-500">
                        {activeTurn === "agent" ? "Speaking" : "Listening"}
                      </span>
                    </div>
                  </div>

                  {/* Current Question Display */}
                  <div className="mt-8 w-full max-w-md">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Current Question:</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {lastInterviewerResponse || "Preparing your first question..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Candidate Side - Right */}
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    {/* User Avatar */}
                    <div className="relative">
                      <div className={`w-24 h-24 rounded-full border-2 transition-all duration-300 ${
                        activeTurn === "user" 
                          ? "border-black bg-black" 
                          : "border-gray-300 bg-white"
                      } flex items-center justify-center`}>
                        <span className={`text-lg font-medium ${
                          activeTurn === "user" ? "text-white" : "text-gray-600"
                        }`}>{name ? name[0].toUpperCase() : "U"}</span>
                      </div>
                      
                      {/* Speaking Indicator */}
                      {activeTurn === "user" && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="bg-black text-white px-2 py-1 rounded text-xs">
                            Speaking
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900">{name || "You"}</h3>
                      <span className="text-sm text-gray-500">
                        {activeTurn === "user" ? "Speaking" : "Listening"}
                      </span>
                    </div>
                  </div>

                  {/* Your Response Display */}
                  <div className="mt-8 w-full max-w-md">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Your Response:</h4>
                      <div 
                        ref={lastUserResponseRef}
                        className="max-h-24 overflow-y-auto"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {lastUserResponse || "Waiting for your response..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex justify-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        disabled={Loading}
                      >
                        End Interview
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>End Interview?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Are you sure you want to end the interview?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Continue Interview</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={onEndCallClick}
                        >
                          End Interview
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}

          {/* Interview Completed */}
          {isEnded && !isOldUser && (
            <Card className="w-full max-w-3xl border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {isStarted ? "Interview Complete" : "Thank You"}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {isStarted 
                        ? "Thank you for participating. Your analysis is being generated."
                        : "Thank you for your interest."
                      }
                    </p>
                  </div>

                  {/* Insights Section */}
                  {isStarted && (
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <h3 className="font-medium text-gray-900 mb-3">Analysis</h3>
                      
                      {isGeneratingInsights ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                            <span className="text-gray-600 text-sm">Generating insights...</span>
                          </div>
                        </div>
                      ) : insightsError ? (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-red-700 text-sm">Unable to generate insights: {insightsError}</p>
                        </div>
                      ) : insights ? (
                        <div className="space-y-3">
                          {insights.map((insight: any, index: number) => (
                            <div key={index} className="bg-white rounded p-3 border">
                              <h4 className="font-medium text-gray-900 text-sm mb-1">
                                {insight.title || `Insight ${index + 1}`}
                              </h4>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {insight.description || insight}
                              </p>
                              {insight.score && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-1">
                                    <div 
                                      className="bg-gray-600 h-1 rounded-full"
                                      style={{ width: `${Math.min(insight.score * 10, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500">{insight.score}/10</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500 text-sm">Analysis will appear here...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isFeedbackSubmitted && (
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(true)}
                          className="border-gray-300"
                        >
                          Share Feedback
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <FeedbackForm email={email} onSubmit={handleFeedbackSubmit} />
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <p className="text-xs text-gray-500 text-center">
                    You can close this tab now.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already Responded */}
          {isOldUser && (
            <Card className="w-full max-w-2xl border border-gray-200 shadow-sm bg-white">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900">Already Completed</h2>
                    <p className="text-gray-600 text-sm">
                      You have already responded to this interview or are not eligible to participate.
                    </p>
                  </div>

                  <p className="text-xs text-gray-500">
                    You can close this tab now.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer - Only show when not in active interview */}
        {(!isStarted || isEnded) && (
          <div className="text-center mt-6">
            <a
              href="https://Interview-up.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Powered by InterviewUp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Call;
