"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@clerk/nextjs";
import InterviewCard from "@/components/dashboard/interview/interviewCard";
import CreateInterviewCard from "@/components/dashboard/interview/createInterviewCard";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { InterviewService } from "@/services/interviews.service";
import { ClientService } from "@/services/clients.service";
import { ResponseService } from "@/services/responses.service";
import { useInterviews } from "@/contexts/interviews.context";
import Modal from "@/components/dashboard/Modal";
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
  CheckCircle
} from "lucide-react";
import Image from "next/image";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [sidebarHovered, setSidebarHovered] = useState<boolean>(false);

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

  function InterviewsLoader() {
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
      {/* Screen Overlay - Shows when sidebar is expanded/hovered */}
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

      {/* FIXED: Removed margin-left to attach content to sidebar */}
      <main 
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '64px' : '64px', // Changed from 288px to 256px to match w-64
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section with Job Interview Image */}
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

          {/* Interviews Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Your Interviews</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{interviews.length} total</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            {interviewsLoading || loading ? (
              <InterviewsLoader />
            ) : (
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
                {interviews.map((item) => (
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

            {/* Enhanced Empty State */}
            {!interviewsLoading && !loading && interviews.length === 0 && (
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
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg">
                    Create Interview
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                    View Templates
                  </button>
                </div>
              </div>
            )}
          </div>

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
                  {/* Visual */}
                  <div className="flex justify-center items-center">
                    <Image
                      src="/premium-plan-icon.png"
                      alt="Premium Plan"
                      width={300}
                      height={300}
                      className="rounded-2xl shadow-2xl"
                    />
                  </div>

                  {/* Plans Comparison */}
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
                    href="mailto:founders@folo-up.co"
                    className="text-2xl font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    founders@folo-up.co
                  </a>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </main>
    </>
  );
}

export default Interviews;
