'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import { User } from '@/lib/types';
import { updateUser, uploadAvatar } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, User as UserIcon, Mail, ShieldCheck, Camera, Phone } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, login: updateSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || 'Creative',
      });
      setIsEditing(false);
      setImgError(false);
    }
  }, [user, isOpen]);

  const handleAvatarClick = () => {
    document.getElementById('avatar-upload')?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await uploadAvatar(user.id, base64, file.name);
        console.log('Avatar upload result:', result);
        setImgError(false);
        updateSession({ ...user, avatar: result.avatar });
        toast.success('Avatar updated!');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const updatedUser = await updateUser({
        id: user.id,
        email: formData.email,
        phone: formData.phone
      });
      
      updateSession(updatedUser);
      toast.success('Identity updated!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update identity');
    } finally {
      setLoading(false);
    }
  };

  const processedAvatar = useMemo(() => {
    const src = user?.avatar;
    if (!src) return src;
    if (src.includes('drive.google.com') || src.includes('googleusercontent.com')) {
      const idMatch = src.match(/\/d\/([^/]+)/) || src.match(/[?&]id=([^&]+)/);
      if (idMatch && idMatch[1]) {
        return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
      }
    }
    return src;
  }, [user?.avatar]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Identity" maxWidth="md">
      <div className="space-y-8">
        {/* Digital ID Card Header */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] -ml-32 -mb-32" />
          
          <div className="relative flex flex-col items-center sm:flex-row gap-8">
            <div className="relative group/avatar cursor-pointer" onClick={handleAvatarClick}>
              <div className="w-28 h-28 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-600/40 border-4 border-white/20 overflow-hidden uppercase relative">
                {uploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (processedAvatar && !imgError) ? (
                  <img 
                    src={processedAvatar} 
                    alt={user?.name || ''} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                    onError={() => {
                      console.error('Avatar load failed (ProfileModal) for:', processedAvatar);
                      setImgError(true);
                    }}
                  />
                ) : (
                  user?.name ? user.name.charAt(0) : '?'
                )}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-slate-900 shadow-lg" />
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100">{user?.role} Verified</span>
              </div>
              <h3 className="text-3xl font-black tracking-tighter font-display mb-1">{user?.name}</h3>
              <p className="text-indigo-200/60 text-sm font-bold uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">
            <span>Aspire Digital Media</span>
            <span>{user?.department || 'Creative'} Team</span>
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/50 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Employee ID</p>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">#{user?.id.replace('u_', '')}</p>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200/50 dark:border-white/5">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Contact Number</p>
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">
                  {user?.phone || 'Not Setup'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-slate-950 dark:bg-indigo-600 text-white font-black rounded-[2rem] transition-all shadow-xl dark:shadow-indigo-600/30 hover:shadow-indigo-500/10 active:scale-95 group"
            >
              <span>Modify Details</span>
              <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 transition-colors border border-white/5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Full Name <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[8px] tracking-normal border border-slate-300 dark:border-white/5">Locked</span>
                </label>
                <div className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed">
                  {formData.name}
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                  Department <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[8px] tracking-normal border border-slate-300 dark:border-white/5">Locked</span>
                </label>
                <div className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed">
                  {formData.department}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Email"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl transition-all text-[11px] uppercase tracking-widest active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 text-[11px] uppercase tracking-widest active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
