"use client";

import { useInterviews } from "@/contexts/interviews.context";
import { useEffect, useState } from "react";
import Call from "@/components/call";
import Image from "next/image";
import { Interview } from "@/types/interview";
import LoaderWithText from "@/components/loaders/loader-with-text/loaderWithText";

type Props = {
  params: {
    interviewId: string;
  };
};

type PopupProps = {
  title: string;
  description: string;
  image: string;
};

function PopupLoader() {
  return (
    <div className="bg-white rounded-lg max-w-md mx-auto p-6 border border-gray-200">
      <div className="flex flex-col items-center justify-center space-y-4">
        <LoaderWithText />
      </div>
      <div className="text-center mt-4">
        <span className="text-xs text-gray-500">Powered by InterviewUp</span>
      </div>
    </div>
  );
}

function PopUpMessage({ title, description, image }: PopupProps) {
  return (
    <div className="bg-white rounded-lg max-w-md mx-auto p-6 border border-gray-200">
      <div className="text-center space-y-4">
        <Image
          src={image}
          alt="Graphic"
          width={120}
          height={120}
          className="mx-auto"
        />
        <div>
          <h1 className="text-lg font-medium mb-2">{title}</h1>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
      <div className="text-center mt-4">
        <span className="text-xs text-gray-500">Powered by InterviewUp</span>
      </div>
    </div>
  );
}

function InterviewInterface({ params }: Props) {
  const [interview, setInterview] = useState<Interview>();
  const [isActive, setIsActive] = useState(true);
  const { getInterviewById } = useInterviews();
  const [interviewNotFound, setInterviewNotFound] = useState(false);
  useEffect(() => {
    if (interview) {
      setIsActive(interview?.is_active === true);
    }
  }, [interview, params.interviewId]);

  useEffect(() => {
    const fetchinterview = async () => {
      console.log("🎬 Interview Page - Starting fetch for interviewId:", params.interviewId);
      console.log("🎬 Interview Page - Current URL params:", params);
      
      try {
        // Method 1: Try context
        console.log("🎬 Interview Page - Method 1: Trying context getInterviewById");
        const response = await getInterviewById(params.interviewId);
        console.log("🎬 Interview Page - Context response:", response);
        
        if (response) {
          console.log("✅ Interview Page - Found via context:", response.name);
          setInterview(response);
          document.title = response.name;
          return;
        }
        
        // Method 2: Try direct service call
        console.log("🎬 Interview Page - Method 2: Trying direct service");
        const { InterviewService } = await import("@/services/interviews.service");
        const directResponse = await InterviewService.getInterviewById(params.interviewId);
        console.log("🎬 Interview Page - Direct service response:", directResponse);
        
        if (directResponse) {
          console.log("✅ Interview Page - Found via direct service:", directResponse.name);
          setInterview(directResponse);
          document.title = directResponse.name;
          return;
        }
        
        // Method 3: Try API call
        console.log("🎬 Interview Page - Method 3: Trying API call");
        const apiResponse = await fetch(`/api/test-interview-by-id?id=${encodeURIComponent(params.interviewId)}`);
        const apiData = await apiResponse.json();
        console.log("🎬 Interview Page - API response:", apiData);
        
        if (apiData.success && apiData.interview) {
          console.log("✅ Interview Page - Found via API:", apiData.interview.name);
          setInterview(apiData.interview);
          document.title = apiData.interview.name;
          return;
        }
        
        console.log("❌ Interview Page - All methods failed, showing invalid URL");
        setInterviewNotFound(true);
        
      } catch (error) {
        console.error("❌ Interview Page - Error:", error);
        setInterviewNotFound(true);
      }
    };

    fetchinterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[80vh]">
          {!interview ? (
            interviewNotFound ? (
              <PopUpMessage
                title="Invalid URL"
                description="The interview link you're trying to access is invalid. Please check the URL and try again."
                image="/invalid-url.png"
              />
            ) : (
              <PopupLoader />
            )
          ) : !isActive ? (
            <PopUpMessage
              title="Interview Unavailable"
              description="We are not currently accepting responses. Please contact the sender for more information."
              image="/closed.png"
            />
          ) : (
            <Call interview={interview} />
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewInterface;
