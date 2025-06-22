"use client";

import React from "react";
import { PlayCircleIcon, SpeechIcon, BarChart3, Settings, HelpCircle, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      icon: PlayCircleIcon,
      label: "Interviews",
      path: "/dashboard",
      isActive: pathname.endsWith("/dashboard") || pathname.includes("/interviews"),
      description: "Manage AI interviews"
    },
    {
      icon: SpeechIcon,
      label: "Interviewers",
      path: "/dashboard/interviewers",
      isActive: pathname.endsWith("/interviewers"),
      description: "AI interviewer profiles"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/dashboard/analytics",
      isActive: pathname.endsWith("/analytics"),
      description: "Performance insights"
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
      isActive: pathname.endsWith("/settings"),
      description: "Platform configuration"
    }
  ];

  const MenuItem = ({ icon: Icon, label, path, isActive, description }) => (
    <div
      className={`
        group relative flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
        ${isActive 
          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200" 
          : "hover:bg-white/80 hover:shadow-md text-gray-700 hover:text-gray-900"
        }
      `}
      onClick={() => router.push(path)}
    >
      <Icon 
        className={`w-5 h-5 mr-3 transition-all duration-200 ${
          isActive ? "text-white" : "text-gray-500 group-hover:text-indigo-500"
        }`} 
      />
      <div className="flex flex-col">
        <p className={`font-medium text-sm ${isActive ? "text-white" : ""}`}>
          {label}
        </p>
        <p className={`text-xs opacity-75 ${isActive ? "text-indigo-100" : "text-gray-500"}`}>
          {description}
        </p>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80"></div>
      )}
    </div>
  );

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-gradient-to-b from-gray-50 to-gray-100/50 backdrop-blur-sm border-r border-gray-200/50 z-40">
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          </div>
          <p className="text-sm text-gray-600">AI Interview Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <MenuItem key={item.path} {...item} />
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-200/50">
          <div
            className="flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white/80 hover:shadow-md text-gray-700 hover:text-gray-900"
            onClick={() => router.push("/help")}
          >
            <HelpCircle className="w-5 h-5 mr-3 text-gray-500" />
            <div className="flex flex-col">
              <p className="font-medium text-sm">Help & Support</p>
              <p className="text-xs text-gray-500">Get assistance</p>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-700">Version 2.0</p>
              <p className="text-xs text-indigo-600">Beta Release</p>
            </div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SideMenu;
