import Link from "next/link";
import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Sparkles, ChevronRight } from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo and Organization */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 group transition-all duration-200 hover:scale-105"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Inter<span className="text-indigo-600">view</span>
                </span>
                <span className="ml-1 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full border border-indigo-200">
                  ai
                </span>
              </div>
            </Link>

            {/* Separator */}
            <div className="hidden sm:flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Organization Switcher */}
            <div className="hidden sm:block">
              <div className="bg-gray-50/80 rounded-lg p-1 border border-gray-200/50">
                <OrganizationSwitcher
                  afterCreateOrganizationUrl="/dashboard"
                  hidePersonal={true}
                  afterSelectOrganizationUrl="/dashboard"
                  afterLeaveOrganizationUrl="/dashboard"
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger: 
                        "px-3 py-2 rounded-md hover:bg-white/80 transition-all duration-200 border-0 shadow-none",
                      organizationSwitcherTriggerIcon: "text-gray-600",
                      organizationPreview: "text-gray-900",
                      organizationSwitcherPopoverCard: 
                        "shadow-xl border border-gray-200 rounded-xl",
                      organizationSwitcherPopoverActionButton: 
                        "hover:bg-gray-50 rounded-lg transition-colors",
                    },
                    variables: {
                      fontSize: "0.875rem",
                      fontWeight: "500" as any,
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Section - User Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Organization Switcher */}
            <div className="sm:hidden">
              <div className="bg-gray-50/80 rounded-lg p-1 border border-gray-200/50">
                <OrganizationSwitcher
                  afterCreateOrganizationUrl="/dashboard"
                  hidePersonal={true}
                  afterSelectOrganizationUrl="/dashboard"
                  afterLeaveOrganizationUrl="/dashboard"
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger: 
                        "px-2 py-2 rounded-md hover:bg-white/80 transition-all duration-200 border-0 shadow-none",
                      organizationSwitcherTriggerIcon: "text-gray-600",
                      organizationPreview: "text-gray-900 text-sm",
                      organizationSwitcherPopoverCard: 
                        "shadow-xl border border-gray-200 rounded-xl",
                    },
                    variables: {
                      fontSize: "0.8rem",
                      fontWeight: "500" as any,
                    },
                  }}
                />
              </div>
            </div>

            {/* User Button */}
            <div className="relative">
              <div className="bg-gray-50/80 rounded-lg p-1 border border-gray-200/50">
                <UserButton 
                  afterSignOutUrl="/sign-in" 
                  signInUrl="/sign-in"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 
                        "w-8 h-8 rounded-md border-2 border-white shadow-sm hover:shadow-md transition-all duration-200",
                      userButtonPopoverCard: 
                        "shadow-xl border border-gray-200 rounded-xl",
                      userButtonPopoverActionButton: 
                        "hover:bg-gray-50 rounded-lg transition-colors",
                    },
                  }}
                />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </nav>
  );
}

export default Navbar;
