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
  const [isBooting, setIsBooting] = useState(false);
  const [bootStep, setBootStep] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  
  // ... (systemStats remains for logo/UI but no delay)

  useEffect(() => {
    // Ensure transition flag is always clean
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dashboard_transition_complete');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('INPUT ERROR: MISSING PARAMETERS');
      return;
    }

    setLoading(true);
    try {
      const user = await apiLogin(email.trim(), password);
      // Login and redirect INSTANTLY
      login(user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'UNKNOWN SECURITY BREACH';
      toast.error(`SECURITY ERROR: ${msg.toUpperCase()}`);
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden font-mono bg-[radial-gradient(circle_at_center,rgba(255,31,139,0.15)_0%,transparent_70%)]">
      
      {/* CRT Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Scanlines */}
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%),linear-gradient(90deg,rgba(255,31,139,0.03),rgba(0,255,0,0.01),rgba(255,31,139,0.03))] bg-[length:100%_3px,2px_100%]" />
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
              initial={{ scaleY: 0.005, scaleX: 1, backgroundColor: "#ff1f8b" }}
              animate={{ 
                scaleY: [0.005, 0.005, 0.005, 120], 
                scaleX: [1, 1, 0.01, 0.01],
                backgroundColor: ["#ff1f8b", "#ff1f8b", "#fff", "#fff"],
              }}
              transition={{ duration: 1.2, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
              className="w-full h-[2px] shadow-[0_0_100px_#fff,0_0_20px_#ff1f8b]" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div 
          key="login-terminal"
          drag={typeof window !== 'undefined' && window.innerWidth > 768}
          dragConstraints={constraintsRef as any}
          dragElastic={0.05}
          dragMomentum={false}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-lg cursor-grab active:cursor-grabbing sm:p-0 p-4"
        >
            <div className="bg-black border-2 border-[#ff1f8b] p-10 md:p-14 shadow-[0_0_80px_rgba(255,31,139,0.25)] rounded-lg relative overflow-hidden group">
              {/* Screen Distortion Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,31,139,0.1)_0%,transparent_100%)] pointer-events-none" />
              
              <div className="border-b-2 border-[#ff1f8b] pb-8 mb-10 text-center">
                <div className="flex justify-center mb-6">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="p-3 bg-white/95 border-2 border-[#ff1f8b] rounded-3xl min-w-[72px] min-h-[72px] flex items-center justify-center shadow-xl shadow-[#ff1f8b]/20"
                  >
                    <img 
                      src="/logo.png" 
                      alt="Logo" 
                      className="w-16 h-16 object-contain" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.style.backgroundColor = '#ff1f8b';
                          parent.innerHTML = '<span class="text-white font-black text-4xl">A</span>';
                        }
                      }}
                    />
                  </motion.div>
                </div>
                <h1 className="text-4xl font-black text-[#ff1f8b] tracking-[0.2em] mb-2 uppercase drop-shadow-[0_0_10px_rgba(255,31,139,0.5)]">TERMINAL-OS</h1>
                <p className="text-[10px] font-bold text-[#ff1f8b] uppercase tracking-[0.5em]">SYSTEM ACCESS LEVEL: OMEGA</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="relative group/input">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-[#ff1f8b] uppercase tracking-widest">Agent_ID</label>
                      <Terminal className="w-3 h-3 text-[#ff1f8b]/50" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="USER_NAME"
                      className="w-full bg-black border-2 border-[#ff1f8b]/30 px-6 py-4 text-[#ff1f8b] placeholder-[#ff1f8b]/20 focus:outline-none focus:border-[#ff1f8b] transition-all text-sm tracking-widest rounded-md"
                      disabled={loading || isEntering}
                    />
                  </div>

                  <div className="relative group/input">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-bold text-[#ff1f8b] uppercase tracking-widest">Security_Cipher</label>
                      <Lock className="w-3 h-3 text-[#ff1f8b]/50" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="********"
                      className="w-full bg-black border-2 border-[#ff1f8b]/30 px-6 py-4 text-[#ff1f8b] placeholder-[#ff1f8b]/20 focus:outline-none focus:border-[#ff1f8b] transition-all text-sm tracking-widest rounded-md"
                      disabled={loading || isEntering}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={loading || isEntering}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,31,139,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 border-2 border-[#ff1f8b] text-[#ff1f8b] font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group/btn disabled:opacity-50 hover-glitch shadow-[0_0_20px_rgba(255,31,139,0.2)]"
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
                    <div className="absolute inset-0 bg-[#ff1f8b]/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </motion.button>
                </div>
              </form>

              {/* System Messages */}
              <div className="mt-10 pt-6 border-t border-[#ff1f8b]/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[8px] font-bold text-[#ff1f8b]/80 uppercase">
                  <AlertTriangle className="w-3 h-3" /> Warning: Unauthorised access is strictly prohibited
                </div>
                <div className="flex justify-between items-center text-[8px] font-bold text-[#ff1f8b]/60 uppercase">
                  <span>LAT: 22.5726 N</span>
                  <span>LNG: 88.3639 E</span>
                </div>
              </div>
            </div>

            <p className="text-center text-[#ff1f8b]/60 text-[10px] uppercase tracking-[0.6em] mt-12">
              (C) DIGITAL ASPIRE CORP. MCMLXXIV
            </p>
          </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        :root {
          --terminal-primary: #ff1f8b;
          --terminal-glow: rgba(255, 31, 139, 0.4);
        }
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
