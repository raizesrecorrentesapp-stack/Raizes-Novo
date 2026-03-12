
import React, { useState } from 'react';
import { Client, Appointment, Service } from '../types';
import { formatCurrency, formatDate, parseLocalDate } from '../utils/calculations';
import { 
  UserPlus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  X, 
  ArrowLeft, 
  Trash2, 
  Edit,
  Clock,
  Calendar,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Scissors,
  AlertTriangle
} from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  appointments: Appointment[];
  services: Service[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ 
  clients, 
  appointments,
  services,
  onAddClient, 
  onUpdateClient, 
  onDeleteClient 
}) => {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Client>({
    id: '',
    name: '',
    phone: '',
    email: '',
    birthday: '',
    address: '',
    instagram: '',
    notes: '',
    status: 'active'
  });

  const generateId = () => {
    const nextNum = clients.length + 1;
    return `C${String(nextNum).padStart(3, '0')}`;
  };

  const handleOpenForm = () => {
    setFormData({
      id: generateId(),
      name: '',
      phone: '',
      email: '',
      birthday: '',
      address: '',
      instagram: '',
      notes: '',
      status: 'active'
    });
    setSuccessMsg('');
    setIsEditing(false);
    setView('form');
    setSelectedClient(null);
  };

  const handleEditClient = (client: Client) => {
    setFormData(client);
    setSuccessMsg('');
    setIsEditing(true);
    setView('form');
  };

  const handleDeleteClientAttempt = (client: Client) => {
    if (window.confirm(`Confirmar exclusão definitiva do cliente ${client.name}?`)) {
        onDeleteClient(client.id);
        if (selectedClient?.id === client.id) {
            setView('list');
            setSelectedClient(null);
        }
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setView('details');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedClient(null);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
        onUpdateClient(formData);
        setSuccessMsg(`Cliente atualizado.`);
    } else {
        onAddClient(formData);
        setSuccessMsg(`Cliente cadastrado.`);
    }
    setTimeout(() => {
        setView('list');
        setSuccessMsg('');
    }, 1500);
  };

  const getClientStats = (clientId: string) => {
    const clientAppointments = appointments
      .filter(a => a.clientId === clientId && a.status === 'Concluído')
      .sort((a, b) => b.date.localeCompare(a.date));
    
    const totalSpent = clientAppointments.reduce((acc, a) => acc + a.totalValue, 0);
    
    const lastAppt = clientAppointments[0];
    let maintenanceStatus: 'active' | 'maintenance' | 'inactive' = 'inactive';
    
    if (lastAppt) {
      const lastDate = parseLocalDate(lastAppt.date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30) maintenanceStatus = 'active';
      else if (diffDays <= 45) maintenanceStatus = 'maintenance';
      else maintenanceStatus = 'inactive';
    }
    
    return {
      history: clientAppointments,
      totalSpent,
      count: clientAppointments.length,
      maintenanceStatus,
      lastVisit: lastAppt?.date
    };
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const stats = getClientStats(c.id);
    return matchesSearch && stats.maintenanceStatus === filterStatus;
  });

  const getMaintenanceBadge = (status: 'active' | 'maintenance' | 'inactive') => {
    switch (status) {
      case 'active':
        return { label: 'Em dia', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      case 'maintenance':
        return { label: 'Manutenção', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'inactive':
        return { label: 'Atrasado', color: 'bg-red-100 text-red-700 border-red-200' };
    }
  };

  const InfoField = ({ icon: Icon, label, value, isLink, linkType }: any) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</span>
        {isLink && value ? (
          <a 
            href={linkType === 'instagram' ? `https://instagram.com/${value.replace('@', '')}` : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-accent hover:underline truncate"
          >
            {value}
          </a>
        ) : (
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{value || '---'}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {view === 'list' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 w-4 h-4 transition-colors" />
              <input 
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none shadow-xs focus:border-slate-400 transition-all text-xs font-medium"
              />
            </div>
            <button
              onClick={handleOpenForm}
              className="px-6 py-3 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition hover:brightness-110 text-xs uppercase tracking-widest"
            >
              <UserPlus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { id: 'all', label: 'Todos', icon: User, count: clients.length },
              { id: 'active', label: 'Em dia', icon: CheckCircle2, count: clients.filter(c => getClientStats(c.id).maintenanceStatus === 'active').length },
              { id: 'maintenance', label: 'Manutenção', icon: Clock, count: clients.filter(c => getClientStats(c.id).maintenanceStatus === 'maintenance').length },
              { id: 'inactive', label: 'Atrasados', icon: AlertTriangle, count: clients.filter(c => getClientStats(c.id).maintenanceStatus === 'inactive').length }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border whitespace-nowrap ${
                  filterStatus === filter.id 
                    ? 'bg-accent text-white border-accent shadow-md' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <filter.icon className="w-3.5 h-3.5" />
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredClients.map(client => (
            <div 
              key={client.id} 
              onClick={() => handleViewClient(client)}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-accent dark:hover:border-accent/50 transition-all group cursor-pointer shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                  {client.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getMaintenanceBadge(getClientStats(client.id).maintenanceStatus).color}`}>
                    {getMaintenanceBadge(getClientStats(client.id).maintenanceStatus).label}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate tracking-tight">{client.name}</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 mb-5">{client.id}</p>
              
              <div className="space-y-2 border-t border-slate-50 dark:border-slate-800/50 pt-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 opacity-50" />
                    <span>{client.phone || 'Sem contato'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                    <DollarSign className="w-3 h-3" />
                    <span>{formatCurrency(getClientStats(client.id).totalSpent)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  <Calendar className="w-3 h-3 opacity-50" />
                  <span>Última: {getClientStats(client.id).lastVisit ? formatDate(getClientStats(client.id).lastVisit!) : 'Nunca'}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-100 dark:border-slate-800">
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      )}

      {view === 'details' && selectedClient && (
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <button onClick={handleBackToList} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar
            </button>
            <div className="flex gap-2">
              <button onClick={() => handleEditClient(selectedClient)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-accent transition shadow-xs"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteClientAttempt(selectedClient)} className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-red-500 transition shadow-xs"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
             <div className="w-24 h-24 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-4xl font-black shrink-0">
                {selectedClient.name.charAt(0)}
             </div>
             <div className="text-center sm:text-left min-w-0">
               <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">{selectedClient.name}</h2>
               <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedClient.id}</span>
                  <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${selectedClient.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedClient.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {selectedClient.status === 'active' ? 'Conta Ativa' : 'Inativo'}
                  </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Informações de Contato</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <InfoField icon={Phone} label="Telefone / WhatsApp" value={selectedClient.phone} />
                </div>
                {selectedClient.phone && (
                  <button 
                    onClick={() => handleWhatsApp(selectedClient.phone!)}
                    className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm"
                    title="Chamar no WhatsApp"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              <InfoField icon={Mail} label="Email Registrado" value={selectedClient.email} />
              <InfoField icon={Calendar} label="Data de Nascimento" value={selectedClient.birthday ? formatDate(selectedClient.birthday) : 'Não informado'} />
              <InfoField icon={MessageCircle} label="Instagram" value={selectedClient.instagram} isLink linkType="instagram" />
              <InfoField icon={FileText} label="Endereço" value={selectedClient.address} />
              <InfoField icon={Clock} label="Última Visita" value={selectedClient.lastVisit || 'Nenhuma visita registrada'} />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Resumo Financeiro</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Investido</p>
                  <p className="text-xl font-black text-emerald-600">{formatCurrency(getClientStats(selectedClient.id).totalSpent)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Visitas Concluídas</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">{getClientStats(selectedClient.id).count}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm md:col-span-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Histórico de Serviços</h4>
              <div className="overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {getClientStats(selectedClient.id).history.length > 0 ? (
                    getClientStats(selectedClient.id).history.map((appt) => {
                      const service = services.find(s => s.id === appt.serviceId);
                      return (
                        <div key={appt.id} className="py-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <Scissors className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{service?.name || 'Serviço'}</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{formatDate(appt.date)} • {appt.startTime}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{formatCurrency(appt.totalValue)}</p>
                            <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Concluído</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-slate-400 text-xs italic">
                      Nenhum histórico de serviços encontrado para este cliente.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm md:col-span-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Notas Internas</h4>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[120px]">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {selectedClient.notes || "Nenhuma observação relevante registrada para este cliente."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'form' && (
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {isEditing ? 'Atualizar Cliente' : 'Cadastro de Cliente'}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão estratégica de perfil</p>
              </div>
              <button 
                type="button" 
                onClick={handleBackToList}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-8">
              {/* Section: Identificação */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-accent rounded-full" />
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Identificação & Status</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Código ID</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required 
                        type="text" 
                        value={formData.id} 
                        disabled={isEditing} 
                        onChange={e => setFormData({...formData, id: e.target.value})} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm disabled:opacity-50 text-slate-900 dark:text-slate-100 focus:border-accent transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Situação da Conta</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-accent transition-all"
                    >
                      <option value="active">Conta Ativa</option>
                      <option value="inactive">Inativo / Bloqueado</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-accent transition-all" 
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Contato & Social */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-accent rounded-full" />
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Contato & Social</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-accent transition-all" 
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Instagram</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.instagram} 
                        onChange={e => setFormData({...formData, instagram: e.target.value})} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-accent transition-all" 
                        placeholder="@usuario"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-accent transition-all" 
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data de Nascimento</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={formData.birthday} 
                        onChange={e => setFormData({...formData, birthday: e.target.value})} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-accent transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Localização & Notas */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-accent rounded-full" />
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Localização & Observações</h4>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Endereço Residencial</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.address} 
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-bold text-sm text-slate-900 dark:text-slate-100 focus:border-accent transition-all" 
                      placeholder="Rua, Número, Bairro, Cidade"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Notas de Preferência</label>
                  <textarea 
                    rows={3} 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-medium text-xs text-slate-900 dark:text-slate-100 resize-none focus:border-accent transition-all" 
                    placeholder="Ex: Prefere café sem açúcar, gosta de tranças mais apertadas..." 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
              <button 
                type="submit" 
                className="flex-1 py-4 bg-accent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-accent/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isEditing ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </button>
              <button 
                type="button" 
                onClick={handleBackToList} 
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Descartar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {successMsg && (
        <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-50 border border-white/10">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-widest">{successMsg}</span>
        </div>
      )}
    </div>
  );
};
