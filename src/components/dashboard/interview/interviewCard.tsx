import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Users, CopyCheck } from "lucide-react";
import { ResponseService } from "@/services/responses.service";
import { toast } from "sonner";

interface Props {
  name: string | null;
  interviewerId: string;
  id: string;
  url: string;
  readableSlug: string;
}

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

function InterviewCard({ name, interviewerId, id, url, readableSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const [responseCount, setResponseCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const responses = await ResponseService.getAllResponses(id);
        setResponseCount(responses.length);
      } catch (error) {
        console.error("Error fetching responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id]);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      console.log("📋 InterviewCard copy - readableSlug:", readableSlug);
      console.log("📋 InterviewCard copy - base_url:", base_url);
      console.log("📋 InterviewCard copy - id:", id);

      const interviewLink = readableSlug
        ? `${base_url}/call/${readableSlug}`
        : `${base_url}/call/${id}`;

      console.log("📋 InterviewCard copy - final link:", interviewLink);

      if (!navigator.clipboard) {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = interviewLink;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } else {
        await navigator.clipboard.writeText(interviewLink);
      }

      setCopied(true);
      toast.success(`Interview link copied!\n${interviewLink}`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("📋 InterviewCard copy failed:", error);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  const openInterview = (e: React.MouseEvent) => {
    e.stopPropagation();

    console.log("🔗 Open interview - readableSlug:", readableSlug);
    console.log("🔗 Open interview - id:", id);

    const interviewUrl = readableSlug ? `/call/${readableSlug}` : `/call/${id}`;

    console.log("🔗 Open interview - final URL:", interviewUrl);
    window.open(interviewUrl, "_blank");
  };

  const handleCardClick = () => {
    window.location.href = `/interviews/${id}`;
  };

  if (loading) {
    return <Card className="h-48 bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <Card
      className="group cursor-pointer border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {name || "Untitled Interview"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {readableSlug || "Custom URL"}
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-2 bg-green-50 text-green-700 border-green-200"
          >
            Active
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{responseCount} responses</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="flex-1 h-8"
          >
            {copied ? (
              <CopyCheck className="w-3 h-3 mr-1" />
            ) : (
              <Copy className="w-3 h-3 mr-1" />
            )}
            {copied ? "Copied" : "Copy Link"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={openInterview}
            className="h-8 px-3"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default InterviewCard;
