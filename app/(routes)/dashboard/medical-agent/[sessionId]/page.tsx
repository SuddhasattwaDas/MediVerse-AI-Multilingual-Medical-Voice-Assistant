"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";
// --- FIX: Added missing imports ---
import { 
  Circle, Mic, PhoneOff, SendHorizonal, Zap, Activity, 
  FileText, Loader2, Calendar, Clock, User as UserIcon 
} from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Vapi from "@vapi-ai/web";
import moment from "moment"; // --- FIX: Added missing import ---

// --- Type Definitions ---
type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt?: string;
  voiceId?: string;
};

// --- FIX: Specific type for the new report structure ---
type ReportData = {
  sessionId: string;
  agent: string;
  "Name of the patient": string | null;
  "Age": string | null;
  "Sex": string | null;
  user?: string; // Optional fallback
  timestamp: string;
  chiefComplaint: string | null;
  historyOfPresentIllness: string | null;
  symptoms: string[] | null;
  duration: string | null;
  severity: string | null;
  summary: string | null;
  prescribedMedicines: string[] | null;
  "list of tests recommended": string[] | null;
  recommendations: string[] | null;
  closingNotes: string | null;
};

type SessionDetail = {
  id: number;
  note: string;
  sessionId: string;
  report: ReportData | null; // Use the specific ReportData type
  selectedDoctor: DoctorAgent | null;
  createdOn: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

function MedicalVoiceAgentPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const vapiRef = useRef<Vapi | null>(null);

  // Refs for the call timer
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // --- State ---
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading for initial fetch
  const [isProcessing, setIsProcessing] = useState(false); // Loading for report generation
  const [error, setError] = useState<string | null>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [callTime, setCallTime] = useState("00:00");
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: "assistant", text: "Hello! When you're ready, start the call to activate the voice assistant." },
  ]);

  // --- Effects: Initialize Vapi ---
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!apiKey) {
      console.error("VAPI API Key is missing! Check .env.local file.");
      setError("Voice service API key missing.");
      setIsLoading(false);
      return;
    }

    if (!vapiRef.current) {
      vapiRef.current = new Vapi(apiKey);

      vapiRef.current.on("call-start", () => {
        setIsCallStarted(true);
        setSessionDetail(prev => prev ? ({ ...prev, report: null }) : null); 
        setChatHistory([{ role: "assistant", text: "Connection established. How can I assist you?" }]);
      });

      vapiRef.current.on("call-end", () => {
        setIsCallStarted(false);
      });

      vapiRef.current.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcriptType === "final" && message.transcript?.trim()) {
          const role = message.role === "user" ? "user" : "assistant";
          setChatHistory(prev => [...prev, { role, text: message.transcript }]);
        }
      });

      vapiRef.current.on("speech-start", () => console.log("Speech started"));
      vapiRef.current.on("speech-end", () => console.log("Speech ended"));
      
      vapiRef.current.on("error", (e: any) => {
        console.error("Vapi error:", e);
        let errorMessage = "Voice call error. Please try again.";
        if (e instanceof Error) errorMessage = e.message;
        else if (typeof e === 'string') errorMessage = e;
        else if (e && typeof e === 'object' && 'message' in e) errorMessage = String(e.message);
        setError(`Call error: ${errorMessage}`);
        setIsCallStarted(false);
      });
    }

    return () => {
      vapiRef.current?.stop();
      vapiRef.current?.removeAllListeners();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- Fetch session data ---
  useEffect(() => {
    if (sessionId) getSessionDetails();
  }, [sessionId]);

  const getSessionDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`/api/session-chat?sessionId=${sessionId}`);
      setSessionDetail(data);
    } catch (err) {
      console.error("Failed to fetch session:", err);
      setError("Could not load session data.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Auto-scroll chat ---
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // --- Manage call timer ---
  useEffect(() => {
    if (isCallStarted) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Date.now() - startTimeRef.current;
          const minutes = Math.floor(elapsed / 60000);
          const seconds = Math.floor((elapsed % 60000) / 1000);
          setCallTime(
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          );
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCallTime("00:00");
      startTimeRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isCallStarted]);


  // --- Vapi Call Handlers ---
  const startVapiCall = () => {
    setError(null); 
    if (!vapiRef.current) {
      setError("Voice service not ready.");
      return;
    }
     const selectedDoctor = sessionDetail?.selectedDoctor;

     if (!selectedDoctor) {
       setError("Doctor details not loaded. Cannot start call.");
       return;
     }

     // --- This config matches your provided code ---
     const VapiAgentConfig = {
       name: 'AI Medical Voice Agent',
       firstMessage: "Hello, I'm your Medico AI assistant. I can help you with any health questions or concerns you may have. At first tell me your Name, Age, Sex and how are you feeling?",
       voicemailMessage: "Please call back when you're available.",
       endCallMessage: "Goodbye.",
       silenceTimeoutSeconds: 99,
       transcriber: {
         provider: 'google',
         language: 'Multilingual',
         model: 'gemini-2.0-flash',
       },
       voice: {
         provider: 'vapi',
         voiceId: sessionDetail?.selectedDoctor?.voiceId,
       },
       model: {
         provider: 'google',
         model: 'gemini-2.5-flash',
         toolIds: [
           "fabd956a-3466-41af-8320-9b9636931208",
           "8b72e9ad-26fe-4a95-b3b6-c76098abd5b6"
         ],
         messages: [
           {
             role: 'system',
             content: sessionDetail?.selectedDoctor?.agentPrompt || "You are a helpful medical assistant.",
           }
         ]
       }
     };

     console.log("Starting call with config:", VapiAgentConfig);

     try {
       // @ts-ignore
       vapiRef.current.start(VapiAgentConfig);
     } catch (e) {
       console.error("Failed to start Vapi call:", e);
       let errorMessage = "Failed to start call.";
       if (e instanceof Error) errorMessage = e.message;
       setError(errorMessage);
     }
  };

  const endVapiCall = async () => {
    setIsProcessing(true); 
    setError(null);
    vapiRef.current?.stop();
    
    try {
      const conversationToSave = chatHistory.length > 1 ? chatHistory : [];

      console.log("Saving conversation...");
      await axios.put('/api/session-chat', {
        sessionId: sessionId,
        conversation: conversationToSave
      });
      console.log("Conversation saved.");

      if (conversationToSave.length > 0) {
        console.log("Generating report...");
        const result = await GenerateReport();
        console.log("Report generated:", result.data);
        setSessionDetail(prev => prev ? ({ ...prev, report: result.data }) : null);
      } else {
        console.log("Skipping report generation: No conversation occurred.");
        setSessionDetail(prev => prev ? ({ ...prev, report: null }) : null); 
      }

    } catch (err) {
      console.error("Failed to save conversation or generate report:", err);
      let errorMsg = "Failed to save session data or generate the report.";
      if (axios.isAxiosError(err) && err.response) {
        errorMsg = `Error: ${err.response.data?.error || err.message}`;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsProcessing(false); 
    }
  };

  const handleSendMessage = () => {
    if (!userInput.trim() || !isCallStarted) return; // Only send if call is active
    const newUserMessage: ChatMessage = { role: "user", text: userInput };
    setChatHistory(prev => [...prev, newUserMessage]);

    if (vapiRef.current) {
        vapiRef.current.send({
            type: 'add-message',
            message: {
                role: 'user',
                content: userInput,
            },
        });
    }
    setUserInput("");
  };

  const GenerateReport = async () => {
    if (!sessionDetail) throw new Error("Session details missing.");
    const result = await axios.post('/api/medical-report', {
        messages: chatHistory, 
        sessionDetail: sessionDetail, 
        sessionId: sessionId 
    });
    return result; 
  }

  // --- FIX: Updated Report Rendering Function ---
  const renderReport = (report: ReportData | null) => {
    if (!report || Object.keys(report).length === 0) return null;

    // Helper components for consistent styling
    const ReportSection = ({ title, children, icon: Icon }: { title: string, children: React.ReactNode, icon?: React.ElementType }) => (
      children ? ( // Only render section if it has content
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-orange-700 mb-2 uppercase tracking-wide border-b border-orange-200 pb-1 flex items-center gap-2">
            {Icon && <Icon size={16} />} {title}
          </h5>
          {children}
        </div>
      ) : null
    );

    const ReportValue = ({ value }: { value: string | undefined | null }) => (
      value ? <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">{value}</p> : <p className="text-sm text-slate-500 italic">Not specified</p>
    );
    
    const ReportGridItem = ({ label, value }: { label: string, value: string | undefined | null }) => (
       <div className="bg-slate-50 p-2 rounded border border-slate-200">
           <span className="text-xs text-slate-500 block">{label}</span>
           <span className="font-medium text-sm text-slate-800">{value || 'N/A'}</span>
       </div>
     );

    const ReportList = ({ items }: { items: string[] | undefined | null }) => (
      items && items.length > 0 ? (
        <ul className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200 list-disc list-inside space-y-1">
          {items.map((item: string, idx: number) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      ) : <p className="text-sm text-slate-500 italic">None specified</p>
    );

    return (
      <div className="space-y-5 animate-[fadeIn_0.5s_ease-out]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full ring-2 ring-orange-200">
            <FileText size={24} className="text-orange-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Consultation Report</h4>
            <p className="text-xs text-slate-500">
              Generated on: {moment(report.timestamp || new Date()).format('DD MMM YYYY, h:mm A')}
            </p>
          </div>
        </div>

        {/* Patient Details */}
        <ReportSection title="Patient Information" icon={UserIcon}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-2">
            <ReportGridItem label="Name" value={report["Name of the patient"]} />
            <ReportGridItem label="Age" value={report.Age} />
            <ReportGridItem label="Sex" value={report.Sex} />
          </div>
          {/* Fallback for the old 'user' field */}
          {!(report["Name of the patient"] || report.Age || report.Sex) && report.user && (
               <div className="mt-2"><ReportGridItem label="User Info (Legacy)" value={report.user} /></div>
          )}
        </ReportSection>

        {/* Complaint and Symptoms */}
        <ReportSection title="Presenting Complaint">
          <ReportValue value={report.chiefComplaint} />
          <h6 className="text-xs font-semibold text-slate-500 mt-3 mb-1">Symptoms</h6>
          <ReportList items={report.symptoms} />
          <div className="grid grid-cols-2 gap-3 mt-3">
             <ReportGridItem label="Duration" value={report.duration} />
             <ReportGridItem label="Severity" value={report.severity} />
           </div>
        </ReportSection>

        {/* History of Present Illness */}
        <ReportSection title="History of Present Illness">
           <ReportValue value={report.historyOfPresentIllness} />
        </ReportSection>

        {/* Summary */}
         <ReportSection title="Consultation Summary">
           <ReportValue value={report.summary} />
        </ReportSection>

        {/* Treatment Plan */}
        <ReportSection title="Treatment Plan">
           <h6 className="text-xs font-semibold text-slate-500 mb-1">Prescribed Medicines</h6>
           <ReportList items={report.prescribedMedicines} />
           <h6 className="text-xs font-semibold text-slate-500 mt-3 mb-1">Tests Recommended</h6>
           <ReportList items={report["list of tests recommended"]} />
           <h6 className="text-xs font-semibold text-slate-500 mt-3 mb-1">Recommendations</h6>
           <ReportList items={report.recommendations} />
        </ReportSection>

        {/* Closing Notes */}
        <ReportSection title="Closing Notes">
           <ReportValue value={report.closingNotes} />
        </ReportSection>
      </div>
    );
  };
  // --- END OF renderReport FUNCTION ---


  // --- Keyframe for fadeIn animation ---
  const keyframes = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn { /* Ensure this exists if used */
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
  `;

  // --- Render ---
  if (isLoading && !sessionDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center text-slate-500 flex items-center gap-2">
          <Loader2 className="animate-spin h-6 w-6" />
          Loading session...
        </div>
      </div>
    );
  }

  if (error && !sessionDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center p-4">
         <div className="text-center p-6 bg-red-50 border border-red-300 rounded-lg shadow-md">
           <h3 className="font-bold text-red-700 mb-2">Error Loading Session</h3>
           <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!sessionDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center py-20 text-slate-500">No session data found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-yellow-100 to-white p-4 md:p-6">
      <style>{keyframes}</style> {/* Inject keyframes */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 mb-6 border-2 border-orange-300 shadow-lg shadow-orange-500/10 flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Zap size={20} className="text-orange-600" />
            </div>
            <h2 className="font-bold text-xl text-slate-800">Consultation Session</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-slate-100 px-3 py-1.5 rounded-full flex gap-2 items-center border border-slate-200">
              <Circle
                size={8}
                className={`transition-colors ${isCallStarted ? "animate-pulse fill-green-500 text-green-500" : "fill-red-500 text-red-500"}`}
              />
              <span className="text-slate-600 text-sm font-medium">{isCallStarted ? "Live" : "Standby"}</span>
            </div>
            <div className="text-slate-700 font-bold text-xl tabular-nums bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full">
              {callTime}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {sessionDetail.selectedDoctor && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg shadow-orange-500/10">
                <h3 className="text-orange-600 font-bold text-sm mb-4 uppercase tracking-wider">Your Specialist</h3>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-orange-300 to-yellow-300 rounded-full blur-md opacity-50" />
                    <Image
                      src={sessionDetail.selectedDoctor.image}
                      alt={sessionDetail.selectedDoctor.specialist}
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-white shadow-lg relative"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xl">{sessionDetail.selectedDoctor.specialist}</h5>
                    <p className="text-sm text-slate-600">{sessionDetail.selectedDoctor.description}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-lg shadow-orange-500/10">
              <h3 className="text-orange-600 font-bold text-sm mb-3 uppercase tracking-wider">Your Symptoms</h3>
              <p className="text-slate-700 text-lg leading-relaxed italic">"{sessionDetail.note}"</p>
            </div>

            {/* Error display */}
            {error && !isCallStarted && !isProcessing && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Loading indicator for report generation */}
            {isProcessing && !isCallStarted && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                <p>Saving conversation and generating report...</p>
              </div>
            )}
            
            {/* --- FIX: Report Display Card --- */}
            {sessionDetail.report && !isCallStarted && !isProcessing && (
              <div className="bg-white rounded-2xl border-2 border-green-400 shadow-lg shadow-green-500/10 p-5 max-h-[600px] overflow-y-auto">
                {/* This now calls the new, corrected renderReport function */}
                {renderReport(sessionDetail.report)}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-lg shadow-orange-500/10 flex flex-col justify-between min-h-[70vh]">
            {!isCallStarted ? (
              <>
                {/* Start Call View */}
                <div className="flex-grow bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl flex flex-col items-center justify-center border border-dashed border-orange-500 relative overflow-hidden p-4">
                  <div className="relative z-10 flex items-center justify-center">
                    <div className="absolute w-48 h-48 bg-orange-400/30 rounded-full animate-ping"></div>
                    <div className="w-32 h-32 bg-orange-500 rounded-full flex items-center justify-center shadow-lg ring-4 ring-orange-200">
                      <Mic size={50} className="text-white" />
                    </div>
                  </div>
                  <p className="text-orange-700 mt-8 text-sm font-medium relative z-10 text-center">Ready to begin your consultation?</p>
                </div>
                <Button
                  onClick={startVapiCall}
                  size="lg"
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[1.0] transition-all flex items-center gap-3 justify-center"
                  disabled={!sessionDetail.selectedDoctor || isLoading || isProcessing}
                >
                  <Mic size={24} />
                  Start Call
                </Button>
              </>
            ) : (
              <>
                {/* Live Call View */}
                <div className="p-4 rounded-xl border border-dashed mb-4 border-red-500 bg-red-50 flex-shrink-0">
                  <div className="flex items-center justify-center gap-4">
                    <div className="rounded-full h-16 w-16 flex items-center justify-center shadow-lg animate-pulse relative overflow-hidden bg-red-500 ring-4 ring-red-200">
                      <Mic size={30} className="text-white relative z-10" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-800">Listening...</p>
                      <p className="text-sm text-slate-500">The voice system is active. Speak anytime.</p>
                    </div>
                  </div>
                </div>

                {/* Chat History */}
                <div
                  ref={chatContainerRef}
                  className="flex-grow h-64 bg-white rounded-xl p-4 overflow-y-auto space-y-4 border border-slate-200 mb-4"
                >
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "assistant" && sessionDetail.selectedDoctor && (
                        <Image
                          src={sessionDetail.selectedDoctor.image}
                          alt="Specialist"
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-orange-200"
                        />
                      )}
                      <div className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${msg.role === "user" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="mt-auto flex items-center gap-2 flex-shrink-0">
                  <Textarea
                    placeholder="Or type your message..."
                    className="flex-grow bg-white rounded-xl border-orange-300 focus-visible:ring-orange-400"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="bg-orange-500 hover:bg-orange-600 rounded-full h-12 w-12 flex-shrink-0">
                    <SendHorizonal className="text-white" />
                  </Button>
                  <Button
                    onClick={endVapiCall}
                    size="icon"
                    variant="outline"
                    className="rounded-full h-12 w-12 flex-shrink-0 border-2 border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <PhoneOff />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicalVoiceAgentPage;