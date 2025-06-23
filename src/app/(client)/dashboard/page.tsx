"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import { 
  Gem, 
  Plus, 
  Sparkles, 
  Users, 
  TrendingUp, 
  Crown,
  Calendar,
  Clock,
  Star,
  Zap,
  Target,
  Award,
  Activity,
  ChevronRight,
  Filter,
  Search,
  Play,
  CheckCircle,
  Copy,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  CopyCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { toast } from "sonner";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [sidebarHovered, setSidebarHovered] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const isCollapsed = sidebar.classList.contains('w-16') || 
                           sidebar.offsetWidth <= 64;
        setSidebarCollapsed(isCollapsed);
      }
    };

    handleSidebarChange();
    
    window.addEventListener('resize', handleSidebarChange);
    
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const observer = new MutationObserver(handleSidebarChange);
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['class', 'style'] 
      });
      
      const handleMouseEnter = () => setSidebarHovered(true);
      const handleMouseLeave = () => setSidebarHovered(false);
      
      sidebar.addEventListener('mouseenter', handleMouseEnter);
      sidebar.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        observer.disconnect();
        sidebar.removeEventListener('mouseenter', handleMouseEnter);
        sidebar.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('resize', handleSidebarChange);
      };
    }

    return () => {
      window.removeEventListener('resize', handleSidebarChange);
    };
  }, []);

  const handleOverlayClick = () => {
    setSidebarHovered(false);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const event = new MouseEvent('mouseleave', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      sidebar.dispatchEvent(event);
    }
  };

  const handleCreateInterview = () => {
    if (currentPlan === "free_trial_over") {
      setIsModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const copyToClipboard = (interview: any) => {
    const interviewLink = interview.readable_slug 
      ? `${base_url}/call/${interview.readable_slug}` 
      : interview.url;
    
    navigator.clipboard.writeText(interviewLink).then(() => {
      setCopiedId(interview.id);
      toast.success("Interview link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleStartInterview = (interview: any) => {
    const interviewUrl = interview.readable_slug
      ? `/call/${interview.readable_slug}`
      : `/call/${interview.url}`;
    window.open(interviewUrl, "_blank");
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function InterviewsLoader() {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 w-full animate-pulse rounded-2xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 shadow-sm"
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-xl bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"
          />
        ))}
      </div>
    );
  }

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
    const fetchResponsesCount = async () => {
      if (!organization || currentPlan !== "free") {
        return;
      }

      setLoading(true);
      try {
        const totalResponses = await ResponseService.getResponseCountByOrganizationId(
          organization.id,
        );
        const hasExceededLimit = totalResponses >= allowedResponsesCount;
        if (hasExceededLimit) {
          setCurrentPlan("free_trial_over");
          await InterviewService.deactivateInterviewsByOrgId(organization.id);
          await ClientService.updateOrganization(
            { plan: "free_trial_over" },
            organization.id,
          );
        }
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponsesCount();
  }, [organization, currentPlan, allowedResponsesCount]);

  return (
    <>
      {/* Screen Overlay */}
      {sidebarHovered && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-all duration-300"
          onClick={handleOverlayClick}
          style={{ 
            left: '288px',
            top: '64px'
          }}
        />
      )}

      <main 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '64px' : '64px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <ScrollArea className="h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="mb-12 relative overflow-hidden rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10"></div>
              <Image
                src="/job interview.jpg"
                alt="Professional Job Interview"
                width={1200}
                height={600}
                className="w-full h-96 object-cover"
                priority
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center text-white max-w-4xl px-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold">
                      AI Interview Studio
                    </h1>
                  </div>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed">
                    Create, manage, and analyze AI-powered interviews with intelligent insights. 
                    Transform your hiring process with our advanced interview platform.
                  </p>
                  <div className="flex items-center justify-center gap-6">
                    <button className="flex items-center gap-2 px-8 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white rounded-xl font-medium transition-all">
                      <Play className="w-5 h-5" />
                      Watch Demo
                    </button>
                    <div className="flex items-center gap-2 text-white/80">
                      <CheckCircle className="w-5 h-5" />
                      <span>95% Interview Success Rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Banner */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-indigo-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <Activity className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                      <p className="text-sm text-gray-600">3 new responses in the last hour</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl hover:bg-white transition-colors">
                    <span className="text-sm font-medium">View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interviews Section */}
            <div className="space-y-6">
              {/* Header with Search and Actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Your Interviews</h2>
                  <p className="text-gray-600 mt-1">
                    {viewMode === "table" ? "Manage and monitor your AI-powered interviews" : "Browse your interview collection"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search interviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl w-64"
                    />
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="px-3 py-1 text-xs"
                    >
                      Table
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="px-3 py-1 text-xs"
                    >
                      Grid
                    </Button>
                  </div>

                  {/* Create Interview Button */}
                  <Button 
                    onClick={handleCreateInterview}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    disabled={currentPlan === "free_trial_over"}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Interview
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-600 text-sm font-medium">Total Interviews</p>
                        <p className="text-2xl font-bold text-blue-900">{interviews.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Active</p>
                        <p className="text-2xl font-bold text-green-900">
                          {interviews.filter(i => i.is_active).length}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 text-sm font-medium">This Month</p>
                        <p className="text-2xl font-bold text-purple-900">12</p>
                      </div>
                      <Calendar className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-600 text-sm font-medium">Success Rate</p>
                        <p className="text-2xl font-bold text-orange-900">94%</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interviews Display */}
              {interviewsLoading || loading ? (
                <InterviewsLoader />
              ) : viewMode === "table" ? (
                /* Table View */
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    {filteredInterviews.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                              <th className="text-left p-4 font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  Interview Name
                                  <ArrowUpDown className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                                </div>
                              </th>
                              <th className="text-left p-4 font-semibold text-gray-900">Interviewer</th>
                              <th className="text-left p-4 font-semibold text-gray-900">Responses</th>
                              <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                              <th className="text-left p-4 font-semibold text-gray-900">Created</th>
                              <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredInterviews.map((interview, index) => (
                              <tr 
                                key={interview.id} 
                                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                onClick={() => window.location.href = `/interviews/${interview.id}`}
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                      style={{ backgroundColor: interview.theme_color || '#4F46E5' }}
                                    >
                                      {interview.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                                        {interview.name}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        {interview.readable_slug || 'Custom URL'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                      <Users className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm text-gray-700">AI Interviewer</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-gray-900">0</span>
                                    <span className="text-sm text-gray-500">responses</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge 
                                    className={`${
                                      interview.is_active 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                      interview.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                                    }`} />
                                    {interview.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>Recently</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(interview);
                                      }}
                                      className="h-8 px-3"
                                    >
                                      {copiedId === interview.id ? (
                                        <CopyCheck className="w-3 h-3" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartInterview(interview);
                                      }}
                                      className="h-8 px-3"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => e.stopPropagation()}
                                          className="h-8 w-8 p-0"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit Interview
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* Empty State for Table */
                      <div className="text-center py-20">
                        <div className="relative mb-8">
                          <div className="w-48 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                            <Image
                              src="/job interview.jpg"
                              alt="Create Your First Interview"
                              width={192}
                              height={128}
                              className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
                              <Sparkles className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Ready to start your first interview?
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                          Create your first AI interview to start collecting responses and generating intelligent insights about your candidates.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                          <Button 
                            onClick={handleCreateInterview}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
                          >
                            Create Interview
                          </Button>
                          <Button 
                            variant="outline"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                          >
                            View Templates
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Create Interview Card */}
                  {currentPlan === "free_trial_over" ? (
                    <Card className="group border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300 bg-white/50 backdrop-blur-sm">
                      <CardContent className="flex flex-col items-center justify-center h-64 p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Plus className="w-8 h-8 text-gray-400" />
                        </div>
                        <CardTitle className="text-lg text-gray-700 mb-2">
                          Upgrade Required
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          Upgrade to create more interviews
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <CreateInterviewCard />
                  )}

                  {/* Interview Cards */}
                  {filteredInterviews.map((item) => (
                    <InterviewCard
                      id={item.id}
                      interviewerId={item.interviewer_id}
                      key={item.id}
                      name={item.name}
                      url={item.url ?? ""}
                      readableSlug={item.readable_slug}
                    />
                  ))}
                </div>
              )}

              {/* Enhanced Empty State for Grid View */}
              {!interviewsLoading && !loading && interviews.length === 0 && viewMode === "grid" && (
                <div className="text-center py-20">
                  <div className="relative mb-8">
                    <div className="w-48 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="/job interview.jpg"
                        alt="Create Your First Interview"
                        width={192}
                        height={128}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Ready to start your first interview?
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Create your first AI interview to start collecting responses and generating intelligent insights about your candidates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Create Interview Modal */}
        {isCreateModalOpen && (
          <Modal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
            <div className="w-[600px] max-h-[80vh] overflow-y-auto">
              <CreateInterviewCard />
            </div>
          </Modal>
        )}

        {/* Enhanced Upgrade Modal */}
        {isModalOpen && (
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Gem className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  Upgrade to Pro
                </h2>
                <p className="text-xl text-gray-600">
                  You've reached your free trial limit. Unlock unlimited potential with Pro.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="flex justify-center items-center">
                  <Image
                    src="/premium-plan-icon.png"
                    alt="Premium Plan"
                    width={300}
                    height={300}
                    className="rounded-2xl shadow-2xl"
                  />
                </div>

                <div className="space-y-6">
                  <Card className="border-2 border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        Free Plan
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                          10 Responses
                        </li>
                        <li className="flex items-center text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                          Basic Support
                        </li>
                        <li className="flex items-center text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                          Limited Features
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                        <div className="w-8 h-8 bg-indigo-200 rounded-lg flex items-center justify-center mr-3">
                          <Crown className="w-4 h-4 text-indigo-600" />
                        </div>
                        Pro Plan
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-center text-indigo-700">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                          Unlimited Responses
                        </li>
                        <li className="flex items-center text-indigo-700">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                          Priority Support
                        </li>
                        <li className="flex items-center text-indigo-700">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                          Advanced Analytics
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <p className="text-lg text-gray-700 mb-3">
                  Ready to upgrade? Contact our team:
                </p>
                <a
                  href="mailto:founders@Interview-up.co"
                  className="text-2xl font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  founders@Interview-up.co
                </a>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </>
  );
}

export default Interviews;
