"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AIDoctorAgents } from "@/shared/list";
import DoctorAgentCard from "./DoctorAgentCard";

function DoctorsAgentList() {
  const router = useRouter();

  const handleCardClick = (doctor: any) => {
    console.log("Selected doctor:", doctor.specialist);
    router.push(`/dashboard/new-session?doctorId=${doctor.id}`);
  };

  return (
    <section className="relative mt-10 overflow-hidden">
      {/* Animated background with floating orbs */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content container */}
      <div className="relative rounded-3xl bg-white/40 backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-10 shadow-2xl border border-white/60">
        
        {/* Dynamic heading with animated gradient */}
        <div className="text-center mb-12 relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"></div>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce delay-200"></div>
          </div>

          {/* Title with heart icon inline */}
          <h2 className="relative inline-flex items-center justify-center gap-3 flex-wrap">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-400 blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-rose-500 p-3 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            {/* --- FIX: Replaced .animate-gradient with animate-bg-pan --- */}
            <span className="font-black text-4xl sm:text-5xl lg:text-6xl bg-clip-text text-transparent 
                             bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 
                             animate-bg-pan pb-2 tracking-tight"
                  // --- FIX: Added background-size for animation to work ---
                  style={{ backgroundSize: "200% auto" }}
            >
              AI Specialist Doctor Agents
            </span>
            
            {/* --- FIX: Replaced .animate-expand with animate-expand-x --- */}
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 rounded-full transform origin-left animate-expand-x"></div>
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-600 mt-6 font-medium max-w-2xl mx-auto">
            Select your specialized AI doctor and experience{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-rose-600 font-bold">
              next-generation healthcare
            </span>
          </p>
        </div>

        {/* Enhanced grid with stagger animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          {AIDoctorAgents.map((doctor, index) => (
            <div
              key={doctor.id}
              className="transform hover:scale-105 transition-all duration-300 hover:z-10"
              // --- FIX: This style prop is correct and will now work
              // because 'fadeInUp' is defined in your tailwind.config.js
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              <DoctorAgentCard
                doctorAgent={doctor}
                onClick={() => handleCardClick(doctor)}
              />
            </div>
          ))}
        </div>

        {/* Bottom section with stats and CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Stats or trust indicators */}
          <div className="flex justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600 font-medium">24/7 Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600 font-medium">Instant Response</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-slate-600 font-medium">Expert Analysis</span>
            </div>
          </div>

          {/* AI Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-100 to-rose-100 rounded-full border border-orange-200">
            {/* --- FIX: Replaced .animate-spin-slow with animate-spin-slow --- */}
            <svg className="w-5 h-5 text-orange-600 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-semibold text-slate-700">
              Powered by Advanced AI
            </span>
          </div>
        </div>
      </div>

      {/* --- FIX: Removed the entire <style jsx> block --- */}
      
    </section>
  );
}

export default DoctorsAgentList;