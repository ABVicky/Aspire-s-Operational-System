'use client';

import { Modal } from './Modal';
import { LogOut, AlertCircle } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="End Session" maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-[2rem] flex items-center justify-center border border-red-100 dark:border-red-900/30 shadow-inner">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center text-red-500 dark:text-red-400 shadow-sm border border-red-200/50 dark:border-red-500/20">
            <LogOut className="w-7 h-7" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-display">Ready to leave?</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-bold leading-relaxed px-4">
            You're about to sign out of <span className="text-slate-600 dark:text-slate-300">Aspire OS</span>. Any unsaved workspace changes may be lost.
          </p>
        </div>

        <div className="flex flex-col w-full gap-3 pt-4">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 active:scale-95 text-xs uppercase tracking-widest"
          >
            Confirm Logout
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest border border-transparent hover:border-slate-200 dark:hover:border-white/5"
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </Modal>
  );
}
