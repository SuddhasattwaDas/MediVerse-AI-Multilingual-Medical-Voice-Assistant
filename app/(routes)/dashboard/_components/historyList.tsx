"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; // Keep Link for potential future use if needed, but not used for the button now
import axios from "axios";
import { Loader2, ArrowRight, Trash2, ChevronRight, ChevronLeft, Calendar, Clock } from "lucide-react";
import moment from "moment";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import AddNewSessionDialog from "./AddNewSessionDialog";
import styles from "./HistoryList.module.css";
// --- FIX: Make sure ViewReportDialog is imported ---
import ViewReportDialog from "./ViewReportDialog";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    GetHistoryList();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < (scrollWidth - clientWidth) - 1);
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    const timeoutId = setTimeout(checkScrollability, 100);

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
      clearTimeout(timeoutId);
    };
  }, [history]);

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

  const handleDelete = async (e: React.MouseEvent, sessionIdToDelete: string) => {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    setDeletingId(sessionIdToDelete);
    try {
      await axios.delete('/api/session-chat', {
        data: { sessionId: sessionIdToDelete }
      });
      setHistory(prev => prev.filter(item => item.sessionId !== sessionIdToDelete));
    } catch (error) {
      console.error("Failed to delete session:", error);
      alert("Failed to delete session.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleScroll = (scrollAmount: number) => {
    scrollContainerRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center mt-20 gap-4">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-orange-200 rounded-full animate-pulse" />
        </div>
        <p className="text-slate-600 font-medium animate-pulse">Loading your consultations...</p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {history.length === 0 ? (
        <div className='flex flex-col items-center justify-center p-3 border-2 rounded-2xl border-dashed border-orange-300 bg-gradient-to-br from-orange-50 via-yellow-50 to-white relative overflow-hidden'>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,146,60,0.1),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(250,204,21,0.1),transparent_70%)]" />
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-300 to-yellow-200 rounded-full blur-2xl opacity-20 animate-pulse" />
            <Image
              src="/360_F_1674089812_ZdmWBMu5vpiz9OU6rinXRbNBpNVYqfUW.jpg"
              alt="empty"
              width={150}
              height={150}
              className="rounded-full border-4 border-white shadow-2xl relative"
            />
          </div>
          
          <h2 className='font-bold text-2xl mt-2 text-slate-800 relative'>
            No Recent Consultations
          </h2>
          <p className="text-slate-600 mt-2 text-center max-w-md relative">
            Start your healthcare journey by consulting with one of our expert doctors
          </p>
          
          <div className="mt-2 relative">
            <AddNewSessionDialog />
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-3xl text-slate-800 mb-1 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Your Past Consultations
              </h2>
              <p className="text-slate-600 text-sm">Review your medical history and reports</p>
            </div>
          </div>
          
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className={`flex space-x-4 overflow-x-auto pb-6 px-2 ${styles.horizontalScroll}`}
            >
              {history.map((item, index) => ( // 'item' is defined here
                <Card
                  key={item.id}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                  className="flex flex-col flex-shrink-0 min-w-[260px] max-w-[260px]
                             rounded-2xl shadow-lg
                             bg-gradient-to-br from-white via-orange-50 to-yellow-50
                             border-2 border-orange-300
                             transition-all duration-300
                             hover:shadow-2xl hover:-translate-y-2 hover:border-orange-400
                             relative overflow-hidden group
                             animate-[slideIn_0.5s_ease-out_forwards]"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-bl-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500" />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-8 w-8
                               text-orange-400 hover:text-red-500
                               hover:bg-red-100 rounded-full z-10
                               backdrop-blur-sm bg-white/80
                               shadow-md hover:shadow-lg
                               transition-all duration-200 hover:scale-110"
                    onClick={(e) => handleDelete(e, item.sessionId)}
                    disabled={deletingId === item.sessionId}
                  >
                    {deletingId === item.sessionId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>

                  <CardContent className="p-4 flex-grow relative">
                    {/* ... Card content remains the same ... */}
                     <div className="flex items-center gap-3 mb-3">
                       <div className="relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full blur-md opacity-50" />
                         <Image
                           src={item.selectedDoctor.image}
                           alt={item.selectedDoctor.specialist}
                           width={48}
                           height={48}
                           className="rounded-full border-2 border-white shadow-lg relative"
                         />
                       </div>
                       <div className="flex-1">
                         <h3 className="font-bold text-slate-900 text-base leading-tight">
                           {item.selectedDoctor.specialist}
                         </h3>
                         <p className="text-xs text-orange-600 font-medium">Specialist</p>
                       </div>
                     </div>
                     
                     <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 mb-3 border border-orange-200/50 shadow-sm">
                       <p className="text-xs font-semibold text-orange-700 mb-1">Session Note:</p>
                       <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                         {item.note}
                       </p>
                     </div>
                     
                     <div className="space-y-1">
                       <div className="flex items-center gap-2 text-slate-600">
                         <Calendar className="h-3.5 w-3.5 text-orange-500" />
                         <p className="text-xs font-medium">
                           {moment(item.createdOn).format('DD MMM YYYY')}
                         </p>
                       </div>
                       <div className="flex items-center gap-2 text-slate-600">
                         <Clock className="h-3.5 w-3.5 text-orange-500" />
                         <p className="text-xs">
                           {moment(item.createdOn).format('h:mm A')} • {moment(item.createdOn).fromNow()}
                         </p>
                       </div>
                     </div>
                  </CardContent>

                  <CardFooter className="p-3 pt-0">
                    {/* --- FIX: Moved ViewReportDialog HERE, inside the map --- */}
                    <ViewReportDialog item={item} />
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* --- FIX: Removed the misplaced ViewReportDialog --- */}

            {canScrollLeft && (
              <button
                onClick={() => handleScroll(-300)}
                className="absolute top-0 left-0 h-full w-20
                             flex items-center justify-start pl-2
                             bg-gradient-to-r from-white via-white/95 to-transparent
                             z-20 transition-all hover:w-24 group"
                aria-label="Scroll left"
              >
                <div className="bg-white rounded-full p-2 shadow-lg border-2 border-orange-300 group-hover:border-orange-500 group-hover:shadow-xl transition-all group-hover:scale-110">
                  <ChevronLeft className="h-8 w-8 text-orange-500 group-hover:text-orange-600" />
                </div>
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={() => handleScroll(300)}
                className="absolute top-0 right-0 h-full w-20
                             flex items-center justify-end pr-2
                             bg-gradient-to-l from-white via-white/95 to-transparent
                             z-20 transition-all hover:w-24 group"
                aria-label="Scroll right"
              >
                <div className="bg-white rounded-full p-2 shadow-lg border-2 border-orange-300 group-hover:border-orange-500 group-hover:shadow-xl transition-all group-hover:scale-110">
                  <ChevronRight className="h-8 w-8 text-orange-500 group-hover:text-orange-600" />
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryList;