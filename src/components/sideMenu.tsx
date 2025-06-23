"use client";

import React, { useState } from "react";
import { 
  PlayCircle, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Sparkles,
  ChevronRight,
  Zap,
  Users,
  Menu
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  isActive: boolean;
  description: string;
  badge?: string;
  color: string;
}

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const menuItems: MenuItemProps[] = [
    {
      icon: PlayCircle,
      label: "Interviews",
      path: "/dashboard",
      isActive: pathname.endsWith("/dashboard") || pathname.includes("/interviews"),
      description: "Manage AI interviews",
      badge: "3",
      color: "text-blue-600"
    },
    {
      icon: MessageSquare,
      label: "Interviewers",
      path: "/dashboard/interviewers",
      isActive: pathname.endsWith("/interviewers"),
      description: "AI interviewer profiles",
      color: "text-purple-600"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      path: "/dashboard/analytics",
      isActive: pathname.endsWith("/analytics"),
      description: "Performance insights",
      badge: "New",
      color: "text-emerald-600"
    },
    {
      icon: Users,
      label: "Responses",
      path: "/dashboard/responses",
      isActive: pathname.endsWith("/responses"),
      description: "Interview responses",
      color: "text-orange-600"
    }
  ];

  const secondaryItems: MenuItemProps[] = [
    {
      icon: Settings,
      label: "Settings",
      path: "/dashboard/settings",
      isActive: pathname.endsWith("/settings"),
      description: "Platform configuration",
      color: "text-gray-600"
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      path: "/help",
      isActive: pathname.endsWith("/help"),
      description: "Get assistance",
      color: "text-gray-600"
    }
  ];

  const MenuItem: React.FC<MenuItemProps> = ({ 
    icon: Icon, 
    label, 
    path, 
    isActive, 
    description, 
    badge, 
    color 
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-auto p-3 mb-1 group relative overflow-hidden",
              isActive 
                ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:from-primary hover:to-primary/90" 
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            )}
            onClick={() => router.push(path)}
          >
            <div className="flex items-center w-full">
              <Icon 
                className={cn(
                  "w-5 h-5 mr-3 transition-all duration-200",
                  isActive ? "text-primary-foreground" : color
                )} 
              />
              <div className={cn(
                "flex flex-col items-start flex-1 min-w-0 transition-all duration-300",
                isHovered ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              )}>
                <div className="flex items-center w-full">
                  <span className={cn(
                    "font-medium text-sm truncate",
                    isActive ? "text-primary-foreground" : ""
                  )}>
                    {label}
                  </span>
                  {badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"} 
                      className={cn(
                        "ml-auto text-xs px-2 py-0.5",
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : ""
                      )}
                    >
                      {badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs opacity-70 truncate w-full text-left",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {description}
                </span>
              </div>
              {isActive && isHovered && (
                <ChevronRight className="w-4 h-4 ml-2 text-primary-foreground/80" />
              )}
            </div>
            
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      {/* Hover trigger area */}
      <div 
        className="fixed top-16 left-0 w-4 h-[calc(100vh-4rem)] z-50 bg-transparent"
        onMouseEnter={() => setIsHovered(true)}
      />
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border z-40 transition-all duration-300 ease-in-out",
          isHovered ? "w-72 translate-x-0" : "w-16 -translate-x-0"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ScrollArea className="h-full">
          <div className="flex flex-col h-full p-3">
            {/* Header */}
            <div className={cn(
              "mb-8 transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Dashboard
                  </h2>
                  <p className="text-sm text-muted-foreground">AI Interview Platform</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-3 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Active</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">12</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Today</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">47</p>
                </div>
              </div>
            </div>

            {/* Collapsed state indicator */}
            {!isHovered && (
              <div className="flex flex-col items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg mb-2">
                  <Menu className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 space-y-6">
              <div>
                {isHovered && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3 transition-all duration-300">
                    Main Menu
                  </h3>
                )}
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <MenuItem key={item.path} {...item} />
                  ))}
                </div>
              </div>

              {isHovered && <Separator className="my-6" />}

              {/* Secondary Navigation */}
              <div>
                {isHovered && (
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3 transition-all duration-300">
                    Account
                  </h3>
                )}
                <div className="space-y-1">
                  {secondaryItems.map((item) => (
                    <MenuItem key={item.path} {...item} />
                  ))}
                </div>
              </div>
            </nav>

            {/* Footer */}
            {isHovered && (
              <div className="mt-auto pt-6 transition-all duration-300">
                {/* Upgrade Card */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">Upgrade to Pro</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Unlock advanced features and unlimited interviews
                      </p>
                      <Button size="sm" className="mt-3 w-full" variant="default">
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Version Info */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs font-medium text-foreground">Version 2.0.1</p>
                    <p className="text-xs text-muted-foreground">Beta Release</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Online
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

export default SideMenu;
