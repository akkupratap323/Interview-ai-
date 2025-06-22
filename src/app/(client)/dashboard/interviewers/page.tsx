"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Sparkles, 
  Star,
  Award,
  TrendingUp,
  Filter,
  Search,
  Grid3X3,
  List,
  Play,
  CheckCircle
} from "lucide-react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

function Interviewers() {
  const { interviewers, interviewersLoading } = useInterviewers();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      const observer = new MutationObserver(handleSidebarChange);
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['class', 'style'] 
      });
      
      return () => observer.disconnect();
    }
  }, []);

  const slideLeft = () => {
    const slider = document.getElementById("slider");
    if (slider) {
      slider.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const slideRight = () => {
    const slider = document.getElementById("slider");
    if (slider) {
      slider.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  function InterviewersLoader() {
    return (
      <div className="flex space-x-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-64 w-56 flex-none animate-pulse rounded-2xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 shadow-sm"
          />
        ))}
      </div>
    );
  }

  const filteredInterviewers = interviewers.filter(interviewer =>
    interviewer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interviewer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main 
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-72'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Job Interview Image */}
        <div className="mb-12 relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10"></div>
          <Image
            src="/interviewer.jpg"
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
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold">
                  Meet Your AI Interviewers
                </h1>
              </div>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Experience the future of hiring with our intelligent AI interviewers. 
                Each one is designed with unique personalities and expertise to conduct 
                professional, unbiased interviews that reveal true candidate potential.
              </p>
              <div className="flex items-center justify-center gap-6">
                <Button 
                  size="lg" 
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-8 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-5 h-5" />
                  <span>95% Interview Success Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>

       
        {/* Interviewers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchTerm ? `Search Results (${filteredInterviewers.length})` : 'All Interviewers'}
              </h2>
              <p className="text-gray-600 mt-1">
                Click on any interviewer to learn more about their expertise and interview style
              </p>
            </div>
            {interviewers.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {filteredInterviewers.length} available
                </Badge>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Interviewers Display */}
          {interviewersLoading ? (
            <InterviewersLoader />
          ) : (
            <>
              {interviewers.length === 0 ? (
                <div className="text-center py-20">
                  <div className="relative mb-8">
                    <div className="w-48 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                      <Image
                        src="/job interview.jpg"
                        alt="Create Your First Interviewer"
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
                    Create Your First AI Interviewer
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Get started by creating your first AI interviewer with a unique personality and expertise 
                    tailored to your specific hiring needs.
                  </p>
                  <CreateInterviewerButton />
                </div>
              ) : (
                <div className="relative">
                  {/* Scroll Navigation */}
                  {filteredInterviewers.length > 4 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={slideLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white border-gray-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={slideRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white border-gray-200"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {/* Interviewers Container */}
                  <div
                    id="slider"
                    className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-2"
                  >
                    {filteredInterviewers.map((interviewer) => (
                      <div key={interviewer.id} className="flex-none">
                        <InterviewerCard interviewer={interviewer} />
                      </div>
                    ))}
                  </div>

                  {/* No Results */}
                  {searchTerm && filteredInterviewers.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No interviewers found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or browse all interviewers
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setSearchTerm('')}
                        className="mt-4"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Categories Section */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Technical', count: 8, color: 'from-blue-500 to-blue-600', icon: '💻' },
              { name: 'Sales', count: 5, color: 'from-green-500 to-green-600', icon: '💼' },
              { name: 'Marketing', count: 6, color: 'from-purple-500 to-purple-600', icon: '📈' },
              { name: 'HR', count: 4, color: 'from-orange-500 to-orange-600', icon: '👥' }
            ].map((category) => (
              <Card key={category.name} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.count} interviewers</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Interviewers;
