"use client";

import React from "react";
import Image from "next/image";

type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt?: string;
  voiceId?: string;
};

interface SuggestedDoctorCardProps {
  doctorAgent: DoctorAgent;
  setSelectedDoctor: (doctor: DoctorAgent) => void;
  selectedDoctor: DoctorAgent | null;
}

const SuggestedDoctorCard = ({
  doctorAgent,
  setSelectedDoctor,
  selectedDoctor,
}: SuggestedDoctorCardProps) => {
  const isSelected = selectedDoctor?.id === doctorAgent.id;

  return (
    <div
      onClick={() => setSelectedDoctor(doctorAgent)}
      className={`
        flex flex-col items-center p-4 border rounded-xl shadow-sm
        cursor-pointer transition-all duration-300 ease-in-out
        ${isSelected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300 transform scale-105"
          : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-lg"
        }
      `}
    >
      <Image
        src={doctorAgent.image}
        alt={doctorAgent.specialist}
        width={80}
        height={80}
        className="w-20 h-20 rounded-full object-cover mb-3"
      />
      <h2 className="font-bold text-base text-center text-gray-900">
        {doctorAgent.specialist}
      </h2>
      <p className="text-xs text-center line-clamp-2 text-gray-600 mt-1">
        {doctorAgent.description}
      </p>
    </div>
  );
};

export default SuggestedDoctorCard;
