import React, { useEffect, useState } from "react";
import { useOrganization } from "@clerk/nextjs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
} from "@/components/ui/dialog";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  ArrowLeft,
  Sparkles,
  Wand2,
  Clock,
  Users,
  Target,
  X
} from "lucide-react";
import LoaderWithLogo from "@/components/loaders/loader-with-logo/loaderWithLogo";
import DetailsPopup from "@/components/dashboard/interview/create-popup/details";
import QuestionsPopup from "@/components/dashboard/interview/create-popup/questions";
import { InterviewBase } from "@/types/interview";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateEmptyInterviewData = (): InterviewBase => ({
  user_id: "",
  organization_id: "",
  name: "",
  interviewer_id: BigInt(0),
  objective: "",
  question_count: 0,
  time_duration: "",
  is_anonymous: false,
  questions: [],
  description: "",
  response_count: BigInt(0),
});

function CreateInterviewModal({ open, setOpen }: Props) {
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [proceed, setProceed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [interviewData, setInterviewData] = useState<InterviewBase>(() => {
    const base = CreateEmptyInterviewData();
    return {
      ...base,
      organization_id: organization?.id || "",
    };
  });

  // File Upload States
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const steps = [
    {
      id: 1,
      title: "Interview Details",
      description: "Basic information and settings",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: 2,
      title: "Questions Setup",
      description: "Configure interview questions",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      id: 3,
      title: "Review & Create",
      description: "Final review and creation",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  const getCurrentStepInfo = () => {
    if (loading) return { ...steps[1], title: "Processing", description: "Creating your interview..." };
    if (!proceed) return steps[0];
    return steps[1];
  };

  const getProgressValue = () => {
    if (loading) return 50;
    if (!proceed) return 25;
    return 75;
  };

  useEffect(() => {
    if (loading === true) {
      setLoading(false);
      setProceed(true);
      setCurrentStep(2);
    }
  }, [interviewData]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setProceed(false);
      setCurrentStep(1);
      setInterviewData(() => {
        const base = CreateEmptyInterviewData();
        return {
          ...base,
          organization_id: organization?.id || "",
        };
      });
      setIsUploaded(false);
      setFileName("");
    }
  }, [open]);

  const handleBack = () => {
    if (proceed) {
      setProceed(false);
      setCurrentStep(1);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const currentStepInfo = getCurrentStepInfo();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogOverlay className="bg-black/60 backdrop-blur-sm" />
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="relative bg-white rounded-2xl overflow-hidden">
          {/* Enhanced Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 w-32 h-32 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-4 right-8 w-24 h-24 bg-white rounded-full blur-2xl" />
            </div>
            
            <div className="relative p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Wand2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">Create AI Interview</h1>
                    <p className="text-indigo-100 mt-1">
                      Design your intelligent interview experience
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 h-10 w-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Progress Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <currentStepInfo.icon className={`w-6 h-6 ${currentStepInfo.color}`} />
                    <div>
                      <h2 className="text-xl font-semibold">{currentStepInfo.title}</h2>
                      <p className="text-indigo-100 text-sm">{currentStepInfo.description}</p>
                    </div>
                  </div>
                  
                  <Badge className="bg-white/20 text-white border-white/30">
                    Step {currentStep} of 3
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress 
                    value={getProgressValue()} 
                    className="h-2 bg-white/20"
                  />
                  <div className="flex justify-between text-xs text-indigo-100">
                    <span>Getting Started</span>
                    <span>Almost Done</span>
                    <span>Complete</span>
                  </div>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                        ${currentStep >= step.id 
                          ? 'bg-white text-indigo-600 shadow-lg' 
                          : 'bg-white/20 text-white/60'
                        }
                      `}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`
                          w-12 h-0.5 mx-2 transition-colors duration-300
                          ${currentStep > step.id ? 'bg-white' : 'bg-white/20'}
                        `} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                  <CardContent className="p-12">
                    <div className="text-center space-y-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                          <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-bounce" />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Creating Your AI Interview
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          Our AI is processing your requirements and setting up the perfect interview experience...
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-8 pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Optimizing questions</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>Setting up AI interviewer</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Target className="w-4 h-4" />
                          <span>Finalizing setup</span>
                        </div>
                      </div>

                      <LoaderWithLogo />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="p-8">
                {!proceed ? (
                  <DetailsPopup
                    open={open}
                    setLoading={setLoading}
                    interviewData={interviewData}
                    setInterviewData={setInterviewData}
                    isUploaded={isUploaded}
                    setIsUploaded={setIsUploaded}
                    fileName={fileName}
                    setFileName={setFileName}
                  />
                ) : (
                  <QuestionsPopup
                    interviewData={interviewData}
                    setProceed={setProceed}
                    setOpen={setOpen}
                  />
                )}
              </div>
            )}
          </div>

          {/* Navigation Footer */}
          {!loading && (
            <div className="border-t bg-gray-50/50 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {proceed && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="flex items-center gap-2 hover:bg-gray-100"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Details
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span>Auto-save enabled</span>
                  </div>
                  <div className="w-1 h-4 bg-gray-300 rounded-full" />
                  <span>All changes are saved automatically</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInterviewModal;
