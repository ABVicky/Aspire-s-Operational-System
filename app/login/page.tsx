'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { login as apiLogin } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldAlert, Cpu, Lock, AlertTriangle, Power } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const constraintsRef = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return { current: document.body };
  }, []); // Simple mock for SSR

  const [email, setEmail] = useState('');
  // ... (rest of states)
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const [systemStats, setSystemStats] = useState({
    cpu: 'X12',
    ram: '65536KB',
    res: '640x480',
    net: 'SECURE-COMM-7'
  });

  // Gather Real-Time System Telemetry
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cores = navigator.hardwareConcurrency || 8;
      const mem = (navigator as any).deviceMemory || 16;
      const width = window.screen.width;
      const height = window.screen.height;
      const connection = (navigator as any).connection?.effectiveType || 'FIBER';

      setSystemStats({
        cpu: `${cores}X CORE-SYNC`,
        ram: `${mem}GB OK`,
        res: `${width}x${height}`,
        net: `${connection.toUpperCase()}-STABLE`
      });
    }
  }, []);

  const bootSequence = useMemo(() => [
    { text: "ASPIRE-OS(R) BIOS V4.0.28 (C) 1994 DIGITAL MEDIA", delay: 600 },
    { text: `CPU: ${systemStats.cpu} @ 4.2GHZ`, delay: 400 },
    { text: `MEMORY TEST: ${systemStats.ram}`, delay: 800 },
    { text: `VIDEO: ${systemStats.res} HIGH-COLOR`, delay: 500 },
    { text: `NETWORK: ${systemStats.net} ESTABLISHED`, delay: 400 },
    { text: "SEARCHING FOR AGENT CREDENTIALS...", delay: 600 },
    { text: "READY.", delay: 300 },
  ], [systemStats]);

  useEffect(() => {
    // Reset transition state for the dashboard upon reaching login
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dashboard_transition_complete');
    }

    if (bootStep < bootSequence.length) {
      const timer = setTimeout(() => {
        setBootStep(prev => prev + 1);
      }, bootSequence[bootStep].delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsBooting(false), 800);
      return () => clearTimeout(timer);
    }
  }, [bootStep, bootSequence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('INPUT ERROR: MISSING PARAMETERS');
      return;
    }

    setLoading(true);
    try {
      const user = await apiLogin(email.trim(), password);
      // Trigger "Cool Entrance" Animation
      setIsEntering(true);
      setTimeout(() => {
        login(user);
        router.push('/dashboard');
      }, 1200); // Wait for collapse animation
    } catch (err: unknown) {
      toast.error('SECURITY ERROR: ACCESS DENIED');
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden font-mono bg-[radial-gradient(circle_at_center,rgba(176,30,106,0.05)_0%,transparent_70%)]">
      
      {/* CRT Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(176,30,106,0.03),rgba(0,255,0,0.01),rgba(176,30,106,0.03))] bg-[length:100%_3px,2px_100%]" />
        {/* Screen Flicker */}
        <div className="absolute inset-0 bg-white/5 mix-blend-overlay animate-flicker pointer-events-none" />
        {/* Static Grain */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-screen bg-[url('https://grainy-gradients.vercel.app/noise.svg')] invert" />
      </div>

      {/* Digital Collapse Animation Overlay */}
      <AnimatePresence>
        {isEntering && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none bg-black/0"
          >
            <motion.div 
              initial={{ scaleY: 0.005, scaleX: 1, backgroundColor: "#b01e6a" }}
              animate={{ 
                scaleY: [0.005, 0.005, 0.005, 120], 
                scaleX: [1, 1, 0.01, 0.01],
                backgroundColor: ["#b01e6a", "#b01e6a", "#fff", "#fff"],
              }}
              transition={{ duration: 1.2, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
              className="w-full h-[2px] shadow-[0_0_100px_#fff,0_0_20px_#b01e6a]" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isBooting ? (
          <motion.div 
            key="bootup"
            exit={{ opacity: 0, filter: "brightness(2)" }}
            className="z-10 w-full max-w-xl p-8"
          >
            <div className="space-y-1">
              {bootSequence.slice(0, bootStep).map((item: any, i: number) => (
                <motion.p 
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[#b01e6a]/80 text-sm md:text-base tracking-widest leading-relaxed uppercase"
                >
                  {item.text}
                </motion.p>
              ))}
              {bootStep < bootSequence.length && (
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  className="inline-block w-2.5 h-6 bg-[#b01e6a]/80 align-middle ml-1"
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="login-terminal"
            drag
            dragConstraints={constraintsRef as any}
            dragElastic={0.05}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: isEntering ? 0 : 1, scale: isEntering ? 0.95 : 1 }}
            className="relative z-10 w-full max-w-lg cursor-grab active:cursor-grabbing"
          >
            <div className="bg-black border-2 border-[#b01e6a]/30 p-10 md:p-14 shadow-[0_0_50px_rgba(176,30,106,0.1)] rounded-lg relative overflow-hidden group">
              {/* Screen Distortion Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(176,30,106,0.03)_0%,transparent_100%)] pointer-events-none" />
              
              <div className="border-b-2 border-[#b01e6a]/20 pb-8 mb-10 text-center">
                <div className="flex justify-center mb-6">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="p-3 bg-white/95 border-2 border-[#b01e6a]/40 rounded-3xl min-w-[72px] min-h-[72px] flex items-center justify-center shadow-xl shadow-[#b01e6a]/10"
                  >
                    <img 
                      src="/logo.png" 
                      alt="Logo" 
                      className="w-16 h-16 object-contain" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.style.backgroundColor = '#b01e6a';
                          parent.innerHTML = '<span class="text-white font-black text-4xl">A</span>';
                        }
                      }}
                    />
                  </motion.div>
                </div>
                <h1 className="text-4xl font-black text-[#b01e6a] tracking-[0.2em] mb-2 uppercase">TERMINAL-OS</h1>
                <p className="text-[10px] font-bold text-[#b01e6a]/60 uppercase tracking-[0.5em]">SYSTEM ACCESS LEVEL: OMEGA</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="relative group/input">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-[#b01e6a]/70 uppercase tracking-widest">Agent_ID</label>
                      <Terminal className="w-3 h-3 text-[#b01e6a]/30" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="USER_NAME"
                      className="w-full bg-black border-2 border-[#b01e6a]/20 px-6 py-4 text-[#b01e6a] placeholder-[#b01e6a]/10 focus:outline-none focus:border-[#b01e6a] transition-all text-sm tracking-widest rounded-md"
                      disabled={loading || isEntering}
                    />
                  </div>

                  <div className="relative group/input">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-[#b01e6a]/70 uppercase tracking-widest">Security_Cipher</label>
                      <Lock className="w-3 h-3 text-[#b01e6a]/30" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full bg-black border-2 border-[#b01e6a]/20 px-6 py-4 text-[#b01e6a] placeholder-[#b01e6a]/10 focus:outline-none focus:border-[#b01e6a] transition-all text-sm tracking-widest rounded-md"
                      disabled={loading || isEntering}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading || isEntering}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(176,30,106,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 border-2 border-[#b01e6a] text-[#b01e6a] font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn disabled:opacity-50 hover-glitch"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin text-xl">/</span>
                        VALIDATING...
                      </div>
                    ) : (
                      <>INITIALIZE PORTAL</>
                    )}
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-[#b01e6a]/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </motion.button>
                </div>
              </form>

              {/* System Messages */}
              <div className="mt-10 pt-6 border-t border-[#b01e6a]/10 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[8px] font-bold text-[#b01e6a]/40 uppercase">
                  <AlertTriangle className="w-3 h-3" /> Warning: Unauthorised access is strictly prohibited
                </div>
                <div className="flex justify-between items-center text-[8px] font-bold text-[#b01e6a]/30 uppercase">
                  <span>LAT: 22.5726 N</span>
                  <span>LNG: 88.3639 E</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[#b01e6a]/20 text-[10px] uppercase tracking-[0.6em] mt-12">
              (C) DIGITAL ASPIRE CORP. MCMLXXIV
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.95; }
          10% { opacity: 0.9; }
          15% { opacity: 0.95; }
          25% { opacity: 0.95; }
          30% { opacity: 1; }
          100% { opacity: 0.98; }
        }
        .animate-flicker {
          animation: flicker 0.15s infinite;
        }
      `}</style>
    </main>
  );
}
