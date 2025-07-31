"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CreateInterviewModal from "@/components/dashboard/interview/createInterviewModal";
import Modal from "@/components/dashboard/Modal";

function CreateInterviewCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        className="group cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 h-48"
        onClick={() => setOpen(true)}
      >
        <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
            <Plus className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Create Interview
          </h3>
          <p className="text-sm text-gray-600">
            Set up a new AI interview to start collecting responses
          </p>
        </CardContent>
      </Card>

      {open && (
        <Modal open={open} onClose={() => setOpen(false)}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateInterviewModal open={open} setOpen={setOpen} />
          </div>
        </Modal>
      )}
    </>
  );
}

export default CreateInterviewCard;
