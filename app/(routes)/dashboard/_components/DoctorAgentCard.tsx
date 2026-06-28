import React from 'react';
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// 1. BEST PRACTICE: Import this type from a shared file like '@/lib/types'
type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?: string;
};

// 2. FUNCTIONALITY: Added 'onClick' to the props
type Props = {
  doctorAgent: DoctorAgent;
  onClick: () => void; // So the parent component can handle the click
};

// 3. FUNCTIONALITY: Destructure 'onClick' from props
function DoctorAgentCard({ doctorAgent, onClick }: Props) {
  return (
    // 4. ERROR FIX: Replaced hidden ' ' characters with regular spaces in className
    <div className="relative group w-56 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl 
                    bg-gradient-to-br from-orange-900 via-yellow-400 to-amber-300 p-[2px]">
      {/* Inner white card */}
      <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-3">
          <Image
            src={doctorAgent.image}
            alt={doctorAgent.specialist}
            fill
            sizes="(max-width: 768px) 100vw, 250px"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <h2 className="text-lg font-semibold text-gray-800">{doctorAgent.specialist}</h2>
        <p className="line-clamp-2 text-sm text-gray-600 mb-3">{doctorAgent.description}</p>

        <Button
          // 5. FUNCTIONALITY: Added the onClick handler to the button
          onClick={onClick}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all"
        >
          Start Consult
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}

export default DoctorAgentCard;