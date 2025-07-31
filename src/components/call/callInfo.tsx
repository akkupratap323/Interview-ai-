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
  Minus,
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
        if (response) {
          setEmail(response.email || "");
          setName(response.name || "");
          setCandidateStatus(response.candidate_status || "");
          setInterviewId(response.interview_id || "");
          setTabSwitchCount(response.tab_switch_count || 0);
        }
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
          <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Selected
          </Badge>
        );
      case CandidateStatus.POTENTIAL:
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
            <Eye className="w-3 h-3 mr-1" />
            Potential
          </Badge>
        );
      case CandidateStatus.NOT_SELECTED:
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1">
            <XCircle className="w-3 h-3 mr-1" />
            Not Selected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-700 border border-gray-200 rounded-full px-3 py-1">
            <Minus className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "text-emerald-600";
      case "Negative":
        return "text-red-600";
      case "Neutral":
        return "text-amber-600";
      default:
        return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoaderWithText
          message="Loading Candidate Details"
          description="Preparing interview analysis and transcript"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 pb-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/interviews/${interviewId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Interview</span>
            </Button>

            {tabSwitchCount && tabSwitchCount > 0 && (
              <Badge className="bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Tab Switching Detected
              </Badge>
            )}
          </div>

          {/* Candidate Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                <span className="text-2xl font-semibold text-gray-700">
                  {name ? name[0].toUpperCase() : "A"}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {name || "Anonymous Candidate"}
                </h1>
                {email && <p className="text-gray-600 text-sm mb-2">{email}</p>}
                <div>{getStatusBadge(candidateStatus)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
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
                <SelectTrigger className="flex-1 sm:w-48 bg-white border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CandidateStatus.NO_STATUS}>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                      Pending
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
                    variant="outline"
                    size="icon"
                    disabled={isClicked}
                    className="border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900">
                      Delete Response
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                      This action cannot be undone. This will permanently delete
                      this candidate&apos;s response and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-200">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
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
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-600" />
                  Interview Recording
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  <a
                    href={call.recording_url}
                    download
                    aria-label="Download recording"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                </Button>
              </div>
              <ReactAudioPlayer
                src={call.recording_url}
                controls
                className="w-full"
                style={{ width: "100%" }}
              />
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              Performance Analytics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Score */}
              {analytics?.overallScore !== undefined && (
                <div className="p-6 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Award className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">
                        Overall Score
                      </h3>
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1">
                      {analytics.overallScore}/100
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.overallScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Feedback:
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {analytics?.overallFeedback || (
                        <Skeleton className="w-full h-4" />
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Communication Score */}
              {analytics?.communication && (
                <div className="p-6 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="font-medium text-gray-900">
                        Communication
                      </h3>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
                      {analytics.communication.score}/10
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${analytics.communication.score * 10}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Feedback:
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {analytics?.communication.feedback || (
                        <Skeleton className="w-full h-4" />
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Sentiment Analysis */}
              <div className="p-6 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Sentiment</h3>
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
                    {call?.call_analysis?.user_sentiment || (
                      <Skeleton className="w-16 h-4" />
                    )}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Call Summary:
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {call?.call_analysis?.call_summary || (
                        <Skeleton className="w-full h-4" />
                      )}
                    </p>
                  </div>

                  {call?.call_analysis?.call_completion_rating_reason && (
                    <p className="text-sm text-gray-500 italic leading-relaxed">
                      {call.call_analysis.call_completion_rating_reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Summary */}
        {analytics?.questionSummaries &&
          analytics.questionSummaries.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-600" />
                  Question Analysis
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {analytics.questionSummaries.map((qs, index) => (
                    <QuestionAnswerCard
                      key={qs.question}
                      questionNumber={index + 1}
                      question={qs.question}
                      answer={qs.summary}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* Transcript */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Interview Transcript
            </h2>
          </div>
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto">
              <div
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: marked(transcript) }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallInfo;
