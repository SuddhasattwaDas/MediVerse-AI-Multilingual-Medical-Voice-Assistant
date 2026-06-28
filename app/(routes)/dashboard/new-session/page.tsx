"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Loader2, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AIDoctorAgents } from "@/shared/list"; // Import your doctor list

// Define the Doctor type (you can move this to a shared types file)
type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt?: string;
  voiceId?: string;
};

function NewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorId = searchParams.get("doctorId");

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Find the selected doctor from the list based on the doctorId
  useEffect(() => {
    if (doctorId) {
      const doctor = AIDoctorAgents.find(d => d.id === parseInt(doctorId, 10));
      if (doctor) {
        setSelectedDoctor(doctor);
      } else {
        setError("Selected doctor not found.");
      }
    }
  }, [doctorId]);

  // 2. Handle the "Start Consultation" click
  const handleStartSession = async () => {
    if (!note.trim()) {
      setError("Please enter a brief note about your symptoms.");
      return;
    }
    if (!selectedDoctor) {
      setError("Doctor not selected. Please go back and try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 3. Call your API to create the session
      const response = await axios.post('/api/session-chat', {
        note: note,
        selectedDoctor: selectedDoctor
      });

      const { sessionId } = response.data;

      // 4. On success, route to the voice agent page
      if (sessionId) {
        // --- THIS IS THE CORRECTED ROUTE ---
        // It now points to your medical-agent page
        router.push(`/dashboard/medical-agent/${sessionId}`);
      } else {
        throw new Error("Failed to create a new session ID.");
      }

    } catch (err) {
      console.error("Failed to create session:", err);
      setError("An error occurred while starting your session. Please try again.");
      setIsLoading(false);
    }
  };

  // Loading state while finding the doctor
  if (!selectedDoctor && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
      </div>
    );
  }

  // Error state if doctorId is invalid
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  // Main component render (once doctor is found)
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-4 md:p-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-orange-200 p-6 md:p-8">
        
        {/* Doctor Info Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 pb-6 border-b border-orange-200">
          <Image
            src={selectedDoctor!.image}
            alt={selectedDoctor!.specialist}
            width={80}
            height={80}
            className="rounded-full border-4 border-orange-200 shadow-md"
          />
          <div>
            <p className="text-sm font-medium text-orange-600 text-center sm:text-left">You are consulting with:</p>
            <h1 className="text-2xl font-bold text-slate-800 text-center sm:text-left">{selectedDoctor!.specialist}</h1>
            <p className="text-slate-600 text-center sm:text-left">{selectedDoctor!.description}</p>
          </div>
        </div>

        {/* Note Input Section */}
        <div className="space-y-4">
          <label htmlFor="symptoms" className="block text-lg font-semibold text-slate-700">
            What are your symptoms?
          </label>
          <p className="text-sm text-slate-500">
            Please provide a brief note (e.g., "I have a cough and fever," "Headache for 2 days")
            to help the AI prepare for your consultation.
          </p>
          <Textarea
            id="symptoms"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your symptoms here..."
            className="min-h-[120px] text-base rounded-xl border-2 border-orange-300 focus-visible:ring-orange-500"
            rows={4}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm mt-4">
            <p>{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleStartSession}
          disabled={isLoading}
          size="lg"
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-7 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[102%] active:scale-[1] transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizonal className="h-5 w-5" />
          )}
          {isLoading ? "Starting Session..." : "Start Consultation"}
        </Button>
      </div>
    </div>
  );
}

export default NewSessionPage;