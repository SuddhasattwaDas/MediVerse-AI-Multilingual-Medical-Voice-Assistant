"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  History,
  CreditCard,
  Zap,
  User,
  Brain,
} from "lucide-react";

const menuOptions = [
  { id: 1, name: "Home", path: "/dashboard", icon: Home },
  { id: 2, name: "History", path: "/dashboard/history", icon: History },
  { id: 3, name: "Billing", path: "/dashboard/billing", icon: CreditCard },
  { id: 4, "name": "Pricing", path: "/dashboard/pricing", icon: Zap },
  { id: 5, "name": "Profile", path: "/user-profile", icon: User },
];

function AppHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 shadow-2xl shadow-orange-500/30 border-b-4 border-orange-600/40">
      {/* --- FIX: Reduced vertical padding from py-3 to py-2 --- */}
      <div className="flex justify-between items-center py-1.5 px-4 md:px-6 max-w-7xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          {/* --- FIX: Reduced padding from p-2 to p-1.5 --- */}
          <Link href="/dashboard" className="flex items-center gap-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-sm shadow-inner-md">
            <div className="relative">
              {/* --- FIX: Reduced icon size from w-10/h-10 to w-8/h-8 --- */}
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-1 border-2 border-yellow-400/30 rounded-lg"
              />
            </div>
            <div>
              {/* --- FIX: Reduced font size from text-xl to text-lg --- */}
              <h1 className="text-lg font-bold text-gray-800">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-600">Medi</span>
                <span>Voice</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600"> AI</span>
              </h1>
              <p className="text-xs text-gray-500">Advanced Healthcare AI</p>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Menu (Unchanged, does not drive height) */}
        <nav className="hidden md:flex items-center gap-6">
          {menuOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.id}
                href={option.path}
                className="
                  relative flex items-center gap-1.5
                  text-sm font-bold text-gray-900 
                  transition-colors duration-200
                  hover:text-black
                  hover:underline
                  decoration-black decoration-2 underline-offset-4
                "
              >
                <Icon size={18} />
                <span>{option.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Actions & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            // --- FIX: Reduced padding from p-2.5 to p-2 ---
            className="
              md:hidden p-2 rounded-lg
              bg-white/30 backdrop-blur-sm
              text-white hover:bg-white hover:text-orange-600
              hover:scale-110 transition-all duration-300
              border-2 border-white/50
              shadow-lg
            "
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {/* --- FIX: Reduced icon size --- */}
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ring-4 ring-white/40 rounded-full hover:ring-white/70 transition-all duration-300 hover:scale-110">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Mobile Menu (Unchanged) */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-500 ease-out
          ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <nav className="px-4 pb-4 pt-3 bg-gradient-to-b from-orange-400 via-amber-400 to-yellow-300 border-t-2 border-white/30">
          <div className="flex flex-col gap-2">
            {menuOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Link
                  key={option.id}
                  href={option.path}
                  className="
                    flex items-center gap-4 px-5 py-4 rounded-2xl
                    text-base font-bold text-gray-900
                    hover:bg-white/50
                    hover:scale-105
                    transition-all duration-300
                    active:scale-95
                  "
                  onClick={() => setIsOpen(false)}
                >
                  <div className="p-2 bg-black/10 rounded-xl text-black">
                    <Icon size={20} />
                  </div>
                  <span className="flex-1">{option.name}</span>
                  <div className="w-3 h-3 rounded-full bg-orange-600 animate-pulse"></div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default AppHeader;