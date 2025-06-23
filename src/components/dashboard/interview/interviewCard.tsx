import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  ArrowUpRight, 
  CopyCheck, 
  Users, 
  Play, 
  ExternalLink,
  Star,
  Calendar,
  TrendingUp,
  MessageSquare
} from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import axios from "axios";
import MiniLoader from "@/components/loaders/mini-loader/miniLoader";
import { InterviewerService } from "@/services/interviewers.service";

interface Props {
  name: string | null;
  interviewerId: bigint;
  id: string;
  url: string;
  readableSlug: string;
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewCard({ name, interviewerId, id, url, readableSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [img, setImg] = useState("");
  const [interviewer, setInterviewer] = useState<any>(null);

  useEffect(() => {
    const fetchInterviewer = async () => {
      try {
        const interviewerData = await InterviewerService.getInterviewer(interviewerId);
        setInterviewer(interviewerData);
        setImg(interviewerData.image);
      } catch (error) {
        console.error("Error fetching interviewer:", error);
      }
    };
    fetchInterviewer();
  }, [interviewerId]);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);
        if (responses.length > 0) {
          setIsFetching(true);
          for (const response of responses) {
            if (!response.is_analysed) {
              try {
                const result = await axios.post("/api/get-call", {
                  id: response.call_id,
                });

                if (result.status !== 200) {
                  throw new Error(`HTTP error! status: ${result.status}`);
                }
              } catch (error) {
                console.error(
                  `Failed to call api/get-call for response id ${response.call_id}:`,
                  error,
                );
              }
            }
          }
          setIsFetching(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchResponses();
  }, [id]);

  const copyToClipboard = () => {
    const interviewLink = readableSlug ? `${base_url}/call/${readableSlug}` : (url as string);
    navigator.clipboard
      .writeText(interviewLink)
      .then(
        () => {
          setCopied(true);
          toast.success(
            "Interview link copied! Share it with candidates to start their interview.",
            {
              position: "bottom-right",
              duration: 3000,
            },
          );
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        },
        (err) => {
          console.log("failed to copy", err.message);
          toast.error("Failed to copy link to clipboard");
        },
      );
  };

  const handleJumpToInterview = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    const interviewUrl = readableSlug
      ? `/call/${readableSlug}`
      : `/call/${url}`;
    window.open(interviewUrl, "_blank");
  };

  const handleCardClick = (event: React.MouseEvent) => {
    if (!isFetching) {
      window.location.href = `/interviews/${id}`;
    }
  };

  return (
    <div className="group flex-shrink-0 w-72 mr-4">
      <Card 
        className={`relative cursor-pointer overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1 h-80 rounded-xl ${
          isFetching ? "pointer-events-none opacity-70" : ""
        }`}
        onClick={handleCardClick}
      >
        <CardContent className="p-0 h-full relative">
          {/* Compact Header Section */}
          <div className="relative w-full h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
            
            {/* Status Badge */}
            <div className="absolute top-2 left-2 z-20">
              <Badge className="bg-emerald-500/90 text-white border-0 backdrop-blur-sm text-xs px-2 py-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
                Active
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-2 right-2 z-20 flex gap-1">
              <Button
                className="h-6 w-6 p-0 bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm"
                variant="outline"
                onClick={handleJumpToInterview}
                title="Start Interview"
              >
                <ExternalLink size={12} className="text-white" />
              </Button>
              <Button
                className={`h-6 w-6 p-0 backdrop-blur-sm ${
                  copied 
                    ? "bg-green-500 hover:bg-green-600 border-green-400" 
                    : "bg-white/20 hover:bg-white/30 border-white/30"
                }`}
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  copyToClipboard();
                }}
                title="Copy Interview Link"
              >
                {copied ? (
                  <CopyCheck size={12} className="text-white" />
                ) : (
                  <Copy size={12} className="text-white" />
                )}
              </Button>
            </div>

            {/* Interview Title */}
            <div className="absolute bottom-2 left-2 right-2 z-20">
              <CardTitle className="text-white text-sm font-bold line-clamp-2">
                {name}
                {isFetching && (
                  <div className="inline-block ml-1">
                    <MiniLoader />
                  </div>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{responseCount || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>4.8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Content Section */}
          <div className="p-3 flex flex-col justify-between h-48">
            {/* Interviewer Info */}
            <div className="flex items-start gap-2 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm">
                  {img ? (
                    <Image
                      src={img}
                      alt="Picture of the interviewer"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {interviewer?.name || "AI Interviewer"}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {interviewer?.description || "Specialized AI interviewer"}
                </p>
              </div>
            </div>

            {/* Compact Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200/50">
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Interviews</p>
                    <p className="text-sm font-bold text-blue-900">{responseCount || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-2 rounded-lg border border-green-200/50">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Success</p>
                    <p className="text-sm font-bold text-green-900">94%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact CTA Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-2 rounded-lg border border-indigo-200/50">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="w-3 h-3 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-indigo-900 mb-1">
                    Ready to Interview?
                  </h4>
                  <p className="text-xs text-indigo-700 mb-2 line-clamp-2">
                    Share link with candidates for instant interviews.
                  </p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="h-6 px-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard();
                      }}
                    >
                      <Copy className="w-2 h-2 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      onClick={handleJumpToInterview}
                    >
                      <ExternalLink className="w-2 h-2 mr-1" />
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Calendar className="w-3 h-3" />
                <span>Recent</span>
              </div>
              
              <div className="flex items-center gap-1 text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <span className="text-xs font-medium">Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isFetching && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
              <div className="text-center">
                <MiniLoader />
                <p className="text-xs text-gray-600 mt-1">Processing...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InterviewCard;
