"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Sparkles, 
  Wand2, 
  FileText, 
  Users, 
  Clock,
  Target,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Card
        className={`
          group relative overflow-hidden cursor-pointer transition-all duration-500 ease-out
          h-72 w-64 rounded-2xl border-2 border-dashed
          ${isHovered 
            ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 shadow-2xl scale-105' 
            : 'border-gray-300 bg-white hover:border-indigo-300 hover:shadow-xl hover:scale-[1.02]'
          }
          backdrop-blur-sm
        `}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-8 h-8 bg-indigo-400 rounded-full animate-pulse" />
          <div className="absolute top-16 right-6 w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-12 left-8 w-6 h-6 bg-blue-400 rounded-full animate-pulse delay-700" />
        </div>

        {/* Gradient Overlay on Hover */}
        <div className={`
          absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10 
          opacity-0 group-hover:opacity-100 transition-opacity duration-500
        `} />

        <CardContent className="relative h-full flex flex-col justify-between p-8">
          {/* Top Section - Icon and Badge */}
          <div className="flex flex-col items-center space-y-4">
            {/* Main Icon Container */}
            <div className={`
              relative p-6 rounded-3xl transition-all duration-500
              ${isHovered 
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl scale-110' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-indigo-100 group-hover:to-purple-100'
              }
            `}>
              <Plus 
                className={`
                  w-12 h-12 transition-all duration-500
                  ${isHovered ? 'text-white rotate-90' : 'text-gray-600 group-hover:text-indigo-600'}
                `} 
                strokeWidth={1.5}
              />
              
              {/* Floating Icons */}
              <div className={`
                absolute -top-2 -right-2 transition-all duration-700
                ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
              `}>
                <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-emerald-800" />
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <Badge 
              className={`
                transition-all duration-300 border-0
                ${isHovered 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                }
              `}
            >
              <Wand2 className="w-3 h-3 mr-1" />
              Quick Setup
            </Badge>
          </div>

          {/* Middle Section - Title and Description */}
          <div className="text-center space-y-3">
            <CardTitle className={`
              text-xl font-bold transition-colors duration-300
              ${isHovered 
                ? 'text-indigo-800' 
                : 'text-gray-800 group-hover:text-indigo-700'
              }
            `}>
              Create New Interview
            </CardTitle>
            
            <p className={`
              text-sm leading-relaxed transition-colors duration-300
              ${isHovered 
                ? 'text-indigo-600' 
                : 'text-gray-600 group-hover:text-gray-700'
              }
            `}>
              Design an AI-powered interview experience with custom questions and intelligent analysis
            </p>
          </div>

          {/* Bottom Section - Features */}
          <div className="space-y-4">
            {/* Feature List */}
            <div className={`
              grid grid-cols-2 gap-2 transition-all duration-500
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-70 translate-y-2'}
            `}>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <FileText className="w-3 h-3" />
                <span>Custom Questions</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>AI Analysis</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Time Tracking</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Target className="w-3 h-3" />
                <span>Smart Scoring</span>
              </div>
            </div>

            {/* Call to Action */}
            <div className={`
              flex items-center justify-center text-sm font-medium transition-all duration-300
              ${isHovered 
                ? 'text-indigo-600' 
                : 'text-gray-500 group-hover:text-indigo-600'
              }
            `}>
              <span>Click to get started</span>
              <ArrowRight className={`
                w-4 h-4 ml-2 transition-transform duration-300
                ${isHovered ? 'translate-x-1' : 'group-hover:translate-x-1'}
              `} />
            </div>
          </div>
        </CardContent>

        {/* Shimmer Effect */}
        <div className={`
          absolute inset-0 -top-full bg-gradient-to-b from-transparent via-white/20 to-transparent 
          skew-y-12 transition-all duration-1000
          ${isHovered ? 'top-full' : '-top-full'}
        `} />
      </Card>

      <Modal
        open={open}
        closeOnOutsideClick={false}
        onClose={() => setOpen(false)}
      >
        <CreateInterviewModal open={open} setOpen={setOpen} />
      </Modal>
    </>
  );
}

export default CreateInterviewCard;
