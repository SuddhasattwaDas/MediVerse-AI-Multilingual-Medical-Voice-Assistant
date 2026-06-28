"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, LoaderCircle } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import SuggestedDoctorCard from "./SuggestedDoctorCard";

type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt?: string;
  voiceId?: string;
};

function extractAxiosError(error: unknown): string {
  const axiosError = error as AxiosError<{ error?: string }>;
  return axiosError.response?.data?.error || axiosError.message || "Unexpected error occurred.";
}

function AddNewSessionDialog() {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<DoctorAgent[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorAgent | null>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleNextClick = async () => {
    if (!note.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await axios.post("/api/suggest-doctors", { note });
      if (result.data && result.data.length > 0) {
        setSuggestedDoctors(result.data);
        setStep(2);
      } else {
        setError("No relevant specialists found. Please try again.");
      }
    } catch (err) {
      setError(extractAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    if (!selectedDoctor) return setError("Select a doctor first.");
    setLoading(true);
    setError(null);

    try {
      const result = await axios.post("/api/session-chat", {
        note,
        selectedDoctor,
      });
      if (result.data?.sessionId) {
        router.push(`/dashboard/medical-agent/${result.data.sessionId}`);
      } else {
        setError("Failed to start session. Please try again.");
      }
    } catch (err) {
      setError(extractAxiosError(err));
    } finally {
      setLoading(false);
    }
  };

  const resetDialogState = () => {
    setStep(1);
    setNote("");
    setSuggestedDoctors([]);
    setSelectedDoctor(null);
    setError(null);
    setLoading(false);
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && resetDialogState()}>
      <DialogTrigger asChild>
        <Button className="mt-3">+ Start a New Consultation</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px]">
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle>Start a New Consultation</DialogTitle>
              <DialogDescription>
                Describe your symptoms. AI will suggest the right specialists.
              </DialogDescription>
            </DialogHeader>

            <Textarea
              placeholder="e.g., I have a persistent cough and a slight fever..."
              className="h-[200px] mt-1"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={resetDialogState}>Cancel</Button>
              <Button disabled={!note || loading} onClick={handleNextClick}>
                {loading ? <LoaderCircle className="animate-spin" /> : "Next"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle>Select a Specialist</DialogTitle>
              <DialogDescription>
                Based on your symptoms, we suggest the following specialists.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto p-1">
              {suggestedDoctors.map((doctor) => (
                <SuggestedDoctorCard
                  key={doctor.id}
                  doctorAgent={doctor}
                  setSelectedDoctor={setSelectedDoctor}
                  selectedDoctor={selectedDoctor}
                />
              ))}
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>
                Back
              </Button>
              <Button disabled={!selectedDoctor || loading} onClick={handleStartConsultation}>
                {loading ? <LoaderCircle className="animate-spin" /> : "Start Consultation"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
