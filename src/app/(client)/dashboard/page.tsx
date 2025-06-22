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
  Search
} from "lucide-react";
import Image from "next/image";

function Interviews() {
  const { interviews, interviewsLoading } = useInterviews();
  const { organization } = useOrganization();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [allowedResponsesCount, setAllowedResponsesCount] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

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

    // Check initial state
    handleSidebarChange();
    
    // Listen for resize events
    window.addEventListener('resize', handleSidebarChange);
    
    // Use MutationObserver to watch for class changes on sidebar
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const observer = new MutationObserver(handleSidebarChange);
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['class', 'style'] 
      });
      
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', handleSidebarChange);
      };
    }

    return () => {
      window.removeEventListener('resize', handleSidebarChange);
    };
  }, []);

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
    <main 
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-72'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    AI Interview Studio
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">
                    Create, manage, and analyze AI-powered interviews with intelligent insights
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search interviews..."
                    className="pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="p-2 bg-white/80 border border-gray-200 rounded-xl hover:bg-white transition-colors">
                  <Filter className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Today</p>
                    <p className="text-2xl font-bold text-blue-900">12</p>
                  </div>
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-medium">Active</p>
                    <p className="text-2xl font-bold text-emerald-900">8</p>
                  </div>
                  <Activity className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Avg Score</p>
                    <p className="text-2xl font-bold text-purple-900">8.4</p>
                  </div>
                  <Star className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Success</p>
                    <p className="text-2xl font-bold text-orange-900">94%</p>
                  </div>
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Interviews</p>
                  <p className="text-3xl font-bold">{interviews.length}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-xs text-blue-200">+12% this month</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Responses Left</p>
                  <p className="text-3xl font-bold">{allowedResponsesCount}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-xs text-emerald-200">Resets monthly</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Current Plan</p>
                  <p className="text-3xl font-bold capitalize">{currentPlan || "Free"}</p>
                  <div className="flex items-center mt-2">
                    <Award className="w-4 h-4 mr-1" />
                    <span className="text-xs text-purple-200">Premium features</span>
                  </div>
                </div>
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
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
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="w-16 h-16 text-indigo-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-4 h-4 text-yellow-800" />
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
  );
}

export default Interviews;
