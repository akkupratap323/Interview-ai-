"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React, { useState } from "react";
import { 
  Users, 
  Search,
  Plus
} from "lucide-react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInterviewers = interviewers.filter(interviewer =>
    interviewer.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-64 bg-gray-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No interviewers yet
      </h3>
      <p className="text-gray-600 mb-6">
        Create your first AI interviewer to get started.
      </p>
      <CreateInterviewerButton />
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interviewers</h1>
              <p className="text-gray-600">Manage your AI interviewers</p>
            </div>
            <CreateInterviewerButton />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Interviewers</p>
                    <p className="text-2xl font-bold text-gray-900">{interviewers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-gray-900">{interviewers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">95%</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          {interviewers.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search interviewers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {interviewersLoading ? (
          <LoadingSkeleton />
        ) : interviewers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterviewers.map((interviewer) => (
              <InterviewerCard
                key={interviewer.id}
                interviewer={interviewer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Interviewers;