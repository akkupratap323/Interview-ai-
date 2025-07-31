"use client";

import { useInterviews } from "@/contexts/interviews.context";
import { useEffect, useState } from "react";
import Call from "@/components/call";
import Image from "next/image";
import { ArrowUpRightSquareIcon } from "lucide-react";
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
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] justify-center items-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all md:block dark:border-white">
        <div className="relative flex flex-col items-center justify-center h-full">
          <LoaderWithText />
        </div>
      </div>
      <a
        className="flex flex-row justify-center align-middle mt-3"
        href="https://Interview-up.co/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="text-center text-md font-semibold mr-2">
          Powered by{" "}
          <span className="font-bold">
            Interview<span className="text-indigo-600">Up</span>
          </span>
        </div>
        <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
      </a>
    </div>
  );
}

function PopUpMessage({ title, description, image }: PopupProps) {
  return (
    <div className="bg-white rounded-md absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 md:w-[80%] w-[90%]">
      <div className="h-[88vh] content-center rounded-lg border-2 border-b-4 border-r-4 border-black font-bold transition-all  md:block dark:border-white ">
        <div className="flex flex-col items-center justify-center my-auto">
          <Image
            src={image}
            alt="Graphic"
            width={200}
            height={200}
            className="mb-4"
          />
          <h1 className="text-md font-medium mb-2">{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <a
        className="flex flex-row justify-center align-middle mt-3"
        href="https://Interview-up.co/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className="text-center text-md font-semibold mr-2">
          Powered by{" "}
          <span className="font-bold">
            Interview<span className="text-indigo-600">Up</span>
          </span>
        </div>
        <ArrowUpRightSquareIcon className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
      </a>
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
    <div>
      <div className="hidden md:block p-8 mx-auto form-container">
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
            title="Interview Is Unavailable"
            description="We are not currently accepting responses. Please contact the sender for more information."
            image="/closed.png"
          />
        ) : (
          <Call interview={interview} />
        )}
      </div>
      <div className=" md:hidden flex flex-col items-center md:h-[0px] justify-center  my-auto">
        <div className="mt-48 px-3">
          <p className="text-center my-5 text-md font-semibold">
            {interview?.name}
          </p>
          <p className="text-center text-gray-600 my-5">
            Please use a PC to respond to the interview. Apologies for any
            inconvenience caused.{" "}
          </p>
        </div>
        <div className="text-center text-md font-semibold mr-2 my-5">
          Powered by{" "}
          <a
            className="font-bold underline"
            href="www.Interview-up.co"
            target="_blank"
          >
            Interview<span className="text-indigo-600">Up</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default InterviewInterface;
