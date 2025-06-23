"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React from "react";
import { 
  Users, 
  Search,
  Star,
  TrendingUp,
  Brain,
  Target,
  Briefcase,
  MessageSquare
} from "lucide-react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();

  function InterviewersLoader() {
    return (
      <div className="flex space-x-6">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-64 w-56 flex-none animate-pulse rounded-2xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 shadow-sm"
          />
        ))}
      </div>
    );
  }

  // Show only first 2 interviewers
  const displayedInterviewers = interviewers.slice(0, 2);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Simple Header */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    AI Interviewers
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Meet our intelligent AI interviewers
                  </p>
                </div>
              </div>

              {/* Simple Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search interviewers..."
                  className="pl-10 pr-4 py-2 bg-white/80 border border-gray-200 rounded-xl w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Interview Platform Showcase with Image */}
        <div className="mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-48 translate-x-48" />
            <CardContent className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 mb-4">
                    <Star className="w-3 h-3 mr-1" />
                    AI-Powered Interviews
                  </Badge>
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Next-Generation Interview Experience
                  </h3>
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                    Experience the future of hiring with our advanced AI interviewers. 
                    Each interviewer is designed with unique personalities and specialized expertise.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Smart Analysis</p>
                        <p className="text-xs text-gray-400">Real-time insights</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Precise Scoring</p>
                        <p className="text-xs text-gray-400">Accurate evaluation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Role-Specific</p>
                        <p className="text-xs text-gray-400">Tailored questions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Natural Flow</p>
                        <p className="text-xs text-gray-400">Human-like conversation</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Image Display */}
                <div className="relative">
                  <div className="relative w-full h-80 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
                    <Image
                      src="/interviewer.jpg"
                      alt="AI Interview Platform"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-white text-sm font-medium">Live Interview Session</span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm font-medium">4.9/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Stats */}
                  <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Success Rate</p>
                        <p className="text-lg font-bold text-green-600">94.7%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviewers Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Available Interviewers
            </h2>
            <p className="text-gray-600">
              Choose from our specialized AI interviewers
            </p>
          </div>

          {/* Interviewers Display */}
          {interviewersLoading ? (
            <InterviewersLoader />
          ) : interviewers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Create Your First AI Interviewer
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first AI interviewer with unique expertise.
              </p>
              <CreateInterviewerButton />
            </div>
          ) : (
            <div className="flex space-x-6 justify-center">
              {displayedInterviewers.map((interviewer) => (
                <div key={interviewer.id} className="flex-none">
                  <InterviewerCard interviewer={interviewer} />
                </div>
              ))}
            </div>
          )}

          {/* Show Create Button if interviewers exist */}
          {interviewers.length > 0 && (
            <div className="text-center mt-8">
              <CreateInterviewerButton />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Interviewers;
