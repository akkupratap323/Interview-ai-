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
    <div className="bg-white border border-gray-100 rounded-lg p-6 mb-4">
      <div className="flex items-start gap-4">
        {/* Question Number Badge */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-medium text-sm">
              {questionNumber}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Question */}
          <div className="mb-4">
            <h3 className="text-gray-900 font-medium text-base leading-relaxed">
              {question}
            </h3>
          </div>

          {/* Answer */}
          <div className="bg-gray-50 rounded-lg p-4 border-l-2 border-gray-300">
            <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuestionAnswerCard;
