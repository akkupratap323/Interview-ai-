/* eslint-disable react-hooks/exhaustive-deps, react/jsx-sort-props */
"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { useInterviews } from "@/contexts/interviews.context";
import { 
  Share2, 
  Filter, 
  Pencil, 
  UserIcon, 
  Eye, 
  Palette,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Settings,
  Download,
  RefreshCw
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ResponseService } from "@/services/responses.service";
import { ClientService } from "@/services/clients.service";
import { Interview } from "@/types/interview";
import { Response } from "@/types/response";
import { formatTimestampToDateHHMM } from "@/lib/utils";
import CallInfo from "@/components/call/callInfo";
import SummaryInfo from "@/components/dashboard/interview/summaryInfo";
import { InterviewService } from "@/services/interviews.service";
import EditInterview from "@/components/dashboard/interview/editInterview";
import Modal from "@/components/dashboard/Modal";
import { toast } from "sonner";
import { ChromePicker } from "react-color";
import SharePopup from "@/components/dashboard/interview/sharePopup";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidateStatus } from "@/lib/enum";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Props {
  params: {
    interviewId: string;
  };
  searchParams: {
    call: string;
    edit: boolean;
  };
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewHome({ params, searchParams }: Props) {
  const [interview, setInterview] = useState<Interview>();
  const [responses, setResponses] = useState<Response[]>();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { getInterviewById } = useInterviews();
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const router = useRouter();
  const [isActive, setIsActive] = useState<boolean>(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [isViewed, setIsViewed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [themeColor, setThemeColor] = useState<string>("#4F46E5");
  const [iconColor, seticonColor] = useState<string>("#4F46E5");
  const { organization } = useOrganization();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

  const seeInterviewPreviewPage = () => {
    const protocol = base_url?.includes("localhost") ? "http" : "https";
    if (interview?.url) {
      const url = interview?.readable_slug
        ? `${protocol}://${base_url}/call/${interview?.readable_slug}`
        : interview.url.startsWith("http")
          ? interview.url
          : `https://${interview.url}`;
      window.open(url, "_blank");
    } else {
      console.error("Interview URL is null or undefined.");
    }
  };

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await getInterviewById(params.interviewId);
        setInterview(response);
        setIsActive(response.is_active);
        setIsViewed(response.is_viewed);
        setThemeColor(response.theme_color ?? "#4F46E5");
        seticonColor(response.theme_color ?? "#4F46E5");
        setLoading(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (!interview || !isGeneratingInsights) {
      fetchInterview();
    }
  }, [getInterviewById, params.interviewId, isGeneratingInsights]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        if (organization?.id) {
          const data = await ClientService.getOrganizationById(organization.id);
          if (data?.plan) {
            setCurrentPlan(data.plan);
          }
        }
      } catch (error) {
        console.error("Error fetching organization data:", error);
      }
    };

    fetchOrganizationData();
  }, [organization]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        console.log("🔍 Fetching responses for interview:", params.interviewId);
        
        const response = await fetch(`/api/get-responses?interviewId=${encodeURIComponent(params.interviewId)}`);
        const data = await response.json();
        
        console.log("🔍 API response:", data);
        
        if (response.ok && data.success) {
          console.log("🔍 Fetched responses:", data.count);
          setResponses(data.responses);
        } else {
          console.error("🔍 Failed to fetch responses:", data.error);
          setResponses([]);
        }
        
        setLoading(true);
      } catch (error) {
        console.error("🔍 Error fetching responses:", error);
        setResponses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, [params.interviewId]); // Added dependency

  const handleDeleteResponse = (deletedCallId: string) => {
    if (responses) {
      setResponses(
        responses.filter((response) => response.call_id !== deletedCallId),
      );
      if (searchParams.call === deletedCallId) {
        router.push(`/interviews/${params.interviewId}`);
      }
    }
  };

  const handleResponseClick = async (response: Response) => {
    try {
      await ResponseService.saveResponse({ is_viewed: true }, response.call_id);
      if (responses) {
        const updatedResponses = responses.map((r) =>
          r.call_id === response.call_id ? { ...r, is_viewed: true } : r,
        );
        setResponses(updatedResponses);
      }
      setIsViewed(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async () => {
    try {
      const updatedIsActive = !isActive;
      setIsActive(updatedIsActive);

      await InterviewService.updateInterview(
        { is_active: updatedIsActive },
        params.interviewId,
      );

      toast.success("Interview status updated", {
        description: `The interview is now ${
          updatedIsActive ? "active" : "inactive"
        }.`,
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update the interview status.",
        duration: 3000,
      });
    }
  };

  const handleThemeColorChange = async (newColor: string) => {
    try {
      await InterviewService.updateInterview(
        { theme_color: newColor },
        params.interviewId,
      );

      toast.success("Theme color updated", {
        position: "bottom-right",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Failed to update the theme color.",
        duration: 3000,
      });
    }
  };

  const handleCandidateStatusChange = (callId: string, newStatus: string) => {
    setResponses((prevResponses) => {
      return prevResponses?.map((response) =>
        response.call_id === callId
          ? { ...response, candidate_status: newStatus }
          : response,
      );
    });
  };

  const openSharePopup = () => {
    setIsSharePopupOpen(true);
  };

  const closeSharePopup = () => {
    setIsSharePopupOpen(false);
  };

  const handleColorChange = (color: any) => {
    setThemeColor(color.hex);
  };

  const applyColorChange = () => {
    if (themeColor !== iconColor) {
      seticonColor(themeColor);
      handleThemeColorChange(themeColor);
    }
    setShowColorPicker(false);
  };

  const filterResponses = () => {
    if (!responses) {
      return [];
    }
    
    let filtered = responses;
    
    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(
        (response) => response?.candidate_status === filterStatus,
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((response) =>
        response.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.call_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CandidateStatus.SELECTED:
        return "bg-emerald-500";
      case CandidateStatus.POTENTIAL:
        return "bg-amber-500";
      case CandidateStatus.NOT_SELECTED:
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case CandidateStatus.SELECTED:
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Selected</Badge>;
      case CandidateStatus.POTENTIAL:
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Potential</Badge>;
      case CandidateStatus.NOT_SELECTED:
        return <Badge className="bg-red-100 text-red-800 border-red-200">Not Selected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <LoaderWithText 
        message="Loading Interview" 
        description="Preparing your interview dashboard and response data"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Interview Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: iconColor }}
                />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {interview?.name}
                </h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{responses?.length || 0} Candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Active Interview</span>
                  <span className="sm:hidden">Active</span>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openSharePopup}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Share Interview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={seeInterviewPreviewPage}
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Preview Interview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="hover:bg-purple-50 hover:border-purple-300"
                      >
                        <Palette className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Theme Color</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/interviews/${params.interviewId}?edit=true`)}
                        className="hover:bg-orange-50 hover:border-orange-300"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit Interview</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await fetch(`/api/get-responses?interviewId=${encodeURIComponent(params.interviewId)}`);
                            const data = await response.json();
                            
                            if (response.ok && data.success) {
                              setResponses(data.responses);
                            }
                          } catch (error) {
                            console.error("Error refreshing:", error);
                          }
                        }}
                        className="hover:bg-gray-50 hover:border-gray-300"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh Responses</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {process.env.NODE_ENV === 'development' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAdminPanel(true)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Admin Panel</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                {currentPlan === "free_trial_over" ? (
                  <Badge variant="destructive" className="text-xs sm:text-sm">Inactive - Upgrade Required</Badge>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">
                      {isActive ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={handleToggle}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-[calc(100vh-140px)]">
          {/* Sidebar - Candidates List */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="h-full border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Candidates</CardTitle>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {filterResponses().length}
                  </Badge>
                </div>
                
                {/* Search and Filter */}
                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <Filter className="w-4 h-4 text-gray-400 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        <div className="flex items-center">
                          <div className="w-3 h-3 border-2 border-gray-300 rounded-full mr-2" />
                          All Candidates
                        </div>
                      </SelectItem>
                      <SelectItem value={CandidateStatus.SELECTED}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />
                          Selected
                        </div>
                      </SelectItem>
                      <SelectItem value={CandidateStatus.POTENTIAL}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-amber-500 rounded-full mr-2" />
                          Potential
                        </div>
                      </SelectItem>
                      <SelectItem value={CandidateStatus.NOT_SELECTED}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                          Not Selected
                        </div>
                      </SelectItem>
                      <SelectItem value={CandidateStatus.NO_STATUS}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-gray-400 rounded-full mr-2" />
                          Pending
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  {filterResponses().length > 0 ? (
                    <div className="space-y-2 p-4">
                      {filterResponses().map((response) => (
                        <div
                          key={response.id}
                          className={`group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                            searchParams.call === response.call_id
                              ? "bg-blue-50 border-blue-200 shadow-sm"
                              : "bg-white border-gray-100 hover:border-gray-200"
                          }`}
                          onClick={() => {
                            router.push(`/interviews/${params.interviewId}?call=${response.call_id}`);
                            handleResponseClick(response);
                          }}
                        >
                          {/* Status Indicator */}
                          <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${getStatusColor(response.candidate_status)}`} />
                          
                          <div className="ml-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {response.name || "Anonymous"}
                                  </h4>
                                  {!response.is_viewed && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                  )}
                                </div>
                                
                                <p className="text-xs text-gray-500 mb-2">
                                  {formatTimestampToDateHHMM(String(response.created_at))}
                                </p>
                                
                                {getStatusBadge(response.candidate_status)}
                              </div>
                              
                              {/* Score Badge */}
                              {response.analytics?.overallScore && (
                                <div className="flex-shrink-0 ml-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">
                                            {response.analytics.overallScore}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>Overall Score</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm || filterStatus !== "ALL" ? "No candidates found" : "No Interview Responses Yet"}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {searchTerm || filterStatus !== "ALL" 
                          ? "Try adjusting your search or filter criteria"
                          : "Once candidates complete interviews, their analytics and insights will appear here."
                        }
                      </p>
                      {!searchTerm && filterStatus === "ALL" && (
                        <div className="space-y-3">
                          <Button
                            onClick={openSharePopup}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share Interview Link
                          </Button>
                          <p className="text-xs text-gray-500">
                            Share the interview link to start collecting candidate responses and analytics
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Card className="h-full border-0 shadow-xl">
              <CardContent className="p-0 h-full">
                {responses && (
                  <>
                    {searchParams.call ? (
                      <CallInfo
                        call_id={searchParams.call}
                        onDeleteResponse={handleDeleteResponse}
                        onCandidateStatusChange={handleCandidateStatusChange}
                      />
                    ) : searchParams.edit ? (
                      <EditInterview interview={interview} />
                    ) : (
                      <SummaryInfo responses={responses} interview={interview} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        open={showColorPicker}
        closeOnOutsideClick={false}
        onClose={applyColorChange}
      >
        <div className="w-[280px] p-6">
          <h3 className="text-xl font-semibold mb-6 text-center text-gray-900">
            Choose Theme Color
          </h3>
          <ChromePicker
            disableAlpha={true}
            color={themeColor}
            styles={{
              default: {
                picker: { 
                  width: "100%",
                  boxShadow: "none",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px"
                },
              },
            }}
            onChange={handleColorChange}
          />
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowColorPicker(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={applyColorChange}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>

      {isSharePopupOpen && (
        <SharePopup
          open={isSharePopupOpen}
          shareContent={
            interview?.readable_slug
              ? `${base_url}/call/${interview?.readable_slug}`
              : (interview?.url as string)
          }
          onClose={closeSharePopup}
        />
      )}

      {/* Admin Panel Dialog */}
      <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Admin Panel - Development Tools
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Debug Tools
                  </h3>
                  <div className="space-y-2">
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/debug-interview-responses?interviewId=${params.interviewId}`);
                          const data = await response.json();
                          console.log("Debug - Database responses:", data);
                          alert(`Found ${data.totalResponses} responses in database. Check console for details.`);
                        } catch (error) {
                          console.error("Debug error:", error);
                          alert("Debug failed - check console");
                        }
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Debug Database
                    </Button>
                    <Button
                      onClick={async () => {
                        const callId = prompt("Enter Call ID to debug:");
                        if (!callId) return;
                        try {
                          const response = await fetch(`/api/debug-call-id?callId=${encodeURIComponent(callId)}`);
                          const data = await response.json();
                          console.log("Debug call ID result:", data);
                          if (data.exists) {
                            alert(`Call ID EXISTS! Response ID: ${data.response.id}`);
                          } else {
                            alert(`Call ID NOT FOUND. Similar: ${data.similarResponses.length}`);
                          }
                        } catch (error) {
                          console.error("Debug call ID error:", error);
                          alert("Debug failed - check console");
                        }
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Debug Call ID
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Test Tools
                  </h3>
                  <div className="space-y-2">
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/test-complete-flow', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              interviewId: params.interviewId,
                              email: 'test@example.com',
                              name: 'Test User'
                            })
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert("Test response created! Check the responses list.");
                            // Refresh responses
                            const refreshResponse = await fetch(`/api/get-responses?interviewId=${encodeURIComponent(params.interviewId)}`);
                            const refreshData = await refreshResponse.json();
                            if (refreshResponse.ok && refreshData.success) {
                              setResponses(refreshData.responses);
                            }
                          } else {
                            alert("Test failed: " + data.error);
                          }
                        } catch (error) {
                          console.error("Test error:", error);
                          alert("Test failed - check console");
                        }
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Create Test Response
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/create-test-user', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: 'testuser@example.com' })
                          });
                          const data = await response.json();
                          if (data.success) {
                            alert(`User ${data.user.existed ? 'exists' : 'created'}: ${data.user.email}`);
                          } else {
                            alert(`User creation failed: ${data.error}`);
                          }
                        } catch (error) {
                          console.error("Test user error:", error);
                          alert("User creation failed - check console");
                        }
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Create Test User
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button onClick={() => setShowAdminPanel(false)} variant="outline">
                Close Admin Panel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InterviewHome;
