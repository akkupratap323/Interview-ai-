"use client";

import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Image as LucideImage,
  Plus,
  Sparkles,
  Settings,
  User,
  Save,
  X,
  Wand2,
  Brain,
  Heart,
  Zap,
  Search,
} from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import Modal from "@/components/dashboard/Modal";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { avatars } from "@/components/dashboard/interviewer/avatars";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInterviewers } from "@/contexts/interviewers.context";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

const CreateInterviewerCard = () => {
  const [open, setOpen] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [name, setName] = useState("");
  const [empathy, setEmpathy] = useState(0.4);
  const [rapport, setRapport] = useState(0.7);
  const [exploration, setExploration] = useState(0.2);
  const [speed, setSpeed] = useState(0.9);
  const [image, setImage] = useState("");
  const [avatarSearch, setAvatarSearch] = useState("");
  const { createInterviewer } = useInterviewers();
  const { user } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmpathy(0.4);
      setRapport(0.7);
      setExploration(0.2);
      setSpeed(0.9);
      setImage("");
      setAvatarSearch("");
    }
  }, [open]);

  const onSave = async () => {
    try {
      setIsLoading(true);

      toast.loading("Creating your AI interviewer...", {
        id: "create-interviewer",
        description: "This may take a moment",
      });

      await createInterviewer({
        name: name,
        empathy: empathy * 10,
        rapport: rapport * 10,
        exploration: exploration * 10,
        speed: speed * 10,
        user_id: user?.id,
        image: image,
      });

      toast.success("AI Interviewer Created!", {
        id: "create-interviewer",
        description: `${name} is ready to conduct interviews`,
        duration: 4000,
      });

      setOpen(false);
    } catch (error) {
      console.error("Error creating interviewer:", error);
      toast.error("Failed to create interviewer", {
        id: "create-interviewer",
        description: "Please try again later",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalityDescription = () => {
    const traits = [];
    if (empathy > 0.7) traits.push("Highly empathetic");
    else if (empathy > 0.4) traits.push("Moderately empathetic");
    else traits.push("Direct and focused");

    if (rapport > 0.7) traits.push("Great at building rapport");
    if (exploration > 0.7) traits.push("Deep question explorer");
    if (speed > 0.7) traits.push("Fast-paced interviewer");

    return traits.join(" • ");
  };

  const filteredAvatars = avatars.filter(
    (avatar) =>
      !avatarSearch ||
      avatar.id.toString().includes(avatarSearch.toLowerCase()),
  );

  const getSliderColor = (value: number) => {
    if (value < 0.3) return "from-red-400 to-red-500";
    if (value < 0.7) return "from-yellow-400 to-orange-500";
    return "from-green-400 to-emerald-500";
  };

  return (
    <>
      {/* Trigger Button */}
      <div
        className="group relative cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group-hover:from-indigo-600 group-hover:to-purple-700">
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-3 h-3 text-emerald-800" />
        </div>
      </div>

      {/* Main Creation Modal */}
      <Modal
        open={open}
        closeOnOutsideClick={!isLoading}
        onClose={() => !isLoading && setOpen(false)}
      >
        <div className="w-[900px] max-w-[90vw] max-h-[90vh] overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      Create AI Interviewer
                    </CardTitle>
                    <p className="text-gray-600 mt-1">
                      Design a unique AI personality for your interviews
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => !isLoading && setOpen(false)}
                  disabled={isLoading}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Avatar and Basic Info */}
                <div className="space-y-6">
                  {/* Avatar Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Choose Avatar
                    </Label>
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setGallery(true)}
                    >
                      <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden hover:border-indigo-400 transition-colors duration-300 bg-gradient-to-br from-gray-50 to-gray-100">
                        {image ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={image}
                              alt="Selected avatar"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-xl p-3">
                                <LucideImage className="w-6 h-6 text-gray-700" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors duration-300">
                            <LucideImage
                              className="w-16 h-16 mb-3"
                              strokeWidth={1}
                            />
                            <p className="text-sm font-medium">
                              Click to select avatar
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Choose from our gallery
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Interviewer Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g., Sarah the Technical Expert"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Personality Preview */}
                  {name && (
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-indigo-600" />
                        Personality Preview
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getPersonalityDescription()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Personality Settings */}
                <div className="space-y-6">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Personality Configuration
                    </Label>
                    <p className="text-xs text-gray-500">
                      Adjust these settings to define your interviewer's
                      behavior
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Empathy Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          Empathy Level
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {(empathy * 10).toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[empathy]}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => setEmpathy(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Direct</span>
                          <span>Balanced</span>
                          <span>Highly Empathetic</span>
                        </div>
                      </div>
                    </div>

                    {/* Rapport Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500" />
                          Rapport Building
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {(rapport * 10).toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[rapport]}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => setRapport(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Formal</span>
                          <span>Friendly</span>
                          <span>Very Warm</span>
                        </div>
                      </div>
                    </div>

                    {/* Exploration Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Search className="w-4 h-4 text-green-500" />
                          Question Depth
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {(exploration * 10).toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[exploration]}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => setExploration(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Surface</span>
                          <span>Moderate</span>
                          <span>Deep Dive</span>
                        </div>
                      </div>
                    </div>

                    {/* Speed Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          Interview Pace
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {(speed * 10).toFixed(1)}/10
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[speed]}
                          max={1}
                          step={0.1}
                          onValueChange={(value) => setSpeed(value[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Relaxed</span>
                          <span>Steady</span>
                          <span>Fast-Paced</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSave}
                  disabled={!name || !image || isLoading}
                  className="px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Interviewer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Modal>

      {/* Avatar Gallery Modal */}
      <Modal
        open={gallery}
        closeOnOutsideClick={true}
        onClose={() => setGallery(false)}
      >
        <div className="w-[600px] max-w-[90vw] max-h-[80vh]">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <LucideImage className="w-5 h-5 text-indigo-600" />
                  Choose Avatar
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setGallery(false)}
                  className="hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search avatars..."
                  value={avatarSearch}
                  onChange={(e) => setAvatarSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-3 gap-4 p-2">
                  {filteredAvatars.map((avatar) => (
                    <div
                      key={avatar.id}
                      className="group relative cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                      onClick={() => {
                        setImage(avatar.img);
                        setGallery(false);
                      }}
                    >
                      <div className="aspect-square relative">
                        <Image
                          alt="avatar option"
                          fill
                          src={avatar.img}
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
                {filteredAvatars.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <LucideImage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No avatars found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </Modal>
    </>
  );
};

export default CreateInterviewerCard;
