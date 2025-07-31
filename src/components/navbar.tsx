import Link from "next/link";
import React from "react";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { MessageSquare } from "lucide-react";

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section - Logo */}
        <Link 
          href="/dashboard" 
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Interview AI
          </span>
        </Link>

        {/* Right Section - Organization and User */}
        <div className="flex items-center space-x-4">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/dashboard"
            hidePersonal={true}
            afterSelectOrganizationUrl="/dashboard"
            afterLeaveOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                organizationSwitcherTrigger: 
                  "px-3 py-2 rounded-md hover:bg-gray-50 transition-colors border border-gray-200",
                organizationSwitcherTriggerIcon: "text-gray-400",
              },
            }}
          />
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;