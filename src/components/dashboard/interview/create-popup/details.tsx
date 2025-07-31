import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useInterviewers } from "@/contexts/interviewers.context";
import { InterviewBase, Question } from "@/types/interview";
import { 
  ChevronRight, 
  ChevronLeft, 
  Info,
  FileText,
  Target,
  Clock,
  Users,
  Sparkles,
  Wand2,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  Settings
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import FileUpload from "../fileUpload";
import Modal from "@/components/dashboard/Modal";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { Interviewer } from "@/types/interviewer";
import { useOrganization } from "@clerk/nextjs";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setLoading: (loading: boolean) => void;
  interviewData: InterviewBase;
  setInterviewData: (interviewData: InterviewBase) => void;
  isUploaded: boolean;
  setIsUploaded: (isUploaded: boolean) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

function DetailsPopup({
  open,
  setLoading,
  interviewData,
  setInterviewData,
  isUploaded,
  setIsUploaded,
  fileName,
  setFileName,
}: Props) {
  const { interviewers, interviewersLoading, fetchInterviewers } = useInterviewers();
  
  const { organization } = useOrganization();
  const [isClicked, setIsClicked] = useState(false);
  const [openInterviewerDetails, setOpenInterviewerDetails] = useState(false);
  const [interviewerDetails, setInterviewerDetails] = useState<Interviewer>();
  const [formProgress, setFormProgress] = useState(0);

  const [name, setName] = useState(interviewData.name);
  const [selectedInterviewer, setSelectedInterviewer] = useState(
    interviewData.interviewer_id,
  );
  const [objective, setObjective] = useState(interviewData.objective);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    interviewData.is_anonymous,
  );
  const [numQuestions, setNumQuestions] = useState(
    interviewData.question_count == 0
      ? ""
      : String(interviewData.question_count),
  );
  const [duration, setDuration] = useState(interviewData.time_duration);
  const [uploadedDocumentContext, setUploadedDocumentContext] = useState("");

  // Calculate form completion progress
  useEffect(() => {
    const fields = [name, selectedInterviewer !== "", objective, numQuestions, duration];
    const completed = fields.filter(Boolean).length;
    setFormProgress((completed / fields.length) * 100);
  }, [name, selectedInterviewer, objective, numQuestions, duration]);

  const slideLeft = (id: string, value: number) => {
    const slider = document.getElementById(id);
    if (slider) {
      slider.scrollBy({ left: -value, behavior: 'smooth' });
    }
  };

  const slideRight = (id: string, value: number) => {
    const slider = document.getElementById(id);
    if (slider) {
      slider.scrollBy({ left: value, behavior: 'smooth' });
    }
  };

  const isFormValid = () => {
    return name && objective && numQuestions && duration && selectedInterviewer !== "";
  };

  const onGenerateQuestions = async () => {
    try {
      setIsClicked(true);
      setLoading(true);

      toast.loading("Generating AI-powered questions...", {
        id: "generate-questions",
        description: "This may take a moment",
      });

      const data = {
        name: name.trim(),
        objective: objective.trim(),
        number: numQuestions,
        context: uploadedDocumentContext,
      };

      const generatedQuestions = await axios.post(
        "/api/generate-interview-questions",
        data,
      );

      const generatedQuestionsResponse = JSON.parse(
        generatedQuestions?.data?.response,
      );

      const updatedQuestions = generatedQuestionsResponse.questions.map(
        (question: Question) => ({
          id: uuidv4(),
          question: question.question.trim(),
          follow_up_count: 1,
        }),
      );

      const updatedInterviewData = {
        ...interviewData,
        name: name.trim(),
        objective: objective.trim(),
        questions: updatedQuestions,
        interviewer_id: selectedInterviewer,
        question_count: Number(numQuestions),
        time_duration: duration,
        description: generatedQuestionsResponse.description,
        is_anonymous: isAnonymous,
        organization_id: organization?.id || "",
      };

      setInterviewData(updatedInterviewData);

      toast.success("Questions generated successfully!", {
        id: "generate-questions",
        description: `${updatedQuestions.length} questions created`,
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions", {
        id: "generate-questions",
        description: "Please try again later",
      });
      setIsClicked(false);
      setLoading(false);
    }
  };

  const onManual = () => {
    try {
      setIsClicked(true);
      setLoading(true);

      const updatedInterviewData = {
        ...interviewData,
        name: name.trim(),
        objective: objective.trim(),
        questions: [{ id: uuidv4(), question: "", follow_up_count: 1 }],
        interviewer_id: selectedInterviewer,
        question_count: Number(numQuestions),
        time_duration: String(duration),
        description: "",
        is_anonymous: isAnonymous,
        organization_id: organization?.id || "",
      };

      setInterviewData(updatedInterviewData);

      toast.success("Interview setup complete!", {
        description: "Ready to add custom questions",
      });
    } catch (error) {
      console.error("Error setting up manual interview:", error);
      toast.error("Failed to setup interview", {
        description: "Please try again later",
      });
      setIsClicked(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setName("");
      setSelectedInterviewer("");
      setObjective("");
      setIsAnonymous(false);
      setNumQuestions("");
      setDuration("");
      setIsClicked(false);
      setFormProgress(0);
    }
  }, [open]);

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-[80vh] w-full">
        <div className="w-full max-w-4xl mx-auto p-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Interview Details</h1>
                <p className="text-gray-600 mt-1">Configure your AI interview settings</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Form Progress</span>
                <span>{Math.round(formProgress)}% Complete</span>
              </div>
              <Progress value={formProgress} className="h-2" />
            </div>
          </div>

          <div className="space-y-8">
            {/* Basic Information Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Interview Name */}
                <div className="space-y-2">
                  <Label htmlFor="interview-name" className="text-sm font-semibold text-gray-700">
                    Interview Name *
                  </Label>
                  <Input
                    id="interview-name"
                    type="text"
                    placeholder="e.g., Senior Software Engineer Interview"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={(e) => setName(e.target.value.trim())}
                    className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Objective */}
                <div className="space-y-2">
                  <Label htmlFor="objective" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    Interview Objective *
                  </Label>
                  <Textarea
                    id="objective"
                    value={objective}
                    className="min-h-[120px] text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g., Evaluate candidates' technical skills, problem-solving abilities, and cultural fit for our engineering team."
                    onChange={(e) => setObjective(e.target.value)}
                    onBlur={(e) => setObjective(e.target.value.trim())}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Interviewer Selection */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Users className="w-5 h-5 text-purple-600" />
                  Select AI Interviewer *
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {interviewersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-2 text-gray-600">Loading interviewers...</span>
                  </div>
                ) : interviewers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No interviewers available</p>
                    <p className="text-sm text-gray-500 mb-4">Please create interviewers first</p>
                    <Button
                      onClick={async () => {
                        try {
                          toast.loading('Creating AI interviewers...', { id: 'create-interviewers' });
                          const response = await fetch('/api/init-interviewers', {
                            method: 'POST',
                          });
                          if (response.ok) {
                            toast.success('Default interviewers created successfully', { id: 'create-interviewers' });
                            // Refetch interviewers
                            await fetchInterviewers();
                          } else {
                            const error = await response.json();
                            toast.error(error.error || 'Failed to create interviewers', { id: 'create-interviewers' });
                          }
                        } catch (error) {
                          console.error('Error creating interviewers:', error);
                          toast.error('Error creating interviewers', { id: 'create-interviewers' });
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Default AI Interviewers
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Navigation Buttons */}
                    {interviewers.length > 3 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white border-gray-200"
                        onClick={() => slideLeft("interviewer-slider", 280)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white border-gray-200"
                        onClick={() => slideRight("interviewer-slider", 280)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {/* Interviewers Carousel */}
                  <div className="overflow-hidden px-12">
                    <div
                      id="interviewer-slider"
                      className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth py-4"
                    >
                      {interviewers.map((interviewer) => (
                        <div
                          key={interviewer.id}
                          className="flex-none group cursor-pointer"
                          onClick={() => setSelectedInterviewer(interviewer.id)}
                        >
                          <div className="relative">
                            {/* Info Button */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-2 -right-2 z-20 w-8 h-8 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInterviewerDetails(interviewer);
                                      setOpenInterviewerDetails(true);
                                    }}
                                  >
                                    <Info className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View interviewer details</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Avatar */}
                            <div
                              className={`
                                relative w-32 h-32 rounded-2xl overflow-hidden transition-all duration-300 group-hover:scale-105
                                ${selectedInterviewer === interviewer.id
                                  ? "ring-4 ring-indigo-500 shadow-xl scale-105"
                                  : "ring-2 ring-gray-200 hover:ring-indigo-300"
                                }
                              `}
                            >
                              <Image
                                src={interviewer.image}
                                alt={`${interviewer.name} - AI Interviewer`}
                                fill
                                className="object-cover"
                              />
                              {selectedInterviewer === interviewer.id && (
                                <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                                  <CheckCircle className="w-8 h-8 text-white drop-shadow-lg" />
                                </div>
                              )}
                            </div>

                            {/* Name and Badge */}
                            <div className="mt-3 text-center">
                              <h3 className={`
                                font-semibold transition-colors duration-300
                                ${selectedInterviewer === interviewer.id ? "text-indigo-600" : "text-gray-800"}
                              `}>
                                {interviewer.name}
                              </h3>
                              {selectedInterviewer === interviewer.id && (
                                <Badge className="mt-2 bg-indigo-100 text-indigo-700 border-indigo-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  Interview Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Questions and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="num-questions" className="text-sm font-semibold text-gray-700">
                      Number of Questions *
                    </Label>
                    <Input
                      id="num-questions"
                      type="number"
                      min="1"
                      max="5"
                      placeholder="5"
                      value={numQuestions}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "" || (Number.isInteger(Number(value)) && Number(value) > 0)) {
                          if (Number(value) > 5) value = "5";
                          setNumQuestions(value);
                        }
                      }}
                      className="h-12 text-base text-center border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500">Maximum 5 questions</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
                      Duration (minutes) *
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="10"
                      placeholder="10"
                      value={duration}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (value === "" || (Number.isInteger(Number(value)) && Number(value) > 0)) {
                          if (Number(value) > 10) value = "10";
                          setDuration(value);
                        }
                      }}
                      className="h-12 text-base text-center border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500">Maximum 10 minutes</p>
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-700">
                        Anonymous Responses
                      </Label>
                      <p className="text-xs text-gray-500">
                        When enabled, candidate names and emails won't be collected
                      </p>
                    </div>
                    <Switch
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="w-5 h-5 text-orange-600" />
                  Supporting Documents
                  <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Upload any documents related to the interview (job descriptions, requirements, etc.)
                  </p>
                  <FileUpload
                    isUploaded={isUploaded}
                    setIsUploaded={setIsUploaded}
                    fileName={fileName}
                    setFileName={setFileName}
                    setUploadedDocumentContext={setUploadedDocumentContext}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                disabled={!isFormValid() || isClicked}
                onClick={onGenerateQuestions}
                className="flex-1 h-14 text-base bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {isClicked ? "Generating..." : "Generate AI Questions"}
              </Button>

              <Button
                disabled={!isFormValid() || isClicked}
                variant="outline"
                onClick={onManual}
                className="flex-1 h-14 text-base border-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <Eye className="w-5 h-5 mr-2" />
                Create Manually
              </Button>
            </div>

            {/* Form Validation Status */}
            {!isFormValid() && (
              <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-700">
                  Please fill in all required fields to continue
                </p>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Interviewer Details Modal */}
      <Modal
        open={openInterviewerDetails}
        closeOnOutsideClick={true}
        onClose={() => setOpenInterviewerDetails(false)}
      >
        <InterviewerDetailsModal interviewer={interviewerDetails} />
      </Modal>
    </div>
  );
}

export default DetailsPopup;
