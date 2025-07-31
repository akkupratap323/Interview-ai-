"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InterviewerService } from "@/services/interviewers.service";
import axios from "axios";
import { Plus, Loader2, Sparkles, Users, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

function CreateInterviewerButton() {
  const [isLoading, setIsLoading] = useState(false);

  const createInterviewers = async () => {
    try {
      setIsLoading(true);

      // Show loading toast
      toast.loading("Creating AI interviewers...", {
        id: "create-interviewers",
        description: "This may take a few moments",
      });

      const response = await axios.get("/api/create-interviewer", {});
      console.log(response);

      // Refresh the interviewers list
      await InterviewerService.getAllInterviewers();

      // Show success toast
      toast.success("AI Interviewers Created!", {
        id: "create-interviewers",
        description:
          "Two default interviewers have been added to your collection",
        duration: 4000,
      });
    } catch (error) {
      console.error("Error creating interviewers:", error);
      toast.error("Failed to create interviewers", {
        id: "create-interviewers",
        description: "Please try again later",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`
        group relative overflow-hidden border-2 border-dashed 
        ${
          isLoading
            ? "border-indigo-300 bg-indigo-50/50 cursor-not-allowed"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 cursor-pointer"
        }
        transition-all duration-300 ease-in-out
        hover:scale-[1.02] hover:shadow-xl
        h-64 w-56 rounded-2xl shrink-0
        backdrop-blur-sm
      `}
      onClick={!isLoading ? createInterviewers : undefined}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 w-8 h-8 bg-indigo-400 rounded-full animate-pulse" />
        <div className="absolute top-12 right-6 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-8 left-6 w-6 h-6 bg-blue-400 rounded-full animate-pulse delay-700" />
      </div>

      <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
        {/* Top Section - Icon and Status */}
        <div className="flex flex-col items-center space-y-4">
          {/* Icon Container */}
          <div
            className={`
            relative p-4 rounded-2xl transition-all duration-300
            ${
              isLoading
                ? "bg-indigo-100 border-2 border-indigo-200"
                : "bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-transparent group-hover:border-indigo-200 group-hover:shadow-lg"
            }
          `}
          >
            {isLoading ? (
              <div className="relative">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="relative group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-indigo-600 group-hover:text-indigo-700" />
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Wand2 className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            )}
          </div>

          {/* Status Badge */}
          {isLoading && (
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Creating...
            </Badge>
          )}
        </div>

        {/* Middle Section - Title */}
        <div className="text-center space-y-2">
          <h3
            className={`
            font-semibold text-lg leading-tight transition-colors duration-300
            ${
              isLoading
                ? "text-indigo-600"
                : "text-gray-800 group-hover:text-indigo-700"
            }
          `}
          >
            {isLoading ? "Creating AI Interviewers" : "Quick Setup"}
          </h3>

          <p
            className={`
            text-sm leading-relaxed transition-colors duration-300
            ${
              isLoading
                ? "text-indigo-500"
                : "text-gray-600 group-hover:text-gray-700"
            }
          `}
          >
            {isLoading
              ? "Setting up your intelligent interview assistants..."
              : "Create two default AI interviewers to get started quickly"}
          </p>
        </div>

        {/* Bottom Section - Features */}
        <div className="space-y-3">
          {!isLoading && (
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>2 Interviewers</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Powered</span>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isLoading && (
            <div className="w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"
                style={{ width: "70%" }}
              />
            </div>
          )}

          {/* Call to Action */}
          <div
            className={`
            text-center text-xs font-medium transition-all duration-300
            ${
              isLoading
                ? "text-indigo-600"
                : "text-gray-500 group-hover:text-indigo-600"
            }
          `}
          >
            {isLoading ? "Please wait..." : "Click to create"}
          </div>
        </div>
      </CardContent>

      {/* Hover Effect Overlay */}
      {!isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      )}
    </Card>
  );
}

export default CreateInterviewerButton;
