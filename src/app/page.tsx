"use client";
import { Hero3DWrapper } from "@/components/home/Hero3DWrapper";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calculator, Crosshair } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex-1 flex flex-col justify-center items-center min-h-[calc(100vh-80px)] text-center p-6 overflow-hidden">
      <Hero3DWrapper />
      
      <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto mt-8">
        
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1.2 }}
          className="mb-8 relative"
        >
          <div className="absolute inset-0 bg-[var(--color-gaming-accent)] blur-[80px] opacity-20 rounded-full"></div>
          <motion.img 
            src="/assets/images/logo-brigada.jpg" 
            alt="Logo Brigada" 
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full border-4 border-white/10 shadow-[0_0_40px_rgba(0,229,255,0.4)] relative z-10"
            animate={{ 
              y: [-15, 15, -15],
              boxShadow: ["0px 0px 40px rgba(0,229,255,0.4)", "0px 0px 80px rgba(0,229,255,0.8)", "0px 0px 40px rgba(0,229,255,0.4)"]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4, 
              ease: "easeInOut" 
            }}
          />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="p-4 md:p-8 relative z-20"
        >
          
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-6">
            ¡Bienvenido, <span className="text-[var(--color-gaming-accent)]">Piloto!</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
            Aquí tienes el equipo de soporte que necesitas antes de despegar. Explora nuestra suite de herramientas diseñadas para darte la ventaja competitiva en combate. Selecciona una opción a continuación para empezar y mantente atento: <strong className="text-white">¡nuestra base de ingeniería está preparando nuevas funciones para tu próxima misión!</strong>
          </p>
          
          
        </motion.div>
      </div>
    </div>
  );
}
