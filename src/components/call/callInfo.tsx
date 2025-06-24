"use client";

import React, { useEffect, useState } from "react";
import { Analytics, CallData } from "@/types/response";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactAudioPlayer from "react-audio-player";
import { 
  Download, 
  Trash2, 
  ArrowLeft, 
  User, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  Play,
  Volume2,
  FileText,
  BarChart3,
  Award,
  Target,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ResponseService } from "@/services/responses.service";
import { useRouter } from "next/navigation";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import QuestionAnswerCard from "@/components/dashboard/interview/questionAnswerCard";
import { marked } from "marked";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { CandidateStatus } from "@/lib/enum";

type CallProps = {
  call_id: string;
  onDeleteResponse: (deletedCallId: string) => void;
  onCandidateStatusChange: (callId: string, newStatus: string) => void;
};

function CallInfo({
  call_id,
  onDeleteResponse,
  onCandidateStatusChange,
}: CallProps) {
  const [call, setCall] = useState<CallData>();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isClicked, setIsClicked] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [candidateStatus, setCandidateStatus] = useState<string>("");
  const [interviewId, setInterviewId] = useState<string>("");
  const [tabSwitchCount, setTabSwitchCount] = useState<number>();

  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true);
      setCall(undefined);
      setEmail("");
      setName("");

      try {
        const response = await axios.post("/api/get-call", { id: call_id });
        setCall(response.data.callResponse);
        setAnalytics(response.data.analytics);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponses();
  }, [call_id]);

  useEffect(() => {
    const fetchEmail = async () => {
      setIsLoading(true);
      try {
        const response = await ResponseService.getResponseByCallId(call_id);
        setEmail(response.email);
        setName(response.name);
        setCandidateStatus(response.candidate_status);
        setInterviewId(response.interview_id);
        setTabSwitchCount(response.tab_switch_count);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmail();
  }, [call_id]);

  useEffect(() => {
    const replaceAgentAndUser = (transcript: string, name: string): string => {
      const agentReplacement = "**AI interviewer:**";
      const userReplacement = `**${name}:**`;

      let updatedTranscript = transcript
        .replace(/Agent:/g, agentReplacement)
        .replace(/User:/g, userReplacement);

      updatedTranscript = updatedTranscript.replace(/(?:\r\n|\r|\n)/g, "\n\n");

      return updatedTranscript;
    };

    if (call && name) {
      setTranscript(replaceAgentAndUser(call?.transcript as string, name));
    }
  }, [call, name]);

  const onDeleteResponseClick = async () => {
    try {
      const response = await ResponseService.getResponseByCallId(call_id);

      if (response) {
        const interview_id = response.interview_id;
        await ResponseService.deleteResponse(call_id);
        router.push(`/interviews/${interview_id}`);
        onDeleteResponse(call_id);
      }

      toast.success("Response deleted successfully", {
        description: "The candidate response has been removed",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error deleting response:", error);
      toast.error("Failed to delete response", {
        description: "Please try again later",
        duration: 3000,
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600";
    if (score >= 6) return "text-blue-600";
    if (score >= 4) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return "from-emerald-500 to-emerald-600";
    if (score >= 6) return "from-blue-500 to-blue-600";
    if (score >= 4) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case CandidateStatus.SELECTED:
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Selected
          </Badge>
        );
      case CandidateStatus.POTENTIAL:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
            <Eye className="w-3 h-3 mr-1" />
            Potential
          </Badge>
        );
      case CandidateStatus.NOT_SELECTED:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Not Selected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Minus className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive": return "text-emerald-600";
      case "Negative": return "text-red-600";
      case "Neutral": return "text-amber-600";
      default: return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <LoaderWithText />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push(`/interviews/${interviewId}`)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Summary
              </Button>

              {tabSwitchCount && tabSwitchCount > 0 && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Tab Switching Detected
                </Badge>
              )}
            </div>

            {/* Candidate Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-indigo-100">
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xl font-semibold">
                    {name ? name[0].toUpperCase() : "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {name || "Anonymous Candidate"}
                  </h1>
                  {email && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {email}
                    </p>
                  )}
                  <div className="mt-2">
                    {getStatusBadge(candidateStatus)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Select
                  value={candidateStatus}
                  onValueChange={async (newValue: string) => {
                    setCandidateStatus(newValue);
                    await ResponseService.updateResponse(
                      { candidate_status: newValue },
                      call_id,
                    );
                    onCandidateStatusChange(call_id, newValue);
                  }}
                >
                  <SelectTrigger className="w-48 bg-white border-gray-300">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CandidateStatus.NO_STATUS}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                        No Status
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.NOT_SELECTED}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                        Not Selected
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.POTENTIAL}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mr-2" />
                        Potential
                      </div>
                    </SelectItem>
                    <SelectItem value={CandidateStatus.SELECTED}>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
                        Selected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={isClicked}
                      className="hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Response</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this candidate&apos;s response and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={onDeleteResponseClick}
                      >
                        Delete Response
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Recording Section */}
            {call?.recording_url && (
              <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    Interview Recording
                  </h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          asChild
                          className="hover:bg-indigo-100"
                        >
                          <a href={call.recording_url} download aria-label="Download recording">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download Recording</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ReactAudioPlayer 
                  src={call.recording_url} 
                  controls 
                  className="w-full"
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Section */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Performance Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Score */}
              {analytics?.overallScore !== undefined && (
                <div className="relative p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-gray-900">Overall Score</h3>
                    </div>
                    <Badge className={`bg-gradient-to-r ${getScoreBg(analytics.overallScore)} text-white`}>
                      {analytics.overallScore}/100
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <Progress 
                      value={analytics.overallScore * 10} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Feedback:</p>
                    <p className="text-sm text-gray-600">
                      {analytics?.overallFeedback || <Skeleton className="w-full h-4" />}
                    </p>
                  </div>
                </div>
              )}

              {/* Communication Score */}
              {analytics?.communication && (
                <div className="relative p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-semibold text-gray-900">Communication</h3>
                    </div>
                    <Badge className={`bg-gradient-to-r ${getScoreBg(analytics.communication.score)} text-white`}>
                      {analytics.communication.score}/10
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <Progress 
                      value={analytics.communication.score * 10} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Feedback:</p>
                    <p className="text-sm text-gray-600">
                      {analytics?.communication.feedback || <Skeleton className="w-full h-4" />}
                    </p>
                  </div>
                </div>
              )}

              {/* Sentiment Analysis */}
              <div className="relative p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Sentiment</h3>
                  </div>
                  <Badge className={`${getSentimentColor(call?.call_analysis?.user_sentiment || '')} bg-white border`}>
                    {call?.call_analysis?.user_sentiment || <Skeleton className="w-16 h-4" />}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Call Summary:</p>
                    <p className="text-sm text-gray-600">
                      {call?.call_analysis?.call_summary || <Skeleton className="w-full h-4" />}
                    </p>
                  </div>
                  
                  {call?.call_analysis?.call_completion_rating_reason && (
                    <p className="text-sm text-gray-600 italic">
                      {call.call_analysis.call_completion_rating_reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Summary */}
        {analytics?.questionSummaries && analytics.questionSummaries.length > 0 && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="w-6 h-6 text-purple-600" />
                Question Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analytics.questionSummaries.map((qs, index) => (
                    <QuestionAnswerCard
                      key={qs.question}
                      questionNumber={index + 1}
                      question={qs.question}
                      answer={qs.summary}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Transcript */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-gray-600" />
              Interview Transcript
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-96">
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: marked(transcript) }}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CallInfo;
