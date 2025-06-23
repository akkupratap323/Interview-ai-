import Image from "next/image";
import { CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactAudioPlayer from "react-audio-player";
import { Interviewer } from "@/types/interviewer";
import { 
  Star, 
  Users, 
  Award, 
  Heart, 
  MessageSquare, 
  Search, 
  Zap,
  Volume2,
  Play,
  Pause,
  X,
  Sparkles
} from "lucide-react";
import { useState } from "react";

interface Props {
  interviewer: Interviewer | undefined;
}

function InterviewerDetailsModal({ interviewer }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);

  const personalityTraits = [
    { 
      name: "Empathy", 
      value: interviewer?.empathy ?? 0, 
      icon: Heart, 
      color: "text-pink-500",
      bgColor: "bg-pink-50",
      description: "Understanding and compassionate approach"
    },
    { 
      name: "Rapport", 
      value: interviewer?.rapport ?? 0, 
      icon: MessageSquare, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      description: "Building connection and trust"
    },
    { 
      name: "Exploration", 
      value: interviewer?.exploration ?? 0, 
      icon: Search, 
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      description: "Deep questioning and analysis"
    },
    { 
      name: "Speed", 
      value: interviewer?.speed ?? 0, 
      icon: Zap, 
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      description: "Interview pace and efficiency"
    }
  ];

  return (
    <div className="w-[56rem] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-indigo-50 rounded-3xl">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white p-8 rounded-t-3xl">
        <div className="absolute inset-0 bg-black/20 rounded-t-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-white/20 text-white border-white/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Interviewer
            </Badge>
            <Badge className="bg-emerald-500/80 text-white border-0">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
              Active
            </Badge>
          </div>
          
          <CardTitle className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            {interviewer?.name}
          </CardTitle>
          
          <div className="flex items-center gap-6 text-indigo-100">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">4.9 Rating</span>
            </div>
              
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-400" />
              <span className="font-medium">Expert Level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Image and Basic Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <Image
                      src={interviewer?.image || ""}
                      alt={`${interviewer?.name} - AI Interviewer`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                  
                  {/* Floating Stats */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-600">Success Rate</div>
                      <div className="text-lg font-bold text-green-600">96.3%</div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-600">Avg. Duration</div>
                      <div className="text-lg font-bold text-blue-600">28 min</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Player */}
            {interviewer?.audio && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Volume2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Voice Sample</h3>
                      <p className="text-sm text-gray-600">Listen to {interviewer.name}'s voice</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <ReactAudioPlayer 
                      src={`/audio/${interviewer.audio}`} 
                      controls 
                      className="w-full"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description and Details */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  About This Interviewer
                </h3>
                <p className="text-gray-700 leading-relaxed text-justify">
                  {interviewer?.description || "This AI interviewer brings advanced conversational abilities and deep industry expertise to provide comprehensive candidate evaluation."}
                </p>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {["Technical Interviews", "Behavioral Assessment", "Problem Solving", "Communication Skills", "Leadership Evaluation"].map((specialty, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Personality Traits */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Personality Profile</h3>
              <p className="text-gray-600">Understanding {interviewer?.name}'s interview approach and style</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {personalityTraits.map((trait, index) => {
                const IconComponent = trait.icon;
                const percentage = (trait.value / 10) * 100;
                
                return (
                  <div key={index} className="group">
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`w-12 h-12 ${trait.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <IconComponent className={`w-6 h-6 ${trait.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">{trait.name}</h4>
                              <span className="text-lg font-bold text-gray-700">
                                {(trait.value / 10).toFixed(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{trait.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Intensity Level</span>
                            <span>{percentage.toFixed(0)}%</span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full bg-gradient-to-r transition-all duration-1000 ${
                                  trait.color.includes('pink') ? 'from-pink-400 to-pink-600' :
                                  trait.color.includes('blue') ? 'from-blue-400 to-blue-600' :
                                  trait.color.includes('purple') ? 'from-purple-400 to-purple-600' :
                                  'from-orange-400 to-orange-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
       
      </div>
    </div>
  );
}

export default InterviewerDetailsModal;
