"use client";

import { Interview } from "@/types/interview";
import { Interviewer } from "@/types/interviewer";
import { Response } from "@/types/response";
import React, { useEffect, useState } from "react";
import {
  UserCircleIcon,
  SmileIcon,
  Info,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  Award,
  BarChart3,
} from "lucide-react";
import { useInterviewers } from "@/contexts/interviewers.context";
import { PieChart } from "@mui/x-charts/PieChart";
import { CandidateStatus } from "@/lib/enum";
import { convertSecondstoMMSS } from "@/lib/utils";
import Image from "next/image";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import DataTable, {
  TableData,
} from "@/components/dashboard/interview/dataTable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SummaryProps = {
  responses: Response[];
  interview: Interview | undefined;
};

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Info className="h-4 w-4 text-indigo-500 hover:text-indigo-700 transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="bg-gray-800 text-white font-normal max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  tooltip,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  tooltip: string;
  subtitle?: string;
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <InfoTooltip content={tooltip} />
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div
            className={`p-3 rounded-full bg-gradient-to-r ${color.replace("text-", "from-").replace("-600", "-100")} ${color.replace("text-", "to-").replace("-600", "-200")}`}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryInfo({ responses, interview }: SummaryProps) {
  const { interviewers } = useInterviewers();
  const [interviewer, setInterviewer] = useState<Interviewer>();
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [completedInterviews, setCompletedInterviews] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [sentimentCount, setSentimentCount] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });
  const [candidateStatusCount, setCandidateStatusCount] = useState({
    [CandidateStatus.NO_STATUS]: 0,
    [CandidateStatus.NOT_SELECTED]: 0,
    [CandidateStatus.POTENTIAL]: 0,
    [CandidateStatus.SELECTED]: 0,
  });
  const [tableData, setTableData] = useState<TableData[]>([]);

  const totalResponses = responses.length;

  const prepareTableData = (responses: Response[]): TableData[] => {
    return responses.map((response) => ({
      call_id: response.call_id,
      name: response.name || "Anonymous",
      overallScore: response.analytics?.overallScore || 0,
      communicationScore: response.analytics?.communication?.score || 0,
      callSummary:
        response.analytics?.softSkillSummary ||
        response.details?.call_analysis?.call_summary ||
        "No summary available",
    }));
  };

  useEffect(() => {
    if (!interviewers || !interview) return;
    const interviewer = interviewers.find(
      (interviewer) => interviewer.id === interview.interviewer_id,
    );
    setInterviewer(interviewer);
  }, [interviewers, interview]);

  useEffect(() => {
    if (!responses) return;

    const sentimentCounter = { positive: 0, negative: 0, neutral: 0 };
    const statusCounter = {
      [CandidateStatus.NO_STATUS]: 0,
      [CandidateStatus.NOT_SELECTED]: 0,
      [CandidateStatus.POTENTIAL]: 0,
      [CandidateStatus.SELECTED]: 0,
    };

    let totalDuration = 0;
    let completedCount = 0;
    let totalScore = 0;
    let scoreCount = 0;

    responses.forEach((response) => {
      // Sentiment analysis
      const sentiment = response.details?.call_analysis?.user_sentiment;
      if (sentiment === "Positive") sentimentCounter.positive += 1;
      else if (sentiment === "Negative") sentimentCounter.negative += 1;
      else if (sentiment === "Neutral") sentimentCounter.neutral += 1;

      // Completion tracking
      const agentTaskCompletion =
        response.details?.call_analysis?.agent_task_completion_rating;
      if (
        agentTaskCompletion === "Complete" ||
        agentTaskCompletion === "Partial"
      ) {
        completedCount += 1;
      }

      // Duration and scoring
      totalDuration += response.duration;
      if (response.analytics?.overallScore) {
        totalScore += response.analytics.overallScore;
        scoreCount += 1;
      }

      // Status tracking
      if (
        Object.values(CandidateStatus).includes(
          response.candidate_status as CandidateStatus,
        )
      ) {
        statusCounter[response.candidate_status as CandidateStatus]++;
      }
    });

    setSentimentCount(sentimentCounter);
    setTotalDuration(totalDuration);
    setCompletedInterviews(completedCount);
    setAverageScore(scoreCount > 0 ? totalScore / scoreCount : 0);
    setCandidateStatusCount(statusCounter);
    setTableData(prepareTableData(responses));
  }, [responses]);

  if (responses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
        <Card className="max-w-md w-full mx-4 text-center border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-16 h-16 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No Interview Data Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Share your interview link with candidates to start collecting
              responses and analytics.
            </p>
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-200"
            >
              Ready to collect data
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-blue-600/10 rounded-3xl blur-3xl" />
          <Card className="relative bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                      Interview Analytics
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Comprehensive analysis of candidate responses
                    </p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  {totalResponses} Responses
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Interviewer:</span>
                  <span className="font-semibold ml-2">
                    {interviewer?.name || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Description:</span>
                  <span className="font-semibold ml-2">
                    {interview?.description || "No description"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Average Duration"
            value={convertSecondstoMMSS(totalDuration / responses.length)}
            icon={Clock}
            color="text-blue-600"
            tooltip="Average time candidates spent in interviews"
          />
          <MetricCard
            title="Completion Rate"
            value={`${Math.round((completedInterviews / responses.length) * 100)}%`}
            icon={CheckCircle}
            color="text-green-600"
            tooltip="Percentage of successfully completed interviews"
          />
          <MetricCard
            title="Average Score"
            value={averageScore.toFixed(1)}
            icon={Award}
            color="text-purple-600"
            tooltip="Average overall score across all candidates"
            subtitle="/ 10"
          />
          <MetricCard
            title="Total Candidates"
            value={totalResponses}
            icon={Users}
            color="text-indigo-600"
            tooltip="Total number of candidates interviewed"
          />
        </div>

        {/* Data Table */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Candidate Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <DataTable data={tableData} interviewId={interview?.id || ""} />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment Analysis */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SmileIcon className="w-5 h-5 text-emerald-600" />
                Candidate Sentiment Analysis
                <InfoTooltip content="Distribution of candidate sentiments during interviews based on AI analysis" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PieChart
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: sentimentCount.positive,
                        label: `Positive (${sentimentCount.positive})`,
                        color: "#10b981",
                      },
                      {
                        id: 1,
                        value: sentimentCount.neutral,
                        label: `Neutral (${sentimentCount.neutral})`,
                        color: "#f59e0b",
                      },
                      {
                        id: 2,
                        value: sentimentCount.negative,
                        label: `Negative (${sentimentCount.negative})`,
                        color: "#ef4444",
                      },
                    ],
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                  },
                ]}
                width={400}
                height={200}
              />
            </CardContent>
          </Card>

          {/* Candidate Status */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-blue-600" />
                Selection Status Distribution
                <InfoTooltip content="Breakdown of candidate selection decisions" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <PieChart
                series={[
                  {
                    data: [
                      {
                        id: 0,
                        value: candidateStatusCount[CandidateStatus.SELECTED],
                        label: `Selected (${candidateStatusCount[CandidateStatus.SELECTED]})`,
                        color: "#10b981",
                      },
                      {
                        id: 1,
                        value: candidateStatusCount[CandidateStatus.POTENTIAL],
                        label: `Potential (${candidateStatusCount[CandidateStatus.POTENTIAL]})`,
                        color: "#f59e0b",
                      },
                      {
                        id: 2,
                        value:
                          candidateStatusCount[CandidateStatus.NOT_SELECTED],
                        label: `Not Selected (${candidateStatusCount[CandidateStatus.NOT_SELECTED]})`,
                        color: "#ef4444",
                      },
                      {
                        id: 3,
                        value: candidateStatusCount[CandidateStatus.NO_STATUS],
                        label: `Pending (${candidateStatusCount[CandidateStatus.NO_STATUS]})`,
                        color: "#6b7280",
                      },
                    ],
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
                  },
                ]}
                width={400}
                height={200}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SummaryInfo;
