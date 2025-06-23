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
  MoreVertical,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Star,
  ChevronDown,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CandidateStatus } from "@/lib/enum";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // All your existing functions remain the same...
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
        const response = await ResponseService.getAllResponses(params.interviewId);
        setResponses(response);
        setLoading(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, []);

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
    
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(
        (response) => response?.candidate_status === filterStatus,
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter((response) =>
        response.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getStatusStats = () => {
    if (!responses) return { selected: 0, potential: 0, notSelected: 0, noStatus: 0 };
    
    return {
      selected: responses.filter(r => r.candidate_status === CandidateStatus.SELECTED).length,
      potential: responses.filter(r => r.candidate_status === CandidateStatus.POTENTIAL).length,
      notSelected: responses.filter(r => r.candidate_status === CandidateStatus.NOT_SELECTED).length,
      noStatus: responses.filter(r => r.candidate_status === CandidateStatus.NO_STATUS).length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="flex flex-col w-full h-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[80%] w-full">
          <LoaderWithText />
        </div>
      ) : (
        <>
          {/* Enhanced Header */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left Section - Interview Info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-xl shadow-lg border-2 border-white flex items-center justify-center"
                      style={{ backgroundColor: iconColor }}
                    >
                      <span className="text-white font-bold text-sm">
                        {interview?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">
                      {interview?.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users size={14} />
                        <span className="font-semibold">{responses?.length || 0}</span>
                      </div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full" />
                      <div className="flex items-center gap-1 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        <span className={isActive ? 'text-green-700 font-medium' : 'text-gray-600'}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-3">
                {/* Quick Stats - Compact */}
                <div className="hidden lg:flex items-center gap-3 px-3 py-2 bg-gray-50/80 rounded-lg border border-gray-200/50">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs font-medium text-gray-700">{stats.selected}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="text-xs font-medium text-gray-700">{stats.potential}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs font-medium text-gray-700">{stats.notSelected}</span>
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex items-center gap-1 bg-gray-50/80 rounded-lg p-1 border border-gray-200/50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm transition-all duration-200"
                          onClick={openSharePopup}
                        >
                          <Share2 size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm transition-all duration-200"
                          onClick={seeInterviewPreviewPage}
                        >
                          <Eye size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Preview</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm transition-all duration-200"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        >
                          <Palette size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Theme</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-white hover:shadow-sm transition-all duration-200"
                          onClick={() => router.push(`/interviews/${params.interviewId}?edit=true`)}
                        >
                          <Pencil size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Status Toggle - Compact */}
                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
                  {currentPlan === "free_trial_over" ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-orange-700">
                        Upgrade Required
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {isActive ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={isActive}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-indigo-600"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 gap-4 p-4 overflow-hidden">
            {/* Optimized Sidebar - Reduced Width */}
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} flex flex-col bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden transition-all duration-300`}>
              {/* Sidebar Toggle */}
              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                {!sidebarCollapsed && (
                  <h3 className="text-sm font-bold text-gray-900">
                    Responses
                  </h3>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </Button>
              </div>

              {!sidebarCollapsed && (
                <>
                  {/* Sidebar Header - Compact */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs">
                        {filterResponses().length}
                      </Badge>
                    </div>

                    {/* Search Bar - Compact */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-8 text-sm bg-white border-gray-200 focus:border-indigo-300"
                      />
                    </div>

                    {/* Filter Dropdown - Compact */}
                    <Select onValueChange={setFilterStatus} defaultValue="ALL">
                      <SelectTrigger className="w-full h-8 bg-white border-gray-200 text-sm">
                        <div className="flex items-center gap-2">
                          <Filter size={14} className="text-gray-500" />
                          <SelectValue placeholder="Filter" />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="ALL">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm">All</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {responses?.length || 0}
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value={CandidateStatus.SELECTED}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-sm">Selected</span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {stats.selected}
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value={CandidateStatus.POTENTIAL}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                              <span className="text-sm">Potential</span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {stats.potential}
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value={CandidateStatus.NOT_SELECTED}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                              <span className="text-sm">Not Selected</span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {stats.notSelected}
                            </Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value={CandidateStatus.NO_STATUS}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              <span className="text-sm">No Status</span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {stats.noStatus}
                            </Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Response List - Compact */}
                  <ScrollArea className="flex-1">
                    <div className="p-3 space-y-2">
                      {filterResponses().length > 0 ? (
                        filterResponses().map((response) => (
                          <div
                            key={response.id}
                            className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
                              searchParams.call === response.call_id
                                ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-sm"
                                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                            onClick={() => {
                              router.push(`/interviews/${params.interviewId}?call=${response.call_id}`);
                              handleResponseClick(response);
                            }}
                          >
                            {/* Status Indicator */}
                            <div 
                              className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                              style={{
                                backgroundColor: 
                                  response.candidate_status === "SELECTED" ? "#10b981" :
                                  response.candidate_status === "POTENTIAL" ? "#f59e0b" :
                                  response.candidate_status === "NOT_SELECTED" ? "#ef4444" : "#6b7280"
                              }}
                            />

                            <div className="flex items-start justify-between ml-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm text-gray-900 truncate">
                                    {response.name ? response.name : "Anonymous"}
                                  </h4>
                                  {!response.is_viewed && (
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                  <Calendar size={10} />
                                  <span>{formatTimestampToDateHHMM(String(response.created_at))}</span>
                                </div>
                                
                                {/* Status Badge - Compact */}
                                <Badge 
                                  variant="outline"
                                  className={`text-xs ${
                                    response.candidate_status === "SELECTED" ? "bg-green-50 text-green-700 border-green-200" :
                                    response.candidate_status === "POTENTIAL" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                    response.candidate_status === "NOT_SELECTED" ? "bg-red-50 text-red-700 border-red-200" :
                                    "bg-gray-50 text-gray-600 border-gray-200"
                                  }`}
                                >
                                  {response.candidate_status === "SELECTED" ? "Selected" :
                                   response.candidate_status === "POTENTIAL" ? "Potential" :
                                   response.candidate_status === "NOT_SELECTED" ? "Not Selected" :
                                   "No Status"}
                                </Badge>
                              </div>

                              {/* Score Display - Compact */}
                              {response.analytics?.overallScore !== undefined && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white flex items-center justify-center shadow-sm">
                                        <span className="text-xs font-bold text-white">
                                          {response.analytics.overallScore}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <span>Score</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            {searchTerm || filterStatus !== "ALL" ? "No matches" : "No responses"}
                          </h3>
                          <p className="text-gray-600 text-xs max-w-sm">
                            {searchTerm || filterStatus !== "ALL" 
                              ? "Try adjusting filters"
                              : "Responses will appear here"
                            }
                          </p>
                          {(searchTerm || filterStatus !== "ALL") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchTerm("");
                                setFilterStatus("ALL");
                              }}
                              className="mt-3 h-7 text-xs"
                            >
                              Clear filters
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}

              {/* Collapsed Sidebar Content */}
              {sidebarCollapsed && (
                <div className="p-2 space-y-2">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-900">{responses?.length || 0}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area - Now Takes More Space */}
            {responses && (
              <div className="flex-1 rounded-xl bg-white shadow-sm border border-gray-200/50 overflow-hidden">
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
              </div>
            )}
          </div>
        </>
      )}

      {/* Color Picker Modal */}
      <Modal
        open={showColorPicker}
        closeOnOutsideClick={false}
        onClose={applyColorChange}
      >
        <div className="w-[280px] p-6 bg-white rounded-2xl">
          <h3 className="text-xl font-bold mb-6 text-center text-gray-900">
            Choose Theme Color
          </h3>
          <ChromePicker
            disableAlpha={true}
            color={themeColor}
            styles={{
              default: {
                picker: { 
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "none"
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Popup */}
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
    </div>
  );
}

export default InterviewHome;
