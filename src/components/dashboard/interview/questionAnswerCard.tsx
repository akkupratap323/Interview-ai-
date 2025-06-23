import { CardTitle } from "@/components/ui/card";

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  answer: string;
}

function QuestionAnswerCard({
  questionNumber,
  question,
  answer,
}: QuestionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-4 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Question Number Badge */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {questionNumber}
              </span>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Question */}
            <div className="mb-3">
              <h3 className="text-gray-900 font-semibold text-base leading-relaxed">
                {question}
              </h3>
            </div>
            
            {/* Answer */}
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
              <p className="text-gray-700 text-sm leading-relaxed">
                {answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionAnswerCard;
