import React from "react";
import HistoryList from "./_components/historyList";
import { Button } from "@/components/ui/button";
import DoctorsAgentList from "./_components/DoctorsAgentList";
import AddNewSessionDialog from "./_components/AddNewSessionDialog";
import { Sparkles, Activity } from "lucide-react";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="font-bold text-3xl sm:text-4xl bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                My Dashboard
              </h2>
            </div>
            <p className="text-orange-700/70 ml-12 text-sm sm:text-base">Welcome back! Here's your health overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-orange-200/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">Active</span>
            </div>
            <AddNewSessionDialog />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-5">
          {/* History Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 overflow-hidden">
            {/* <div className="px-4 sm:px-6 py-1 border-b border-orange-100/50 bg-gradient-to-r from-orange-50/50 to-transparent">
              <h3 className="font-semibold text-base sm:text-lg text-orange-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Recent Activity
              </h3>
            </div> */}
            <div className="p-2 sm:p-4">
              <HistoryList />
            </div>
          </div>

          {/* Doctors Section */}
          {/* <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100/50 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 border-b border-orange-100/50 bg-gradient-to-r from-amber-50/50 to-transparent">
              <h3 className="font-semibold text-base sm:text-lg text-orange-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Medical Professionals
              </h3>
            </div>
            <div className="p-4 sm:p-6"> */}
              <DoctorsAgentList />
            {/* </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;