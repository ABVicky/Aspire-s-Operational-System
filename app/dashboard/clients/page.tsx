'use client';

import { useEffect, useState, useCallback } from 'react';
import { Client } from '@/lib/types';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/api';
import { Skeleton, EmptyState, ClientModal } from '@/components/shared';
import { 
  Building2, Plus, Mail, Phone, Search, 
  MoreVertical, Pencil, Trash2, ChevronRight, CheckCircle2, 
  Clock, AlertTriangle, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_ICONS = {
  paid: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  partial: <Clock className="w-4 h-4 text-amber-500" />,
  pending: <Clock className="w-4 h-4 text-slate-400" />,
  overdue: <AlertTriangle className="w-4 h-4 text-red-500" />,
};

const STATUS_COLORS = {
  paid: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/30',
  partial: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
  pending: 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50',
  overdue: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setClients(await getClients()); } finally { setLoading(false); }
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all associated project data.`)) return;
    try {
      await deleteClient(id);
      toast.success('Client deleted successfully');
      load();
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Clients</h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">{filtered.length} total clients</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 text-sm"
        >
          <Plus className="w-5 h-5" /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
        <input
          type="text"
          placeholder="Filter clients by name or company..."
          className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-3xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          icon={<Building2 className="w-10 h-10 text-slate-200" />} 
          title="No clients found" 
          description="Refine your search or add a new client record." 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(client => (
            <div 
              key={client.id} 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 p-5 md:p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col items-start gap-4 active:scale-[0.98] cursor-pointer"
            >
              {/* Payment status badge */}
              <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${STATUS_COLORS[client.paymentStatus]}`}>
                {STATUS_ICONS[client.paymentStatus]}
                {client.paymentStatus}
              </div>

              {/* Client Info */}
              <div className="flex items-start gap-4 pr-16 w-full">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100/50 dark:border-white/5 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg tracking-tight truncate">{client.name}</h3>
                  <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 truncate">
                    {client.company?.toUpperCase() || 'EXTERNAL'}
                  </p>
                </div>
              </div>

              {/* Contact grid */}
              <div className="grid grid-cols-1 gap-1.5 w-full pt-2">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <div className="w-7 h-7 bg-slate-50 dark:bg-slate-950/40 rounded-lg flex items-center justify-center border border-slate-100 dark:border-white/5"><Mail className="w-3.5 h-3.5 text-slate-400" /></div>
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <div className="w-7 h-7 bg-slate-50 dark:bg-slate-950/40 rounded-lg flex items-center justify-center border border-slate-100 dark:border-white/5"><Phone className="w-3.5 h-3.5 text-slate-400" /></div>
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="w-full flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <button onClick={(e) => { e.stopPropagation(); setEditingClient(client); setIsModalOpen(true); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all active:scale-95 shadow-sm border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(client.id, client.name); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all active:scale-95 shadow-sm border border-transparent hover:border-red-100 dark:hover:border-red-500/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest flex items-center gap-1.5 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                  View Projects <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingClient(null); }}
        client={editingClient}
        onSuccess={load}
      />
    </div>
  );
}
