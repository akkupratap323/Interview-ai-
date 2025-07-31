import { Loader2, Sparkles } from "lucide-react";

interface LoaderWithTextProps {
  message?: string;
  description?: string;
}

function LoaderWithText({
  message = "Loading",
  description = "Please wait while we prepare your content",
}: LoaderWithTextProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{message}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="mt-8 flex space-x-1">
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
}

export default LoaderWithText;
