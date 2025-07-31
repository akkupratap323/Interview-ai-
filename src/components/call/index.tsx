"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Shield,
  Clock,
  User,
  Building,
  Sparkles,
  Camera,
  Settings,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Award,
  Video,
  VideoOff,
  Monitor,
  Maximize2,
  Minimize2
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
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

  // Keep all existing functions and useEffects unchanged...
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
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
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
    return (Number(currentTimeDuration) / (Number(interviewTimeDuration) * 60)) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {isStarted && <TabSwitchWarning />}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header - Only show when not in active interview */}
        {(!isStarted || isEnded) && (
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              {interview?.logo_url ? (
                <Image
                  src={interview.logo_url}
                  alt="Company Logo"
                  width={60}
                  height={60}
                  className="rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-15 h-15 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{interview?.name}</h1>
                <p className="text-gray-600">AI-Powered Interview Experience</p>
              </div>
            </div>

            {!isEnded && (
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration: {interviewTimeDuration} mins
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Secure & Monitored
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={getProgressPercentage()} 
                    className="h-3 bg-gray-200"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{formatTime(Number(currentTimeDuration))}</span>
                    <span>{formatTime(Number(interviewTimeDuration) * 60)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex justify-center">
          {/* Pre-Interview Setup */}
          {!isStarted && !isEnded && !isOldUser && (
            <Card className="w-full max-w-5xl border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                  {/* Welcome Section */}
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900">Welcome to Your AI Interview</h2>
                    
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {interview?.description}
                      </p>
                    </div>
                  </div>

                  {/* Setup Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                      <Volume2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-emerald-900 mb-1">Audio Setup</h3>
                      <p className="text-sm text-emerald-700">Ensure your volume is up and microphone access is granted</p>
                    </div>
                    
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                      <Shield className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-amber-900 mb-1">Environment</h3>
                      <p className="text-sm text-amber-700">Find a quiet space with minimal distractions</p>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center">
                      <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-red-900 mb-1">Stay Focused</h3>
                      <p className="text-sm text-red-700">Tab switching will be monitored and recorded</p>
                    </div>
                  </div>

                  {/* Form Section */}
                  {!interview?.is_anonymous && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Let's Get Started</h3>
                        <p className="text-gray-600">Please provide your details to begin the interview</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                            First Name *
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your first name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-12 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={startConversation}
                      disabled={Loading || (!interview?.is_anonymous && (!isValidEmail || !name))}
                      className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {Loading ? (
                        <>
                          <MiniLoader />
                          <span className="ml-2">Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Start AI Interview
                        </>
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={Loading}
                          className="h-14 px-8 text-lg border-2 border-gray-300 hover:bg-gray-50"
                        >
                          <XCircleIcon className="w-5 h-5 mr-2" />
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

          {/* Professional Interview Interface - Full Screen */}
          {isStarted && !isEnded && !isOldUser && (
            <div className="w-full h-screen fixed inset-0 bg-gray-900 z-50">
              {/* Top Control Bar */}
              <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white p-4 z-60">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                  {/* Left - Company Info */}
                  <div className="flex items-center gap-3">
                    {interview?.logo_url ? (
                      <Image
                        src={interview.logo_url}
                        alt="Company Logo"
                        width={32}
                        height={32}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-sm">{interview?.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span>Live Interview</span>
                      </div>
                    </div>
                  </div>

                  {/* Center - Timer */}
                  <div className="flex items-center gap-4">
                    <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(Number(currentTimeDuration))} / {formatTime(Number(interviewTimeDuration) * 60)}
                    </Badge>
                    
                    <div className="w-32">
                      <Progress 
                        value={getProgressPercentage()} 
                        className="h-2 bg-white/20"
                      />
                    </div>
                  </div>

                  {/* Right - Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20 h-10 w-10"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="text-white hover:bg-white/20 h-10 w-10"
                    >
                      {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Interview Area */}
              <div className="pt-20 pb-20 h-full flex">
                {/* AI Interviewer Side - Left */}
                <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center p-8 relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-400 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-purple-400 rounded-full blur-2xl" />
                  </div>

                  <div className="relative z-10 text-center space-y-6">
                    {/* AI Avatar */}
                    <div className="relative">
                      <Avatar className={`w-48 h-48 border-4 transition-all duration-500 ${
                        activeTurn === "agent" 
                          ? "border-indigo-400 shadow-2xl shadow-indigo-500/50 scale-110" 
                          : "border-gray-600 scale-100"
                      }`}>
                        <AvatarImage src={interviewerImg} alt="AI Interviewer" />
                        <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-4xl">
                          AI
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Speaking Indicator */}
                      {activeTurn === "agent" && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Speaking</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white">AI Interviewer</h3>
                      <Badge className={`${
                        activeTurn === "agent" 
                          ? "bg-indigo-500 text-white" 
                          : "bg-gray-700 text-gray-300"
                      } px-4 py-2`}>
                        {activeTurn === "agent" ? (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Active
                          </>
                        ) : (
                          <>
                            <MicOff className="w-4 h-4 mr-2" />
                            Listening
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Current Question Display */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <Card className="bg-black/40 backdrop-blur-sm border-gray-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-indigo-400" />
                          <span className="text-sm font-medium text-gray-300">Current Question</span>
                        </div>
                        <p className="text-lg leading-relaxed">
                          {lastInterviewerResponse || "Preparing your first question..."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Candidate Side - Right */}
                <div className="flex-1 bg-gradient-to-br from-emerald-800 to-emerald-900 flex flex-col items-center justify-center p-8 relative">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-emerald-400 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-green-400 rounded-full blur-2xl" />
                  </div>

                  <div className="relative z-10 text-center space-y-6">
                    {/* User Avatar */}
                    <div className="relative">
                      <Avatar className={`w-48 h-48 border-4 transition-all duration-500 ${
                        activeTurn === "user" 
                          ? "border-emerald-400 shadow-2xl shadow-emerald-500/50 scale-110" 
                          : "border-gray-600 scale-100"
                      }`}>
                        <AvatarImage src="/user-icon.png" alt="You" />
                        <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-4xl">
                          {name ? name[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Speaking Indicator */}
                      {activeTurn === "user" && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-sm font-medium">Speaking</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white">{name || "Candidate"}</h3>
                      <Badge className={`${
                        activeTurn === "user" 
                          ? "bg-emerald-500 text-white" 
                          : "bg-gray-700 text-gray-300"
                      } px-4 py-2`}>
                        {activeTurn === "user" ? (
                          <>
                            <Mic className="w-4 h-4 mr-2" />
                            Speaking
                          </>
                        ) : (
                          <>
                            <MicOff className="w-4 h-4 mr-2" />
                            Listening
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Your Response Display */}
                  <div className="absolute bottom-8 left-8 right-8">
                    <Card className="bg-black/40 backdrop-blur-sm border-gray-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-5 h-5 text-emerald-400" />
                          <span className="text-sm font-medium text-gray-300">Your Response</span>
                        </div>
                        <div 
                          ref={lastUserResponseRef}
                          className="max-h-32 overflow-y-auto"
                        >
                          <p className="text-lg leading-relaxed">
                            {lastUserResponse || "Waiting for your response..."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-white p-4 z-60">
                <div className="flex items-center justify-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="h-12 px-8 text-base bg-red-600 hover:bg-red-700"
                        disabled={Loading}
                      >
                        <XCircleIcon className="w-5 h-5 mr-2" />
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
            <Card className="w-full max-w-6xl border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {isStarted ? "Interview Completed!" : "Thank You!"}
                    </h2>
                    <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                      {isStarted 
                        ? "Thank you for taking the time to participate in this AI-powered interview. Here's your personalized analysis:"
                        : "Thank you very much for your interest. We appreciate your time."
                      }
                    </p>
                  </div>

                  {/* Insights Section */}
                  {isStarted && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800">AI Analysis & Insights</h3>
                      </div>
                      
                      {isGeneratingInsights ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                            <span className="text-gray-600">Generating your personalized insights...</span>
                          </div>
                        </div>
                      ) : insightsError ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-red-700">
                            <XCircleIcon className="w-5 h-5" />
                            <span className="font-medium">Unable to generate insights</span>
                          </div>
                          <p className="text-red-600 text-sm mt-1">{insightsError}</p>
                        </div>
                      ) : insights ? (
                        <div className="space-y-6">
                          {insights.map((insight: any, index: number) => (
                            <div key={index} className="bg-white rounded-lg p-5 shadow-sm border border-blue-100">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-sm font-medium">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-2">{insight.title || `Insight ${index + 1}`}</h4>
                                  <p className="text-gray-600 leading-relaxed">{insight.description || insight}</p>
                                  {insight.score && (
                                    <div className="mt-3 flex items-center gap-2">
                                      <span className="text-sm text-gray-500">Score:</span>
                                      <div className="flex items-center gap-1">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                            style={{ width: `${Math.min(insight.score * 10, 100)}%` }}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{insight.score}/10</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p>Your insights will appear here once generated...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isFeedbackSubmitted && (
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-12 px-8"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          <Award className="w-5 h-5 mr-2" />
                          Share Your Feedback
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <FeedbackForm email={email} onSubmit={handleFeedbackSubmit} />
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <p className="text-sm text-gray-500">
                    You can safely close this tab now.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Already Responded */}
          {isOldUser && (
            <Card className="w-full max-w-5xl border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-900">Already Completed</h2>
                    <p className="text-gray-600 leading-relaxed">
                      You have already responded to this interview or you are not eligible to participate. Thank you for your interest!
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    You can safely close this tab now.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer - Only show when not in active interview */}
        {(!isStarted || isEnded) && (
          <div className="text-center mt-8">
            <a
              href="https://Interview-up.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors duration-300"
            >
              <span className="text-sm font-medium">
                Powered by <span className="font-bold">Interview<span className="text-indigo-600">Up</span></span>
              </span>
              <ArrowUpRightSquareIcon className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Call;
