import React, { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Eye,
  Shield,
  Clock,
  Target,
  CheckCircle,
  Activity,
} from "lucide-react";

const useTabSwitchPrevention = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [lastSwitchTime, setLastSwitchTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const now = new Date();
        setIsDialogOpen(true);
        setTabSwitchCount((prev) => prev + 1);
        setLastSwitchTime(now);

        // Store in localStorage for persistence
        localStorage.setItem("tabSwitchCount", String(tabSwitchCount + 1));
        localStorage.setItem("lastSwitchTime", now.toISOString());
      }
    };

    // Load existing data from localStorage
    const savedCount = localStorage.getItem("tabSwitchCount");
    const savedTime = localStorage.getItem("lastSwitchTime");

    if (savedCount) setTabSwitchCount(parseInt(savedCount));
    if (savedTime) setLastSwitchTime(new Date(savedTime));

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [tabSwitchCount]);

  const handleUnderstand = () => {
    setIsDialogOpen(false);
  };

  const getSeverityLevel = () => {
    if (tabSwitchCount === 0) return "none";
    if (tabSwitchCount <= 2) return "low";
    if (tabSwitchCount <= 4) return "medium";
    return "high";
  };

  const getSeverityColor = () => {
    const level = getSeverityLevel();
    switch (level) {
      case "low":
        return "from-yellow-500 to-amber-500";
      case "medium":
        return "from-orange-500 to-red-500";
      case "high":
        return "from-red-500 to-red-600";
      default:
        return "from-blue-500 to-indigo-500";
    }
  };

  const getSeverityText = () => {
    const level = getSeverityLevel();
    switch (level) {
      case "low":
        return "Minor Violation";
      case "medium":
        return "Moderate Violation";
      case "high":
        return "Serious Violation";
      default:
        return "No Violations";
    }
  };

  return {
    isDialogOpen,
    tabSwitchCount,
    handleUnderstand,
    lastSwitchTime,
    getSeverityLevel,
    getSeverityColor,
    getSeverityText,
  };
};

function TabSwitchWarning() {
  const {
    isDialogOpen,
    tabSwitchCount,
    handleUnderstand,
    lastSwitchTime,
    getSeverityLevel,
    getSeverityColor,
    getSeverityText,
  } = useTabSwitchPrevention();

  const severityLevel = getSeverityLevel();
  const isFirstViolation = tabSwitchCount === 1;
  const isRepeatedViolation = tabSwitchCount > 1;

  return (
    <AlertDialog open={isDialogOpen}>
      <AlertDialogContent className="max-w-md border-0 shadow-2xl">
        {/* Enhanced Header with Visual Indicators */}
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div
              className={`
              relative p-4 rounded-full bg-gradient-to-r ${getSeverityColor()} shadow-lg
              ${isRepeatedViolation ? "animate-pulse" : ""}
            `}
            >
              <AlertTriangle className="w-8 h-8 text-white" />
              {isRepeatedViolation && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-xs font-bold">
                    {tabSwitchCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-2">
            <AlertDialogTitle className="text-2xl font-bold text-gray-900">
              {isFirstViolation
                ? "Tab Switch Detected"
                : "Multiple Tab Switches Detected"}
            </AlertDialogTitle>

            <div className="flex items-center justify-center gap-2">
              <Badge
                className={`bg-gradient-to-r ${getSeverityColor()} text-white border-0`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {getSeverityText()}
              </Badge>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Enhanced Content */}
        <div className="space-y-6 py-4">
          {/* Warning Message */}
          <AlertDialogDescription className="text-center space-y-3">
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100">
              <p className="text-gray-800 font-medium mb-2">
                {isFirstViolation
                  ? "You have switched away from the interview tab."
                  : "You have switched tabs multiple times during this interview."}
              </p>
              <p className="text-gray-600 text-sm">
                This behavior is being monitored and may impact your interview
                evaluation.
              </p>
            </div>
          </AlertDialogDescription>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="w-4 h-4 text-gray-600 mr-1" />
                <span className="text-xs font-medium text-gray-600">
                  Total Switches
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {tabSwitchCount}
              </p>
            </div>

            {lastSwitchTime && (
              <div className="p-3 bg-gray-50 rounded-xl text-center">
                <div className="flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-gray-600 mr-1" />
                  <span className="text-xs font-medium text-gray-600">
                    Last Switch
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-900">
                  {lastSwitchTime.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-900">
                  Interview Guidelines
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Stay focused on the interview tab</li>
                  <li>• Avoid switching to other applications</li>
                  <li>• Maintain professional conduct throughout</li>
                  {isRepeatedViolation && (
                    <li className="text-red-700 font-medium">
                      • Further violations may result in interview termination
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Severity Warning for Repeated Violations */}
          {severityLevel === "high" && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-red-900">Final Warning</h4>
              </div>
              <p className="text-sm text-red-800">
                You have exceeded the recommended number of tab switches. Please
                remain focused on the interview to avoid potential
                disqualification.
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <AlertDialogFooter className="space-y-3">
          <div className="w-full text-center">
            <p className="text-xs text-gray-500 mb-3">
              <Eye className="w-3 h-3 inline mr-1" />
              This interview is being monitored for integrity
            </p>

            <AlertDialogAction
              className={`
                w-full h-12 text-base font-semibold transition-all duration-300
                bg-gradient-to-r ${getSeverityColor()} hover:shadow-lg
                text-white border-0 hover:scale-105
              `}
              onClick={handleUnderstand}
            >
              <CheckCircle className="w-5 h-5 mr-2" />I Understand - Continue
              Interview
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { TabSwitchWarning, useTabSwitchPrevention };
