'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Cpu, Zap, Activity } from 'lucide-react';

export default function TransitionPortal() {
  const [phase, setPhase] = useState<'ancient' | 'glitch' | 'modern' | 'complete'>('ancient');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('glitch'), 1000),
      setTimeout(() => setPhase('modern'), 2500),
      setTimeout(() => setPhase('complete'), 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'complete') return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center bg-black overflow-hidden font-mono bg-[radial-gradient(circle_at_center,rgba(176,30,106,0.05)_0%,transparent_70%)]">
      
      {/* Initial Flash to bridge the 'Zap' from Login */}
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-white z-[10000]"
      />

      {/* CRT Overlay (Always active during the transition) */}
      {phase !== 'modern' && (
        <div className="absolute inset-0 z-50 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      )}

      {/* Phase 1: Ancient Terminal */}
      <AnimatePresence>
        {phase === 'ancient' && (
          <motion.div
            key="ancient"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px) brightness(2)" }}
            className="text-[#b01e6a] w-full max-w-lg p-8 space-y-2"
          >
            <p className="text-xs md:text-sm tracking-[0.2em]">[ SYSTEM_EVOLUTION_MODE_ACTIVE ]</p>
            <p className="text-xs md:text-sm tracking-[0.2em]">[ UPGRADE_INITIATED ]</p>
            <div className="flex items-center gap-3 pt-4">
              <Terminal className="w-5 h-5 animate-pulse" />
              <div className="h-1 flex-1 bg-[#b01e6a]/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="h-full bg-[#b01e6a]" 
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 2: Glitch Transition */}
      <AnimatePresence>
        {phase === 'glitch' && (
          <motion.div
            key="glitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-950/20 flex items-center justify-center"
          >
            <div className="relative w-full h-full">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * 100 - 50 + "%", 
                    y: Math.random() * 100 - 50 + "%",
                    width: Math.random() * 200 + 50,
                    height: Math.random() * 2 + 1,
                    opacity: 0
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    x: [Math.random() * 100 - 50 + "%", Math.random() * 100 - 50 + "%"],
                    backgroundColor: ["#b01e6a", "#4f46e5", "#fff"]
                  }}
                  transition={{ 
                    duration: 0.2, 
                    repeat: Infinity,
                    delay: Math.random() * 0.5
                  }}
                  className="absolute"
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                  className="text-white font-black text-6xl italic tracking-tighter"
                >
                  EVOLVING...
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase 3: Quantum Wipe Reveal */}
      <AnimatePresence>
        {phase === 'modern' && (
          <motion.div
            key="modern"
            initial={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 flex z-[100]"
            >
              <div className="w-[2px] h-full bg-white shadow-[0_0_50px_#fff]" />
              <div className="flex-1 h-full bg-gradient-to-l from-white/20 to-transparent backdrop-blur-sm" />
            </motion.div>
            
            {/* Dark background fading out to reveal dashboard */}
            <motion.div 
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute inset-0 bg-black"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes glitchWipe {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
