"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  Users,
  BarChart3, 
  Settings
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  isActive: boolean;
}

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const menuItems: MenuItemProps[] = [
    {
      icon: MessageSquare,
      label: "Interviews",
      path: "/dashboard",
      isActive: pathname.endsWith("/dashboard") || pathname.includes("/interviews"),
    },
    {
      icon: Users,
      label: "Interviewers",
      path: "/dashboard/interviewers",
      isActive: pathname.includes("/interviewers"),
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/analytics",
      isActive: pathname.includes("/analytics"),
    },
    {
      icon: Settings,
      label: "Settings",
      path: "/settings",
      isActive: pathname.includes("/settings"),
    }
  ];

  const MenuItem = ({ icon: Icon, label, path, isActive }: MenuItemProps) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      className={cn(
        "w-full justify-start h-10 px-3",
        isActive 
          ? "bg-blue-600 text-white hover:bg-blue-700" 
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        isCollapsed && "px-2"
      )}
      onClick={() => router.push(path)}
    >
      <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Button>
  );

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-gray-200 px-3 py-4",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-gray-900">
                Interview AI
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => (
            <MenuItem key={item.path} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-gray-200 p-3",
          isCollapsed && "px-2"
        )}>
          <div className={cn(
            "text-xs text-gray-500",
            isCollapsed && "text-center"
          )}>
            {isCollapsed ? "v1.0" : "Interview AI v1.0"}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default SideMenu;