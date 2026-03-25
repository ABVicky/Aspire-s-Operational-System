'use client';

import { useState, useEffect } from 'react';
import { Client, PaymentStatus } from '@/lib/types';
import { createClient, updateClient } from '@/lib/api';
import { Modal } from './Modal';
import { toast } from 'sonner';
import { Loader2, Building2, User, Mail, Phone, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess: (client: Client) => void;
}

export function ClientModal({ isOpen, onClose, client, onSuccess }: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    paymentStatus: 'pending',
  });

  const isEdit = !!client;

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData(client);
      } else {
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          paymentStatus: 'pending',
        });
      }
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }

    setLoading(true);
    try {
      const res = isEdit 
        ? await updateClient(client!.id, formData)
        : await createClient(formData as any);

      toast.success(isEdit ? 'Client updated successfully' : 'Client created successfully');
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 dark:text-white";
  const labelClass = "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Update Client Record' : 'Register New Client'} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name */}
          <div className="md:col-span-2">
            <label className={labelClass}><User className="w-3 h-3" /> Point of Contact</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              className={inputClass}
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <label className={labelClass}><Building2 className="w-3 h-3" /> Organization</label>
            <input
              type="text"
              placeholder="e.g. Acme Corporation"
              className={inputClass}
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            />
          </div>

          {/* Email */}
          <div>
            <label className={labelClass}><Mail className="w-3 h-3" /> Business Email</label>
            <input
              type="email"
              required
              placeholder="john@example.com"
              className={inputClass}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}><Phone className="w-3 h-3" /> Direct Phone</label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className={inputClass}
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Payment Status (for new clients too) */}
          <div className="md:col-span-2">
            <label className={labelClass}><CreditCard className="w-3 h-3" /> Payment Status</label>
            <select
              className={inputClass}
              value={formData.paymentStatus}
              onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-[1.5rem] transition-all text-xs uppercase tracking-widest"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-widest border border-white/10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? 'Save Changes' : 'Confirm Registration'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
