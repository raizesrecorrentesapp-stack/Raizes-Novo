
import React, { useState } from 'react';
import { Lead, LeadStatus, LeadSource, Service, Client, Appointment } from '../types';
import { formatCurrency, getLocalISODate } from '../utils/calculations';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  MessageCircle, 
  UserPlus, 
  Calendar as CalendarIcon,
  Clock,
  Instagram,
  Globe,
  Smartphone,
  Users,
  CheckCircle2,
  X,
  Phone,
  Tag,
  ChevronRight,
  TrendingUp,
  Scissors,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeadsManagerProps {
  leads: Lead[];
  services: Service[];
  onAddLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onConvertToAppointment: (lead: Lead) => void;
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string; border: string }> = {
  novo: { label: 'Novo', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  em_contato: { label: 'Em Contato', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  negociando: { label: 'Negociando', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  confirmado: { label: 'Confirmado', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  perdido: { label: 'Perdido', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
};

const sourceIcons: Record<LeadSource, any> = {
  Instagram: Instagram,
  TikTok: Globe,
  WhatsApp: MessageCircle,
  Google: Globe,
  Indicação: Users,
  Presencial: UserPlus,
  Outro: Tag
};

export const LeadsManager: React.FC<LeadsManagerProps> = ({
  leads,
  services,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onConvertToAppointment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<LeadStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: '',
    phone: '',
    source: 'Instagram',
    status: 'novo',
    serviceInterest: '',
    notes: ''
  });

  const filteredLeads = leads
    .filter(l => {
      const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           l.phone?.includes(searchTerm);
      const matchesFilter = activeFilter === 'all' || l.status === activeFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData(lead);
    } else {
      setEditingLead(null);
      setFormData({
        name: '',
        phone: '',
        source: 'Instagram',
        status: 'novo',
        serviceInterest: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      ...formData,
      id: editingLead?.id || window.crypto.randomUUID(),
      createdAt: editingLead?.createdAt || new Date().toISOString(),
      lastContactAt: new Date().toISOString(),
    } as Lead;

    if (editingLead) {
      onUpdateLead(leadData);
    } else {
      onAddLead(leadData);
    }
    setIsModalOpen(false);
  };

  const getStatusCount = (status: LeadStatus | 'all') => {
    if (status === 'all') return leads.length;
    return leads.filter(l => l.status === status).length;
  };

  const openWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)] overflow-hidden animate-fade-in">
      
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 space-y-2 shrink-0 overflow-y-auto pr-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-4">Status dos Leads</h3>
        
        <button
          onClick={() => setActiveFilter('all')}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeFilter === 'all' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-bold">Todos os Leads</span>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeFilter === 'all' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>{getStatusCount('all')}</span>
        </button>

        {(['novo', 'em_contato', 'negociando', 'confirmado', 'perdido'] as LeadStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${activeFilter === status ? statusConfig[status].bg + ' ' + statusConfig[status].color : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${activeFilter === status ? 'bg-current' : statusConfig[status].bg.replace('50', '500')}`} />
              <span className="text-sm font-bold">{statusConfig[status].label}</span>
            </div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeFilter === status ? 'bg-current/10' : 'bg-slate-100 dark:bg-slate-800'}`}>{getStatusCount(status)}</span>
          </button>
        ))}
      </div>

      {/* Main Content (WhatsApp Style List) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Header/Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou celular..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="w-full sm:w-auto px-6 py-3 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Lead
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredLeads.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Nenhum lead encontrado</h3>
              <p className="text-sm text-slate-500 max-w-xs mt-1">
                Tente ajustar seus filtros ou busque por um nome diferente.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.map(lead => {
                const config = statusConfig[lead.status];
                const SourceIcon = sourceIcons[lead.source];
                const initials = lead.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                return (
                  <div 
                    key={lead.id} 
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative cursor-pointer"
                    onClick={() => handleOpenModal(lead)}
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 shadow-sm ${config.bg.replace('50', '500')}`}>
                      {initials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-black text-slate-800 dark:text-slate-100 truncate pr-4">{lead.name}</h4>
                        <span className="text-[9px] font-medium text-slate-400 shrink-0">
                          {new Date(lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${config.bg} ${config.color} ${config.border}`}>
                          {config.label}
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[8px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                          <SourceIcon className="w-2.5 h-2.5" /> {lead.source}
                        </span>
                        {lead.serviceInterest && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-800">
                            <Scissors className="w-2.5 h-2.5" /> {lead.serviceInterest}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {lead.notes || 'Sem observações adicionais...'}
                      </p>
                    </div>

                    {/* Actions Overlay/Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bottom-4">
                      {lead.phone && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); openWhatsApp(lead.phone); }}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:brightness-110 shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      )}
                      {lead.status !== 'confirmado' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onConvertToAppointment(lead); }}
                          className="p-2 bg-accent text-white rounded-lg hover:brightness-110 shadow-lg shadow-accent/20 active:scale-90 transition-all"
                          title="Converter em Agendamento"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal / Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                      {editingLead ? 'Editar Lead' : 'Novo Lead'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Registre as informações do seu prospecto.</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">WhatsApp / Celular</label>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Origem do Lead</label>
                      <select
                        value={formData.source}
                        onChange={e => setFormData({ ...formData, source: e.target.value as LeadSource })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent/20"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Google">Google Search</option>
                        <option value="Indicação">Indicação</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Outro">Outros</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Status Atual</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent/20"
                      >
                        <option value="novo">🔵 Novo</option>
                        <option value="em_contato">🟡 Em Contato</option>
                        <option value="negociando">🟣 Negociando</option>
                        <option value="confirmado">🟢 Confirmado</option>
                        <option value="perdido">🔴 Perdido</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Serviço de Interesse</label>
                      <input
                        type="text"
                        placeholder="Ex: Tranças, Corte..."
                        value={formData.serviceInterest}
                        onChange={e => setFormData({ ...formData, serviceInterest: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Observações / Histórico</label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Dúvidas do cliente, o que foi conversado..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-accent/20 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button type="submit" className="flex-1 py-4 bg-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 transition-all">
                    {editingLead ? 'Salvar Alterações' : 'Criar Lead'}
                  </button>
                  {editingLead && (
                    <button 
                      type="button" 
                      onClick={() => { if(window.confirm('Excluir este lead permanentemente?')) { onDeleteLead(editingLead.id); setIsModalOpen(false); } }}
                      className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


