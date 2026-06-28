"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Mic, 
  Users, 
  Calendar, 
  Video, 
  Shield, 
  Heart, 
  Clock, 
  Star, 
  ChevronRight, 
  Play, 
  MessageCircle, 
  Phone, 
  Stethoscope,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  Award,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function AdvancedMediVoiceHomepage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [stats, setStats] = useState({
    consultations: 0,
    patients: 0,
    satisfaction: 0,
    uptime: 0
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<any[]>([]);

  // Animate stats on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        consultations: 150000,
        patients: 50000,
        satisfaction: 98.5,
        uptime: 99.9
      });
    }, 1000);

    // Client-side only particle generation
    const newParticles = [...Array(20)].map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 3
    }));
    setParticles(newParticles);

    return () => clearTimeout(timer);
  }, []);

  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Chief Medical Officer, City Hospital",
      content: "Medi AI has revolutionized our patient intake process. 24/7 intelligent screening saves us 40% on administrative costs.",
      avatar: "👩‍⚕️",
      rating: 5
    },
    {
      name: "Mark Thompson",
      role: "Healthcare Director, MedGroup",
      content: "The conversational AI understands medical terminology better than most humans. Patient satisfaction increased by 35%.",
      avatar: "👨‍💼",
      rating: 5
    },
    {
      name: "Dr. Priya Patel",
      role: "Telemedicine Specialist",
      content: "Voice-first automation has transformed how we handle emergency triage. Response time reduced from hours to minutes.",
      avatar: "👩‍⚕️",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-slate-900 dark:via-slate-800 dark:to-red-900 overflow-hidden"
      onMouseMove={handleMouseMove} 
    >
      {/* Cursor Light Effect */}
      <div 
        className="pointer-events-none absolute inset-0 transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(251, 146, 60, 0.15), transparent 30%)`
        }}
      />
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Enhanced gradient orbs with more vibrant colors */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-yellow-400/30 via-orange-500/30 to-red-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] bg-gradient-to-br from-orange-400/30 via-red-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-yellow-400/30 via-orange-600/30 to-red-600/30 rounded-full blur-2xl animate-pulse delay-2000"></div>
        
        {/* Animated grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,146,60,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        
        {/* Floating particles with enhanced motion */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(251, 191, 36, 0.6)' : 
                i % 3 === 1 ? 'rgba(251, 146, 60, 0.6)' : 
                'rgba(239, 68, 68, 0.6)'
              }, transparent)`
            }}
            initial={{ 
              x: p.x, 
              y: p.y,
              opacity: 0,
              scale: 0 
            }}
            animate={{ 
              y: [p.y, p.y - 50, p.y],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{ 
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl">
        <Navbar />
        
        {/* Hero Section */}
        <div className="px-4 py-8 md:py-12">
          
          {/* Live Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-8 p-3 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg dark:bg-slate-900/80 dark:border-slate-700/50"
          >
            {[
              { label: "Active Consultations", value: stats.consultations.toLocaleString(), icon: MessageCircle, color: "text-red-600" },
              { label: "Patients Served", value: stats.patients.toLocaleString() + "+", icon: Users, color: "text-yellow-600" },
              { label: "Satisfaction Rate", value: stats.satisfaction + "%", icon: Heart, color: "text-red-500" },
              { label: "Uptime", value: stats.uptime + "%", icon: Shield, color: "text-orange-600" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + index * 0.2, type: "spring" }}
                className="text-center"
              >
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
                <div className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Main Headline with Brain Icon */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.5 }}
              className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 mb-6 shadow-2xl"
            >
              <Brain className="w-10 h-10 text-white" />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-20 h-20 rounded-2xl border-4 border-yellow-400/50"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="absolute w-20 h-20 rounded-2xl border-2 border-orange-400/40"
              />
            </motion.div>

            <h1 className="max-w-4xl mx-auto text-4xl md:text-5xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-6">
              {["Transform", "Healthcare", "with", "AI", "Medical", "Voice", "Agents"].map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    type: "spring",
                  }}
                  className={`inline-block mr-3 ${
                    word === "AI" ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 drop-shadow-lg" :
                    word === "Medical" ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 drop-shadow-lg" :
                    word === "Voice" ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-600 to-yellow-500 drop-shadow-lg" : ""
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="max-w-xl mx-auto text-base md:text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed mb-8"
          >
            Provide 24/7 intelligent medical support using conversational AI. Triage symptoms, 
            book appointments, and deliver empathetic care with voice-first automation.
          </motion.p>

          {/* Video and CTA Section */}
          <div className="grid lg:grid-cols-2 items-center mx-auto gap-8">
            {/* Video Preview with enhanced effects */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="relative group"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                <video
                  className="w-full h-full object-cover rounded-3xl transform transition-transform duration-500 group-hover:scale-105"
                  src="videos/Cinematic_Hospital_Video_Generation.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                {/* Shimmer effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              {/* Enhanced glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/30 via-orange-600/30 to-yellow-600/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              {/* Pulsing ring effect */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-2 border-2 border-orange-400/30 rounded-3xl pointer-events-none"
              />
            </motion.div>

            {/* CTA and Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="space-y-4"
            >
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(251, 146, 60, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white font-bold text-lg px-8 py-5 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Sparkles className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Start Free Trial</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                  className="w-full flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-800 font-semibold text-md px-6 py-4 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 dark:bg-slate-800/80 dark:border-slate-600 dark:text-gray-200"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Schedule Demo</span>
                </motion.button>
              </div>

              {/* Key Features */}
              <div className="space-y-3 mt-6">
                {[
                  { icon: Zap, text: "Instant Medical Report", color: "text-yellow-500" },
                  { icon: Globe, text: "50+ languages supported", color: "text-red-500" },
                  { icon: Award, text: "HIPAA compliant & secure", color: "text-orange-500" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + index * 0.2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-300 dark:bg-slate-800/60 dark:border-slate-700/50"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-50 rounded-lg flex items-center justify-center border border-gray-200 shadow-sm dark:from-slate-700 dark:to-slate-800 dark:border-slate-600">
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <span className="text-gray-800 dark:text-gray-200 text-sm font-semibold flex-1">{feature.text}</span>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Customer Testimonials Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="mt-16 max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Trusted by Healthcare Leaders
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">See what medical professionals are saying about MediVoice AI</p>
            </div>

            <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-gray-200/50 dark:bg-slate-900/80 dark:border-slate-700/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xl shadow-lg">
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {testimonials[activeTestimonial].name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {testimonials[activeTestimonial].role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Testimonial Navigation Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === activeTestimonial
                        ? "bg-gradient-to-r from-red-500 to-orange-500 scale-125 w-8"
                        : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm font-medium">Trusted by leading healthcare organizations</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-70">
              {["Hospital Network", "MedTech Solutions", "HealthCorp", "CareFirst", "MediGroup"].map((company, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4 + index * 0.1 }}
                  className="text-base font-bold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const Navbar = () => {
  const { user } = useUser();
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-gray-200/50 dark:bg-slate-900/70 dark:border-slate-700/50">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 via-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -inset-1 border-2 border-yellow-400/30 rounded-xl"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-600">Medi</span>
            <span className="text-gray-800 dark:text-gray-200">Voice</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600"> AI</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Advanced Healthcare AI</p>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-6"
      >
        <div className="hidden md:flex items-center gap-6 text-gray-600 dark:text-gray-400 text-sm font-medium">
          <a href="#" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Solutions</a>
          <a href="#" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pricing</a>
          <a href="#" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Resources</a>
        </div>
        {user ? (
          <>
            <UserButton afterSignOutUrl="/" />
            <Link href="/dashboard" passHref>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Dashboard
              </motion.button>
            </Link>
          </>
        ) : (
          <Link href="/sign-in" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Login
            </motion.button>
          </Link>
        )}
      </motion.div>
    </nav>
  );
};