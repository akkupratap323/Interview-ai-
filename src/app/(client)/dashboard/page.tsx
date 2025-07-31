"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import { 
  Plus, 
  Search,
  MessageSquare,
  Users,
  Activity,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

function Interviews() {
  const { interviews, interviewsLoading, fetchInterviews } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

  const handleCreateInterview = () => {
    if (currentPlan === "free_trial_over") {
      setIsModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const copyToClipboard = async (interview: any) => {
    try {
      const interviewLink = interview.readable_slug 
        ? `${base_url}/call/${interview.readable_slug}` 
        : `${base_url}/call/${interview.id}`;
      
      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = interviewLink;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success("Interview link copied!");
        return;
      }
      
      await navigator.clipboard.writeText(interviewLink);
      toast.success("Interview link copied to clipboard!");
      
    } catch (error) {
      toast.error("Failed to copy link. Please try again.");
    }
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Clean filtered interviews without debug logging

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
            if (data.plan === "free_trial_over") {
              setIsModalOpen(true);
            }
          }
          if (data?.allowed_responses_count) {
            setAllowedResponsesCount(data.allowed_responses_count);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!organization) return;
      
      try {
        const responseCount = await ResponseService.getResponseCountByOrganizationId(organization.id);
        setTotalResponses(responseCount);
        
        if (currentPlan === "free" && responseCount >= allowedResponsesCount) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id,
          );
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [organization, currentPlan, allowedResponsesCount]);

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <MessageSquare className="w-12 h-12 text-blue-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Welcome to AI Interviews!
      </h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Get started by creating your first AI-powered interview. Our intelligent system will help you screen candidates effectively.
      </p>
      <div className="space-y-4">
        <Button 
          onClick={handleCreateInterview}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          disabled={currentPlan === "free_trial_over"}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Interview
        </Button>
        <div className="text-sm text-gray-500">
          ✨ Quick setup • AI-powered questions • Instant insights
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">AI Interviews</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Create, manage, and analyze your AI-powered interviews</p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <Button 
                onClick={handleCreateInterview}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
                disabled={currentPlan === "free_trial_over"}
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Create Interview</span>
                <span className="sm:hidden">Create</span>
              </Button>
              {process.env.NODE_ENV === 'development' && (
                <Button 
                  onClick={() => {
                    fetchInterviews();
                    toast.success("Refreshed!");
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  🔄 <span className="hidden sm:inline ml-1">Refresh</span>
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100 cursor-help">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Total Interviews</p>
                          <p className="text-3xl font-bold text-blue-900 mt-1">{interviews.length}</p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-full">
                          <MessageSquare className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of interviews you've created</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100 cursor-help">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700">Active</p>
                          <p className="text-3xl font-bold text-green-900 mt-1">
                            {interviews.filter(i => i.is_active).length}
                          </p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-full">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of interviews currently accepting responses</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-purple-100 cursor-help">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-700">Responses</p>
                          <p className="text-3xl font-bold text-purple-900 mt-1">{totalResponses}</p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-full">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total candidate responses received across all interviews</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-orange-100 cursor-help">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-700">Completion Rate</p>
                          <p className="text-3xl font-bold text-orange-900 mt-1">94%</p>
                        </div>
                        <div className="p-3 bg-orange-500 rounded-full">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average completion rate of your interviews</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Search */}
          {interviews.length > 0 && (
            <div className="relative max-w-md w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {interviewsLoading || loading ? (
          <LoadingSkeleton />
        ) : interviews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPlan !== "free_trial_over" && <CreateInterviewCard />}
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                id={interview.id}
                interviewerId={interview.interviewer_id || "default"}
                name={interview.name || "Untitled Interview"}
                url={interview.url ?? ""}
                readableSlug={interview.readable_slug || ""}
              />
            ))}
          </div>
        )}

        {/* Create Interview Modal */}
        {isCreateModalOpen && (
          <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
            <div className="w-full max-w-2xl">
              <CreateInterviewCard />
            </div>
          </Modal>
        )}

        {/* Upgrade Modal */}
        {isModalOpen && (
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Upgrade to Pro
              </h2>
              <p className="text-gray-600 mb-6">
                You've reached your free trial limit. Upgrade to continue creating interviews.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">Contact us to upgrade:</p>
                <a
                  href="mailto:founders@Interview-up.co"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  founders@Interview-up.co
                </a>
              </div>
              <Button
                onClick={() => setIsModalOpen(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default Interviews;