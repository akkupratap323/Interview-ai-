import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Modal from "@/components/dashboard/Modal";
import { Interviewer } from "@/types/interviewer";
import InterviewerDetailsModal from "@/components/dashboard/interviewer/interviewerDetailsModal";
import { 
  Star, 
  Users, 
  Award, 
  Sparkles, 
  Eye,
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface Props {
  interviewer: Interviewer;
}

const InterviewerCard = ({ interviewer }: Props) => {
  const [open, setOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <>
      <Card
        className="group relative cursor-pointer overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 w-72 h-96 rounded-2xl"
        onClick={() => setOpen(true)}
      >
        <CardContent className="p-0 h-full relative">
          {/* Image Section with Overlay */}
          <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
            
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
            )}
            
            <Image
              src={interviewer.image}
              alt={`${interviewer.name} - AI Interviewer`}
              fill
              className={`object-cover object-center transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-20">
              <Badge className="bg-emerald-500/90 text-white border-0 backdrop-blur-sm">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                Active
              </Badge>
            </div>
            
            {/* Rating Badge */}
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">4.9</span>
              </div>
            </div>
            
          
           
          </div>

          {/* Content Section */}
          <div className="p-6 flex flex-col justify-between h-48">
            <div>
              {/* Name and Title */}
              <div className="mb-3">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {interviewer.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {interviewer.description || "Specialized AI interviewer with advanced evaluation capabilities"}
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">1.2k</span>
                  <span>interviews</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium">96%</span>
                  <span>success</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {["AI", "Datascience", "Fullstack"].map((skill, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-600 font-medium">Expert</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-600 font-medium">Conversational</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-indigo-600 group-hover:text-indigo-700 transition-colors">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View Details</span>
              </div>
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
          
          {/* Sparkle Effect */}
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </div>
        </CardContent>
      </Card>

      <Modal
        open={open}
        closeOnOutsideClick={true}
        onClose={() => setOpen(false)}
      >
        <InterviewerDetailsModal interviewer={interviewer} />
      </Modal>
    </>
  );
};

export default InterviewerCard;
