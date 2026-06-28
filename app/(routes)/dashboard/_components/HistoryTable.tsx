"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Loader2, ArrowRight } from "lucide-react"; // Import a loader and icon
import moment from "moment"; // Import moment for 'fromNow'
import {
  Card,
  CardContent,
} from "@/components/ui/card"; // Use Card for a crisp UI
import { Button } from '@/components/ui/button';
import AddNewSessionDialog from "./AddNewSessionDialog";

// --- Type Definitions ---
type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt?: string;
  voiceId?: string;
};

type Session = {
  id: number;
  sessionId: string;
  userEmail: string;
  note: string;
  conversation: any;
  report: any;
  selectedDoctor: DoctorAgent;
  createdOn: string;
};

function HistoryList() {
  const [history, setHistory] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GetHistoryList();
  }, []);

  const GetHistoryList = async () => {
    setIsLoading(true);
    try {
      const result = await axios.get('/api/session-chat?sessionId=all');
      setHistory(result.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-10">
      {history.length === 0 ? (
        // --- Empty State ---
        <div className='flex flex-col items-center justify-center p-7 border-2 rounded-xl border-dashed border-slate-300'>
          <Image
            src="/360_F_1674089812_ZdmWBMu5vpiz9OU6rinXRbNBpNVYqfUW.jpg"
            alt="empty"
            width={150}
            height={150}
            className="rounded-full"
          />
          <h2 className='font-bold text-xl mt-2'>No Recent Consultations</h2>
          <p className="text-slate-500">It looks like you haven't consulted with any doctors yet.</p>
          <div className="mt-4">
            <AddNewSessionDialog />
          </div>
        </div>
      ) : (
        // --- FIX: Crisp UI Card Layout ---
        <div className="space-y-4">
          <h2 className="font-bold text-2xl text-slate-800">Your Past Consultations</h2>
          {history.map((item) => (
            <Card
              key={item.id}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 flex items-center justify-between">
                {/* Left Side: Info */}
                <div className="flex items-center gap-4">
                  <Image
                    src={item.selectedDoctor.image}
                    alt={item.selectedDoctor.specialist}
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-slate-100"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {item.selectedDoctor.specialist}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-1">
                      Your note: "{item.note}"
                    </p>
                    {/* --- FIX 1: Correct date format --- */}
                    <p className="text-xs text-slate-500 mt-1">
                      {moment(item.createdOn).fromNow()}
                    </p>
                  </div>
                </div>

                {/* --- FIX 2: Clickable "View Session" Button --- */}
                <Link href={`/session-chat/${item.sessionId}`} legacyBehavior>
                  <Button variant="outline" size="sm">
                    View Session
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryList;