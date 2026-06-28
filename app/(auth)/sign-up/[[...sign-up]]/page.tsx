"use client";

import { SignUp } from '@clerk/nextjs';
import { motion } from "framer-motion";
import { Sparkles, Zap, Heart, Award, TrendingUp } from "lucide-react"; 
import { useState, useEffect } from "react";

export default function Page() {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-900 p-4">
      {/* Eyecatching Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Pulsing Gradient Spheres (Slightly different timing) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
          animate={{ opacity: 1, scale: [0.5, 1.3, 0.9], x: "-50%", y: "-50%", rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute top-1/2 left-1/2 h-96 w-96 rounded-full bg-orange-400/30 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: "50%", y: "50%" }}
          animate={{ opacity: 1, scale: [0.5, 1.3, 0.9], x: "50%", y: "50%", rotate: -360 }}
          transition={{ duration: 11, delay: 2.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-red-400/30 blur-3xl"
        />

        {/* Floating Particles - More of them */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[2px] w-[2px] rounded-full bg-yellow-400/50"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight * -1, null],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 8,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}

        {/* Subtle, moving diagonal lines */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "-100%" }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-full h-full bg-repeating-linear-gradient"
          />
        </div>
      </div>

      {/* Main Content Container with a more dramatic entrance */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -50, rotateX: -90 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 120, damping: 15 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-md dark:border-slate-700/50 dark:bg-slate-900/80"
      >
        {/* Animated TrendingUp Icon at the top */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.5, delay: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-yellow-600 shadow-xl"
          >
            <TrendingUp className="w-8 h-8 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute w-16 h-16 rounded-2xl border-4 border-orange-400/50"
            />
          </motion.div>
        </div>

        {/* The Clerk SignUp Component */}
        <SignUp />

        {/* Dynamic Social Proof/Feature Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, staggerChildren: 0.2 }}
          className="mt-8 flex flex-wrap justify-center gap-4 text-center text-sm text-gray-700 dark:text-gray-300"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-yellow-500" /> Start in seconds
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-1">
            <Zap className="h-4 w-4 text-red-500" /> Unlock new features
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// You need to add this to your global CSS file (e.g., globals.css)
// @layer utilities {
//   .bg-repeating-linear-gradient {
//     background-image: repeating-linear-gradient(
//       -45deg,
//       theme('colors.red.400') 0px,
//       theme('colors.red.400') 1px,
//       theme('colors.transparent') 1px,
//       theme('colors.transparent') 20px
//     );
//   }
// }